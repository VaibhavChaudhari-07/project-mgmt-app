import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";

import {
  getProjects,
  createProject,
  deleteProject,
  updateProject,
  updateProjectMembers,
} from "../../services/project.service";

import { getUsers, getRequiredUsers } from "../../services/user.service";
import { getTeams } from "../../services/team.service";
import {
  canCreateProject as canCreateProjectUi,
  canDeleteProject as canDeleteProjectUi,
} from "../../services/permissions";

export default function Projects() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role;

  const canCreateProject = canCreateProjectUi(user);
  const canDeleteProject = canDeleteProjectUi(user);
  const canManageProject = role === "admin" || role === "pm";

  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [requiredUsers, setRequiredUsers] = useState([]);
  const [teams, setTeams] = useState([]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editId, setEditId] = useState(null);

  const [openProjectDropdown, setOpenProjectDropdown] = useState(null);
  const [portalCoords, setPortalCoords] = useState({});

  // 🔑 IMPORTANT: ref map per project
  const dropdownRefs = useRef({});

  /* ---------------- LOAD DATA ---------------- */

  useEffect(() => {
    getProjects().then((res) => setProjects(res.data || []));
    getUsers().then((res) => setUsers(res.data || []));
    getRequiredUsers().then((res) => setRequiredUsers(res.data || []));
    getTeams().then((res) => setTeams(res.data || []));
  }, []);

  /* ---------------- CLOSE DROPDOWN ON OUTSIDE CLICK ---------------- */

  useEffect(() => {
    const handleOutside = (e) => {
      if (!openProjectDropdown) return;

      const wrapper = dropdownRefs.current[openProjectDropdown];
      const portalEl = document.querySelector(`[data-portal-id="${openProjectDropdown}"]`);

      const clickedInsideWrapper = wrapper && wrapper.contains(e.target);
      const clickedInsidePortal = portalEl && portalEl.contains(e.target);

      if (!clickedInsideWrapper && !clickedInsidePortal) {
        setOpenProjectDropdown(null);
      }
    };

    // ✅ mouseup allows checkbox change first
    document.addEventListener("mouseup", handleOutside);
    return () => document.removeEventListener("mouseup", handleOutside);
  }, [openProjectDropdown]);

  // Toggle dropdown and compute portal coordinates when opening
  const toggleDropdown = (id) => {
    const next = openProjectDropdown === id ? null : id;
    if (next) {
      // compute trigger rect to place portal dropdown
      const wrapper = dropdownRefs.current[id];
      const trigger = wrapper?.querySelector("button");
      if (trigger) {
        const rect = trigger.getBoundingClientRect();
        const width = 288; // matches w-72
        const left = Math.max(8, rect.right - width + window.scrollX);
        const top = rect.bottom + window.scrollY;
        setPortalCoords((p) => ({ ...p, [id]: { top, left, width } }));
      }
    }
    setOpenProjectDropdown(next);
  };

  /* ---------------- CRUD ---------------- */

  const handleSave = async () => {
    if (!name.trim()) return alert("Project name required");

    if (editId) {
      await updateProject(editId, { name, description });
      setEditId(null);
    } else {
      if (!canCreateProject) return alert("Permission denied");
      await createProject({ name, description });
    }

    setName("");
    setDescription("");
    const res = await getProjects();
    setProjects(res.data || []);
  };

  const toggleProjectMember = async (projectId, userId) => {
    const project = projects.find((p) => p._id === projectId);
    if (!project) return;

    // 🔒 HARD GUARD: creator cannot be removed
    if (userId === project.createdBy) return;

    const members = project.members || [];

    const updated = members.some((m) => m._id === userId)
      ? members.filter((m) => m._id !== userId).map((m) => m._id)
      : [...members.map((m) => m._id), userId];

    await updateProjectMembers(projectId, updated);

    const res = await getProjects();
    setProjects(res.data || []);
  };

  const assignTeamToProject = async (projectId, team) => {
    const project = projects.find((p) => p._id === projectId);
    if (!project) return;

    const current = (project.members || []).map((m) => m._id);
    const teamIds = team.members.map((m) => m._id);

    await updateProjectMembers(
      projectId,
      Array.from(new Set([...current, ...teamIds]))
    );

    const res = await getProjects();
    setProjects(res.data || []);
  };

  const initials = (name) =>
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

  /* ---------------- UI ---------------- */

  return (
    <div className="p-6 pt-16 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-semibold mb-6">Projects</h1>

      {/* CREATE PROJECT */}
      {canManageProject && (
        <div className="bg-white p-6 rounded-xl shadow-md mb-8 flex gap-3 flex-wrap">
          <input
            className="border-2 border-gray-300 focus:border-blue-500 focus:outline-none p-2.5 rounded-lg w-56 transition-colors"
            placeholder="Project name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="border-2 border-gray-300 focus:border-blue-500 focus:outline-none p-2.5 rounded-lg flex-1 transition-colors"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors"
          >
            {editId ? "Update" : "Add Project"}
          </button>
        </div>
      )}

      {/* PROJECT GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {projects.map((p) => (
          <div
            key={p._id}
            className="relative bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between min-h-[360px] border border-gray-100"
          >
            {/* Creator badge top-right */}
            {(() => {
              const creator = p.createdBy && p.createdBy.name ? p.createdBy : users.find((u) => u._id === (p.createdBy || ""));
              const cName = creator?.name || "Unknown";
              const cRole = creator?.role || "";
              return (
                <div className="absolute right-6 top-6 flex items-center gap-2 bg-gradient-to-r from-blue-50 to-blue-100 p-2 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center text-xs font-bold">
                    {initials(cName)}
                  </div>
                  <div className="text-right text-xs">
                    <div className="font-semibold text-gray-900 leading-tight">{cName}</div>
                    <div className="text-gray-600">{cRole}</div>
                  </div>
                </div>
              );
            })()}
            {/* HEADER */}
            <div>
              <h2 className="pt-12 font-bold text-xl mb-2 text-gray-900">{p.name}</h2>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {p.description || "No description provided"}
              </p>

              {/* MEMBERS */}
              <div className="flex items-center gap-2 mb-4">
                {(p.members || []).slice(0, 3).map((m) => (
                  <div
                    key={m._id}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 text-white flex items-center justify-center text-xs font-bold shadow-sm hover:scale-110 transition-transform"
                    title={m.name}
                  >
                    {initials(m.name)}
                  </div>
                ))}

                {canManageProject && (
                  <div
                    className="relative ml-auto isolate z-40"
                    ref={(el) => (dropdownRefs.current[p._id] = el)}
                  >
                    <button
                      onClick={() => toggleDropdown(p._id)}
                      className="text-sm border px-3 py-1 rounded hover:bg-gray-100"
                    >
                      Members ▾
                    </button>

                    {openProjectDropdown === p._id && portalCoords[p._id] &&
                      createPortal(
                        <div
                          style={{
                            position: "absolute",
                            top: `${portalCoords[p._id].top}px`,
                            left: `${portalCoords[p._id].left}px`,
                            width: `${portalCoords[p._id].width}px`,
                          }}
                          data-portal-id={p._id}
                          className="bg-white rounded-xl shadow-2xl border z-50 max-h-72 overflow-y-auto"
                        >
                          {/* TEAMS */}
                          <div className="px-3 py-2 text-xs font-semibold text-gray-500 bg-gray-50">
                            Teams
                          </div>

                          {validTeams.length === 0 ? (
                            <div className="px-4 py-3 text-sm text-gray-400 italic">
                              No teams available. Create teams with members in required users section.
                            </div>
                          ) : (
                            validTeams.map((t) => (
                              <label
                                key={t._id}
                                className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={t.members.every((tm) =>
                                    (p.members || []).some(
                                      (pm) => pm._id === tm._id
                                    )
                                  )}
                                  onChange={() => assignTeamToProject(p._id, t)}
                                />
                                👥 {t.name}
                              </label>
                            ))
                          )}

                          {/* MEMBERS */}
                          <div className="px-3 py-2 text-xs font-semibold text-gray-500 bg-gray-50">
                            Members
                          </div>

                          {requiredUsers.length === 0 ? (
                            <div className="px-4 py-3 text-sm text-gray-400 italic">
                              Add required users in Members tab
                            </div>
                          ) : (
                            requiredUsers.map((u) => {
                              // Normalize creator id whether populated or raw id
                              const creatorId = p.createdBy && (p.createdBy._id || p.createdBy);
                              const isCreator = String(u._id) === String(creatorId);
                              const isChecked = (p.members || []).some(
                                (m) => m._id === u._id
                              );

                              return (
                                <label
                                  key={u._id}
                                  className={`flex items-start gap-3 px-4 py-3 text-sm
                                    ${
                                      isCreator
                                        ? "opacity-50 cursor-not-allowed"
                                        : "cursor-pointer hover:bg-gray-100"
                                    }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    disabled={isCreator}
                                    onChange={() =>
                                      toggleProjectMember(p._id, u._id)
                                    }
                                    className="w-4 h-4 mt-1 accent-blue-600"
                                  />

                                  <div className="flex flex-col">
                                    <span className="font-medium">{u.name}</span>
                                    <span className="text-xs text-gray-500">
                                      {u.email}
                                      {isCreator && " • Project Creator"}
                                    </span>
                                  </div>
                                </label>
                              );
                            })
                          )}
                        </div>,
                        document.body
                      )}
                  </div>
                )}
              </div>
            </div>

            {/* ACTIONS */}
            <div className="space-y-2 pt-4 border-t border-gray-100">
              <div className="flex justify-between gap-2">
                <button
                  onClick={() => navigate(`/projects/${p._id}/tasks`)}
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-all"
                >
                  📋 Tasks
                </button>

                <button
                  onClick={() => navigate(`/projects/${p._id}/kanban`)}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-all"
                >
                  📊 Kanban
                </button>
              </div>

              <div className="flex gap-2 pt-2">
                {canManageProject && (
                  <button
                    onClick={() => {
                      setEditId(p._id);
                      setName(p.name);
                      setDescription(p.description || "");
                    }}
                    className="flex-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    ✏️ Edit
                  </button>
                )}

                {canDeleteProject && (
                  <button
                    onClick={() =>
                      deleteProject(p._id).then(() =>
                        getProjects().then((res) =>
                          setProjects(res.data || [])
                        )
                      )
                    }
                    className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    🗑️ Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}