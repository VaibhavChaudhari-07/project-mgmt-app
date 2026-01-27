import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getProjects,
  createProject,
  deleteProject,
  updateProject,
  addMember,
  removeMember,
} from "../../services/project.service";

export default function Projects() {
  const navigate = useNavigate(); // ✅ FIX

  const [projects, setProjects] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editId, setEditId] = useState(null);
  const [memberEmail, setMemberEmail] = useState("");

  const loadProjects = async () => {
    const res = await getProjects();
    setProjects(res.data);
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleSave = async () => {
    if (!name) return alert("Project name required");

    if (editId) {
      await updateProject(editId, { name, description });
      setEditId(null);
    } else {
      await createProject({ name, description });
    }

    setName("");
    setDescription("");
    loadProjects();
  };

  const startEdit = (project) => {
    setEditId(project._id);
    setName(project.name);
    setDescription(project.description || "");
  };

  const handleAddMember = async (projectId) => {
    if (!memberEmail) return alert("Enter email");
    await addMember(projectId, memberEmail);
    setMemberEmail("");
    loadProjects();
  };

  const handleRemoveMember = async (projectId, userId) => {
    await removeMember(projectId, userId);
    loadProjects();
  };

  return (
    <div>
      <h1 className="text-2xl mb-4">Projects</h1>

      {/* Create / Edit */}
      <div className="mb-4 flex gap-2">
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

      {/* Project list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map((p) => (
          <div key={p._id} className="border p-3 rounded shadow">
            <h2 className="font-bold">{p.name}</h2>
            <p className="text-sm mb-2">{p.description}</p>

            {/* Actions */}
            <div className="flex gap-3 mb-2">
              <button onClick={() => startEdit(p)} className="text-blue-600">
                Edit
              </button>
              <button
                onClick={() => deleteProject(p._id).then(loadProjects)}
                className="text-red-600"
              >
                Delete
              </button>
            </div>

            {/* Members list */}
            <div className="mb-2">
              <h3 className="font-semibold">Members:</h3>

              {p.members.length === 0 && (
                <p className="text-sm text-gray-500">No members</p>
              )}

              {p.members.map((m) => (
                <div
                  key={m._id}
                  className="flex justify-between items-center text-sm border-b py-1"
                >
                  <span>
                    {m.name} ({m.email})
                  </span>
                  <button
                    onClick={() => handleRemoveMember(p._id, m._id)}
                    className="text-red-500"
                  >
                    ❌
                  </button>
                </div>
              ))}
            </div>

            {/* Add member + view tasks */}
            <div className="flex gap-2 mt-2">
              <input
                className="border p-1 flex-1"
                placeholder="Member email"
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
              />
              <button
                onClick={() => handleAddMember(p._id)}
                className="bg-green-600 text-white px-2"
              >
                Add
              </button>

              <button
                onClick={() => navigate(`/projects/${p._id}/tasks`)}
                className="text-green-600"
              >
                View Tasks
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
