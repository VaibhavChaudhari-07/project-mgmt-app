import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getProjects,
  createProject,
  deleteProject,
  updateProject,
  updateProjectMembers,
} from "../../services/project.service";

import { getUsers } from "../../services/user.service";
import { getTeams } from "../../services/team.service";

export default function Projects() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editId, setEditId] = useState(null);

  const [selectedMembers, setSelectedMembers] = useState([]);
  const [openProjectDropdown, setOpenProjectDropdown] = useState(null);

  const [teams, setTeams] = useState([]);

  const loadProjects = async () => {
    const res = await getProjects();
    setProjects(res.data || []);
  };

  const loadUsers = async () => {
    const res = await getUsers();
    setUsers(res.data || []);
  };

  const loadTeams = async () => {
    const res = await getTeams();
    setTeams(res.data || []);
  };

  useEffect(() => {
    loadProjects();
    loadUsers();
    loadTeams();
  }, []);

  const handleSave = async () => {
    if (!name.trim()) return alert("Project name required");

    try {
      if (editId) {
        await updateProject(editId, { name, description });
        await updateProjectMembers(editId, selectedMembers);
        setEditId(null);
      } else {
        const res = await createProject({ name, description });

        const newProjectId = res?.data?._id;
        if (newProjectId && selectedMembers.length > 0) {
          await updateProjectMembers(newProjectId, selectedMembers);
        }
      }

      setName("");
      setDescription("");
      setSelectedMembers([]);

      await loadProjects(); // IMPORTANT
    } catch (err) {
      console.error("Project save failed:", err);
      alert("Failed to save project");
    }
  };

  const startEdit = (project) => {
    setEditId(project._id);
    setName(project.name);
    setDescription(project.description || "");
    setSelectedMembers((project.members || []).map((m) => m._id));
  };

  const toggleProjectMember = async (projectId, userId) => {
    const project = projects.find((p) => p._id === projectId);
    if (!project) return;

    const currentMembers = project.members || [];

    let updatedMembers;
    if (currentMembers.some((m) => m._id === userId)) {
      updatedMembers = currentMembers
        .filter((m) => m._id !== userId)
        .map((m) => m._id);
    } else {
      updatedMembers = [...currentMembers.map((m) => m._id), userId];
    }

    await updateProjectMembers(projectId, updatedMembers);
    await loadProjects();
  };

  const assignTeamToProject = async (projectId, team) => {
    const project = projects.find((p) => p._id === projectId);
    if (!project) return;

    const currentMembers = (project.members || []).map((m) => m._id);
    const teamMemberIds = team.members.map((m) => m._id);

    const merged = Array.from(new Set([...currentMembers, ...teamMemberIds]));

    await updateProjectMembers(projectId, merged);
    await loadProjects();
  };

  const initials = (name) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  return (
    <div>
      <h1 className="text-2xl mb-4">Projects</h1>

      {/* Create / Edit Project */}
      <div className="mb-4 space-y-2">
        <div className="flex gap-2">
          <input
            className="border p-2"
            placeholder="Project name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            className="border p-2"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <button onClick={handleSave} className="bg-blue-600 text-white px-3">
            {editId ? "Update" : "Add"}
          </button>
        </div>
      </div>

      {/* Project list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map((p) => (
          <div key={p._id} className="border p-3 rounded shadow relative">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="font-bold">{p.name}</h2>
                <p className="text-sm mb-2">{p.description}</p>
              </div>

              {/* Members dropdown */}
              <div className="relative">
                <button
                  onClick={() =>
                    setOpenProjectDropdown(
                      openProjectDropdown === p._id ? null : p._id,
                    )
                  }
                  className="border px-2 py-1 text-sm bg-white"
                >
                  Members ▾
                </button>

                {openProjectDropdown === p._id && (
                  <div className="absolute right-0 mt-1 w-60 bg-white border shadow z-20 max-h-60 overflow-y-auto">
                    {/* Teams section */}
                    <div className="px-2 py-1 text-xs font-semibold text-gray-500 border-b">
                      Teams
                    </div>

                    {teams.map((t) => {
                      const allTeamMembersSelected = t.members.every((tm) =>
                        (p.members || []).some((pm) => pm._id === tm._id),
                      );

                      return (
                        <label
                          key={t._id}
                          className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                        >
                          <input
                            type="checkbox"
                            checked={allTeamMembersSelected}
                            onChange={() => assignTeamToProject(p._id, t)}
                          />
                          👥 {t.name}
                        </label>
                      );
                    })}

                    {/* Members section */}
                    <div className="px-2 py-1 text-xs font-semibold text-gray-500 border-b mt-2">
                      Members
                    </div>

                    {users.map((u) => (
                      <label
                        key={u._id}
                        className="flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={(p.members || []).some(
                            (m) => m._id === u._id,
                          )}
                          onChange={() => toggleProjectMember(p._id, u._id)}
                        />
                        {u.name}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Member badges */}
            <div className="flex gap-2 my-2 flex-wrap">
              {(p.members || []).map((m) => (
                <div
                  key={m._id}
                  className="w-7 h-7 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold"
                  title={m.name}
                >
                  {initials(m.name)}
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-2">
              <button onClick={() => startEdit(p)} className="text-blue-600">
                Edit Project
              </button>

              <button
                onClick={() => deleteProject(p._id).then(loadProjects)}
                className="text-red-600"
              >
                Delete Project
              </button>

              <button
                onClick={() => navigate(`/projects/${p._id}/tasks`)}
                className="text-green-600"
              >
                View Tasks
              </button>

              <button
                onClick={() => navigate(`/projects/${p._id}/kanban`)}
                className="text-purple-600"
              >
                Kanban Board
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
