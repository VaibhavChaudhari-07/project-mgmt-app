import { useEffect, useState } from "react";
import { getUsers, createUser, updateUser, getRequiredUsers, updateRequiredUsers } from "../../services/user.service";
import { getTeams, createTeam } from "../../services/team.service";
import { getProjects } from "../../services/project.service";

export default function Members() {
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const myRole = currentUser?.role;

  // Only admin and pm can view this tab
  const canManageMembers = myRole === "admin" || myRole === "pm";

  // SECTION 1: Users state
  const [allUsers, setAllUsers] = useState([]);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");

  // SECTION 2: Required Users state
  const [requiredUsers, setRequiredUsers] = useState([]);

  // SECTION 3: Create Team state
  const [teamName, setTeamName] = useState("");
  const [selectedTeamMembers, setSelectedTeamMembers] = useState([]);
  const [openTeamMemberDropdown, setOpenTeamMemberDropdown] = useState(false);

  // SECTION 4: Display Teams state
  const [teams, setTeams] = useState([]);
  const [projects, setProjects] = useState([]);

  const loadUsers = async () => {
    const res = await getUsers();
    setAllUsers(res.data || []);
  };

  const loadTeams = async () => {
    const res = await getTeams();
    setTeams(res.data || []);
  };

  const loadRequiredUsers = async () => {
    try {
      const res = await getRequiredUsers();
      setRequiredUsers(res.data || []);
    } catch (err) {
      console.error("Failed to load required users", err);
    }
  };

  useEffect(() => {
    loadUsers();
    loadTeams();
    loadRequiredUsers();
    getProjects().then((res) => setProjects(res.data || []));
  }, []);

  // Filter users for section 1
  const filteredUsers = allUsers.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearchQuery.toLowerCase());
    const matchRole = userRoleFilter === "all" || u.role === userRoleFilter;
    return matchSearch && matchRole;
  });

  // Add user to required users
  const addToRequiredUsers = async (user) => {
    if (!requiredUsers.find((u) => u._id === user._id)) {
      const updated = [...requiredUsers, user];
      setRequiredUsers(updated);
      // Persist to backend
      try {
        await updateRequiredUsers(updated.map((u) => u._id));
      } catch (err) {
        console.error("Failed to save required users", err);
      }
    }
  };

  // Remove user from required users
  const removeFromRequiredUsers = async (userId) => {
    // Check if user is member of any project
    const userProjects = projects.filter(p => 
      p.members && p.members.some(m => (m._id || m) === userId)
    );
    
    if (userProjects.length > 0) {
      const userName = requiredUsers.find(u => u._id === userId)?.name;
      const projectName = userProjects[0].name;
      return alert(`${userName} is part of project "${projectName}" so cannot be removed.`);
    }
    
    const updated = requiredUsers.filter((u) => u._id !== userId);
    setRequiredUsers(updated);
    // Persist to backend
    try {
      await updateRequiredUsers(updated.map((u) => u._id));
    } catch (err) {
      console.error("Failed to save required users", err);
    }
  };

  const toggleTeamMember = (id) => {
    setSelectedTeamMembers((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const handleSaveTeam = async () => {
    if (!teamName || selectedTeamMembers.length === 0) {
      return alert("Team name and at least one member required");
    }

    await createTeam({ name: teamName, members: selectedTeamMembers });
    setTeamName("");
    setSelectedTeamMembers([]);
    setOpenTeamMemberDropdown(false);
    loadTeams();
  };

  const avatar = (name) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  // Check if all team members are in required users
  const isTeamValid = (team) => {
    if (!team.members || team.members.length === 0) return false;
    return team.members.every((member) =>
      requiredUsers.some((ru) => ru._id === member._id)
    );
  };

  // Filter teams to show only valid ones (all members in required users)
  const validTeams = teams.filter(isTeamValid);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Team & Project Members</h1>

      {/* Only show for admin/pm */}
      {!canManageMembers ? (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded">
          <p>Only Admins and Project Managers can manage team members and teams.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* SECTION 1: ALL USERS */}
          <div className="border rounded-lg p-4 bg-white shadow">
            <h2 className="text-xl font-bold mb-3">Section 1: All Users</h2>
            <p className="text-sm text-gray-600 mb-3">Select users from this list to add them to your Required Users section.</p>

            {/* Search and Filter */}
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="Search by name or email..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                className="flex-1 border p-2 rounded"
              />
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="border p-2 rounded"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="pm">Project Manager</option>
                <option value="member">Member</option>
              </select>
            </div>

            {/* Scrollable Users List */}
            <div className="border rounded max-h-64 overflow-y-auto bg-gray-50">
              {filteredUsers.length === 0 ? (
                <div className="p-4 text-gray-500 text-center">No users found</div>
              ) : (
                filteredUsers.map((u) => (
                  <div
                    key={u._id}
                    className="flex items-center justify-between p-3 border-b hover:bg-gray-100 cursor-pointer last:border-b-0"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {avatar(u.name)}
                      </div>
                      <div>
                        <div className="font-semibold text-sm">{u.name}</div>
                        <div className="text-xs text-gray-600">{u.email}</div>
                      </div>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded ml-2">
                        {u.role}
                      </span>
                    </div>
                    <button
                      onClick={() => addToRequiredUsers(u)}
                      disabled={requiredUsers.find((ru) => ru._id === u._id)}
                      className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {requiredUsers.find((ru) => ru._id === u._id) ? "Added" : "Add"}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* SECTION 2: REQUIRED USERS */}
          <div className="border rounded-lg p-4 bg-white shadow">
            <h2 className="text-xl font-bold mb-3">Section 2: Required Users</h2>
            <p className="text-sm text-gray-600 mb-3">
              Users here will be available for assignment to projects and tasks. Only required users appear in assignment dropdowns.
            </p>

            {requiredUsers.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                No required users yet. Add users from Section 1.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {requiredUsers.map((u) => (
                  <div
                    key={u._id}
                    className="border p-3 rounded bg-green-50 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {avatar(u.name)}
                      </div>
                      <div>
                        <div className="font-semibold text-sm">{u.name}</div>
                        <div className="text-xs text-gray-600">{u.role}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromRequiredUsers(u._id)}
                      className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SECTION 3: CREATE TEAM */}
          <div className="border rounded-lg p-4 bg-white shadow">
            <h2 className="text-xl font-bold mb-3">Section 3: Create Team</h2>
            <p className="text-sm text-gray-600 mb-3">Create teams from your required users. Teams can be assigned to tasks.</p>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold mb-1">Team Name</label>
                <input
                  type="text"
                  placeholder="e.g., Frontend Team, Backend Team"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full border p-2 rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Select Team Members</label>
                <div className="relative">
                  <button
                    onClick={() => setOpenTeamMemberDropdown(!openTeamMemberDropdown)}
                    className="w-full border p-2 rounded bg-white text-left flex justify-between items-center"
                  >
                    <span>
                      {selectedTeamMembers.length === 0
                        ? "Choose members..."
                        : `${selectedTeamMembers.length} member(s) selected`}
                    </span>
                    <span>▾</span>
                  </button>

                  {openTeamMemberDropdown && (
                    <div className="absolute z-20 top-full mt-1 w-full bg-white border rounded shadow max-h-48 overflow-y-auto">
                      {requiredUsers.length === 0 ? (
                        <div className="p-3 text-gray-500 text-sm">
                          No required users. Add users to Section 2 first.
                        </div>
                      ) : (
                        requiredUsers.map((u) => (
                          <label
                            key={u._id}
                            className="flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                          >
                            <input
                              type="checkbox"
                              checked={selectedTeamMembers.includes(u._id)}
                              onChange={() => toggleTeamMember(u._id)}
                            />
                            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                              {avatar(u.name)}
                            </div>
                            <span className="text-sm">{u.name}</span>
                          </label>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={handleSaveTeam}
                disabled={requiredUsers.length === 0}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
              >
                Create Team
              </button>
            </div>
          </div>

          {/* SECTION 4: DISPLAY TEAMS */}
          <div className="border rounded-lg p-4 bg-white shadow">
            <h2 className="text-xl font-bold mb-3">Section 4: Display Teams</h2>
            <p className="text-sm text-gray-600 mb-3">
              Only teams whose ALL members are in the Required Users section are displayed here.
            </p>

            {validTeams.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                No teams with all members in required users. Create one in Section 3.
              </div>
            ) : (
              <div className="space-y-3">
                {validTeams.map((t) => (
                  <div key={t._id} className="border p-3 rounded bg-purple-50">
                    <h3 className="font-semibold text-lg mb-2">{t.name}</h3>
                    <div className="flex flex-wrap gap-2">
                      {t.members && t.members.length > 0 ? (
                        t.members.map((m) => (
                          <div
                            key={m._id}
                            className="flex items-center gap-1 bg-white px-2 py-1 rounded border text-sm"
                          >
                            <div className="w-5 h-5 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                              {avatar(m.name)}
                            </div>
                            <span>{m.name}</span>
                          </div>
                        ))
                      ) : (
                        <span className="text-gray-500 text-sm">No members in this team</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}