import { useEffect, useState } from "react";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../../services/user.service";

import {
  getTeams,
  createTeam,
  updateTeam,
  deleteTeam,
} from "../../services/team.service";

export default function Members() {
  // Users
  const [users, setUsers] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [editId, setEditId] = useState(null);

  // Teams
  const [teams, setTeams] = useState([]);
  const [teamName, setTeamName] = useState("");
  const [teamMembers, setTeamMembers] = useState([]);
  const [editTeamId, setEditTeamId] = useState(null);
  const [openTeamDropdown, setOpenTeamDropdown] = useState(false);

  const loadUsers = async () => {
    const res = await getUsers();
    setUsers(res.data || []);
  };

  const loadTeams = async () => {
    const res = await getTeams();
    setTeams(res.data || []);
  };

  useEffect(() => {
    loadUsers();
    loadTeams();
  }, []);

  // ---------- Users ----------

  const handleSaveUser = async () => {
    if (!name || !email) return alert("Name & email required");

    if (editId) {
      await updateUser(editId, { name, email, role });
      setEditId(null);
    } else {
      await createUser({ name, email, role });
    }

    setName("");
    setEmail("");
    setRole("member");
    loadUsers();
  };

  const startEditUser = (u) => {
    setEditId(u._id);
    setName(u.name);
    setEmail(u.email);
    setRole(u.role || "member");
  };

  // ---------- Teams ----------

  const toggleTeamMember = (id) => {
    setTeamMembers((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id],
    );
  };

  const handleSaveTeam = async () => {
    if (!teamName) return alert("Team name required");

    if (editTeamId) {
      await updateTeam(editTeamId, {
        name: teamName,
        members: teamMembers,
      });
      setEditTeamId(null);
    } else {
      await createTeam({
        name: teamName,
        members: teamMembers,
      });
    }

    setTeamName("");
    setTeamMembers([]);
    setOpenTeamDropdown(false);
    loadTeams();
  };

  const startEditTeam = (t) => {
    setEditTeamId(t._id);
    setTeamName(t.name);
    setTeamMembers(t.members.map((m) => m._id));
  };

  const avatar = (name) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  return (
    <div>
      <h1 className="text-2xl mb-4">Members</h1>

      {/* USERS SECTION */}
      <div className="border p-3 mb-6">
        <h2 className="font-bold mb-2">Add / Edit Member</h2>

        <div className="flex gap-2 mb-3">
          <input
            className="border p-2"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="border p-2"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <select
            className="border p-2"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="member">Admin</option>
            <option value="admin">Project Manager</option>
            <option value="admin">Menber</option>
          </select>

          <button
            onClick={handleSaveUser}
            className="bg-blue-600 text-white px-3"
          >
            {editId ? "Update" : "Add"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {users.map((u) => (
            <div
              key={u._id}
              className="border p-2 flex justify-between items-center"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {avatar(u.name)}
                </div>
                <div>
                  <div className="font-semibold">{u.name}</div>
                  <div className="text-xs">{u.email}</div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => startEditUser(u)}
                  className="text-blue-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteUser(u._id).then(loadUsers)}
                  className="text-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TEAMS SECTION */}
      <div className="border p-3">
        <h2 className="font-bold mb-2">Teams</h2>

        <div className="mb-3">
          <input
            className="border p-2 mr-2"
            placeholder="Team name"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
          />

          <button
            onClick={handleSaveTeam}
            className="bg-green-600 text-white px-3"
          >
            {editTeamId ? "Update Team" : "Create Team"}
          </button>
        </div>

        {/* Team members dropdown */}
        <div className="relative mb-3 w-64">
          <button
            type="button"
            onClick={() => setOpenTeamDropdown(!openTeamDropdown)}
            className="border p-2 w-full text-left bg-white"
          >
            Select team members ▾
          </button>

          {openTeamDropdown && (
            <div className="absolute z-20 bg-white border w-full max-h-48 overflow-y-auto mt-1 shadow">
              {users.map((u) => (
                <label
                  key={u._id}
                  className="flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer text-sm"
                >
                  <input
                    type="checkbox"
                    checked={teamMembers.includes(u._id)}
                    onChange={() => toggleTeamMember(u._id)}
                  />
                  {u.name}
                </label>
              ))}
            </div>
          )}
        </div>


        <div className="space-y-2">
          {teams.map((t) => (
            <div
              key={t._id}
              className="border p-2 flex justify-between items-center"
            >
              <div>
                <div className="font-semibold">{t.name}</div>
                <div className="flex gap-1 mt-1">
                  {t.members.map((m) => (
                    <div
                      key={m._id}
                      className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs"
                      title={m.name}
                    >
                      {avatar(m.name)}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => startEditTeam(t)}
                  className="text-blue-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteTeam(t._id).then(loadTeams)}
                  className="text-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
