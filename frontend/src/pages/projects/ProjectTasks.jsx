import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  getTasks,
  createTask,
  deleteTask,
  updateTask,
} from "../../services/task.service";
import { getProjectById } from "../../services/project.service";
import { getRequiredUsers } from "../../services/user.service";
import { canCreateIssue, canChangeIssueStatus } from "../../services/permissions";
import { getTeams } from "../../services/team.service";
import {
  getCommentsByTicket,
  createComment,
} from "../../services/comment.service";

export default function ProjectTasks() {
  const { projectId } = useParams();

  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role;

  const [projectPermissions, setProjectPermissions] = useState({});

  const canCreate = canCreateIssue(user, projectPermissions);
  const canUpdate = role === "admin" || role === "pm";
  const canDelete = role === "admin";

  // Use required users from localStorage instead of project members
  const [requiredUsers, setRequiredUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [teams, setTeams] = useState([]);

  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("medium");
  const [selectedAssignees, setSelectedAssignees] = useState([]);
  const [editTaskId, setEditTaskId] = useState(null);

  const [openAssignDropdown, setOpenAssignDropdown] = useState(false);

  const [comments, setComments] = useState({});
  const [commentText, setCommentText] = useState({});

  const assignRef = useRef(null);

  // Close assign dropdown when clicking outside
  useEffect(() => {
    const handleOutside = (e) => {
      if (openAssignDropdown && assignRef.current && !assignRef.current.contains(e.target)) {
        setOpenAssignDropdown(false);
      }
    };

    document.addEventListener("mouseup", handleOutside);
    return () => document.removeEventListener("mouseup", handleOutside);
  }, [openAssignDropdown]);

  /* ---------------- LOAD DATA ---------------- */

  const loadComments = async (taskId) => {
    const res = await getCommentsByTicket(taskId);
    setComments((prev) => ({ ...prev, [taskId]: res.data }));
  };

  const loadTasks = async () => {
  const res = await getTasks(projectId);
  const list = res.data || [];
  setTasks(list);

  // ✅ Load comments AFTER tasks are known
  const commentMap = {};
  await Promise.all(
    list.map(async (t) => {
      const cRes = await getCommentsByTicket(t._id);
      commentMap[t._id] = cRes.data || [];
    })
  );

  setComments(commentMap);
};

  const loadMembers = async () => {
    const res = await getProjectById(projectId);
    // Load required users from backend
    try {
      const requiredRes = await getRequiredUsers();
      setRequiredUsers(requiredRes.data || []);
    } catch (err) {
      console.error("Failed to load required users", err);
      setRequiredUsers([]);
    }
    setProjectPermissions(res.data.permissions || {});
  };

  const loadTeams = async () => {
    const res = await getTeams();
    setTeams(res.data || []);
  };

  useEffect(() => {
    loadTasks();
    loadMembers();
    loadTeams();
  }, [projectId]);

  // Check if all team members are in required users
  const isTeamValid = (team) => {
    if (!team.members || team.members.length === 0) return false;
    return team.members.every((member) =>
      requiredUsers.some((ru) => ru._id === member._id)
    );
  };

  // Filter teams to show only valid ones (all members in required users)
  const validTeams = teams.filter(isTeamValid);

  /* ---------------- TASK CRUD ---------------- */

  const handleSave = async () => {
    if (!title.trim()) return alert("Title required");

    const payload = {
      title,
      priority,
      assignees: selectedAssignees,
      project: projectId,
    };

    if (editTaskId) {
      await updateTask(editTaskId, payload);
      setEditTaskId(null);
    } else {
      await createTask(payload);
    }

    setTitle("");
    setPriority("medium");
    setSelectedAssignees([]);
    loadTasks();
  };

  const handleStatusChange = async (taskId, status) => {
    // permission check
    if (!(canChangeIssueStatus(user, projectPermissions) || role === "admin" || role === "pm")) {
      return alert("Permission denied");
    }

    await updateTask(taskId, { status });
    loadTasks();
  };

  const submitComment = async (taskId) => {
    const text = commentText[taskId]?.trim();
    if (!text) return;

    // 1️⃣ Optimistically update UI
    const newComment = {
      _id: Date.now(), // temporary key
      text,
      user: {
        name: user?.name || "You",
      },
    };

    setComments((prev) => ({
      ...prev,
      [taskId]: [...(prev[taskId] || []), newComment],
    }));

    setCommentText((prev) => ({ ...prev, [taskId]: "" }));

    // 2️⃣ Persist to backend
    await createComment({ ticketId: taskId, text });

    // 3️⃣ Sync with backend (final truth)
    loadComments(taskId);
  };

  /* ---------------- HELPERS ---------------- */

  const priorityColor = {
    high: "bg-red-100 text-red-700",
    medium: "bg-yellow-100 text-yellow-700",
    low: "bg-green-100 text-green-700",
  };

  const statusLabel = {
    todo: "To Do",
    inprogress: "In Progress",
    review: "Review",
    done: "Done",
  };

  const avatar = (name) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">📋 Project Tasks</h2>

      {/* CREATE TASK */}
      {canCreate && (
        <div className="bg-white p-4 rounded-lg shadow mb-8 flex gap-3 flex-wrap">
          <input
            className="border p-2 rounded w-56"
            placeholder="Task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <select
            className="border p-2 rounded"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          {/* ✅ ASSIGN MEMBER DROPDOWN (ONLY ADDITION) */}
          <div className="relative w-64" ref={assignRef}>
            <button
              type="button"
              onClick={() => setOpenAssignDropdown((v) => !v)}
              className="border p-2 w-full text-left bg-white rounded"
            >
              {selectedAssignees.length === 0
                ? "Assign members ▾"
                : `${selectedAssignees.length} assigned ▾`}
            </button>

            {openAssignDropdown && (
              <div className="absolute z-30 bg-white border w-full mt-1 rounded shadow max-h-56 overflow-y-auto">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 border-b">
                  Members
                </div>

                {requiredUsers.length === 0 ? (
                  <div className="px-3 py-2 text-xs text-gray-400 italic">
                    No required users added. Go to Members tab to add users.
                  </div>
                ) : (
                  (() => {
                    // find the task being edited (if any) so we can disable its creator checkbox
                    const editingTask = tasks.find((t) => t._id === editTaskId);

                    return requiredUsers.map((m) => {
                      const isCreator = !!(
                        editingTask &&
                        (editingTask.createdBy === m._id ||
                          (editingTask.createdBy && editingTask.createdBy._id === m._id))
                      );

                      return (
                        <label
                          key={m._id}
                          className={`flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 ${isCreator ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                        >
                          <input
                            type="checkbox"
                            checked={
                              // creator must always be checked when editing
                              isCreator ? true : selectedAssignees.includes(m._id)
                            }
                            disabled={isCreator}
                            onChange={() => {
                              if (isCreator) return;
                              setSelectedAssignees((prev) =>
                                prev.includes(m._id)
                                  ? prev.filter((id) => id !== m._id)
                                  : [...prev, m._id]
                              );
                            }}
                          />
                          <span>
                            {m.name} {isCreator && <span className="text-xs text-gray-500">(Creator)</span>}
                          </span>
                        </label>
                      );
                    });
                  })()
                )}

                {/* Teams section */}
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 border-t">
                  Teams
                </div>

                {requiredUsers.length === 0 ? (
                  <div className="px-3 py-2 text-xs text-gray-400 italic">
                    Add required users first to see teams.
                  </div>
                ) : validTeams.length === 0 ? (
                  <div className="px-3 py-2 text-xs text-gray-400 italic">
                    No teams available. Create teams with members in required users section.
                  </div>
                ) : (
                  validTeams.map((team) => {
                    // determine if all team members are part of required users
                    const requiredUserIds = new Set((requiredUsers || []).map((m) => String(m._id)));
                    const teamMemberIds = (team.members || []).map((m) => String(m._id));
                    const allInRequired = teamMemberIds.every((id) => requiredUserIds.has(id));

                    return (
                      <div key={team._id} className="flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-50">
                        <div className="flex items-center gap-2">
                          <div className="font-medium">{team.name}</div>
                          <div className="text-xs text-gray-500">{team.members?.length || 0} members</div>
                        </div>
                        <button
                          onClick={() => {
                            if (!allInRequired) return;
                            // add team members to selectedAssignees (only those in required users)
                            const toAdd = teamMemberIds.filter((id) => requiredUserIds.has(id));
                            setSelectedAssignees((prev) => Array.from(new Set([...prev, ...toAdd])));
                          }}
                          className={`px-2 py-1 rounded text-xs ${allInRequired ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
                          disabled={!allInRequired}
                        >
                          {allInRequired ? "Add Team" : "Unavailable"}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          <button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 rounded"
          >
            {editTaskId ? "Update" : "Add"}
          </button>
        </div>
      )}

      {/* TASK GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {tasks.map((t) => (
          <div
            key={t._id}
            className="relative bg-gradient-to-br from-white to-gray-50 rounded-2xl p-5 shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col justify-between min-h-[360px] border border-gray-100 hover:border-blue-200 hover:scale-105"
          >
            {/* Task creator badge top-right */}
            {(() => {
              const creator = t.createdBy && t.createdBy.name ? t.createdBy : (requiredUsers.find((u) => u._id === (t.createdBy || "")) || { name: "Unknown", role: "" });
              const cName = creator?.name || "Unknown";
              const cRole = creator?.role || "";
              return (
                <div className="absolute right-4 top-4 flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-gray-200">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                    {avatar(cName)}
                  </div>
                  <div className="text-right text-xs">
                    <div className="font-semibold leading-tight text-gray-900">{cName}</div>
                    <div className="text-gray-600 text-xs">{cRole}</div>
                  </div>
                </div>
              );
            })()}
            {/* HEADER */}
            <div className="pb-2">
              <h3 className="font-bold text-lg text-gray-900 mb-3 line-clamp-2 hover:text-blue-600 transition">{t.title}</h3>

              {/* STATUS */}
              <div className="mb-3">
                {canUpdate ? (
                  <select
                    value={t.status}
                    onChange={(e) => handleStatusChange(t._id, e.target.value)}
                    className="w-full border border-gray-300 p-2 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  >
                    {Object.keys(statusLabel).map((s) => (
                      <option key={s} value={s}>
                        {statusLabel[s]}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className={`inline-block px-3 py-1.5 rounded-lg text-xs font-semibold ${
                    t.status === 'done' ? 'bg-green-100 text-green-700' : 
                    t.status === 'inprogress' ? 'bg-blue-100 text-blue-700' :
                    t.status === 'review' ? 'bg-purple-100 text-purple-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>{statusLabel[t.status]}</span>
                )}
              </div>

              {/* PRIORITY */}
              <div className="mb-3">
                <span
                  className={`inline-block px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide ${
                    t.priority === 'high' ? 'bg-red-100 text-red-700' :
                    t.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}
                >
                  {t.priority === 'high' ? '⚡ ' : t.priority === 'medium' ? '→ ' : '✓ '}
                  {t.priority.toUpperCase()}
                </span>
              </div>

              {/* ASSIGNEES */}
              <div className="mb-3">
                <p className="text-xs font-semibold text-gray-600 mb-1.5">Assigned to:</p>
                <div className="flex gap-1.5 flex-wrap">
                  {(t.assignees || []).map((u, idx) => (
                    <div
                      key={u._id}
                      className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center text-xs font-bold shadow-sm hover:shadow-md transition"
                      title={u.name}
                    >
                      {avatar(u.name)}
                    </div>
                  ))}
                  {(!t.assignees || t.assignees.length === 0) && (
                    <span className="text-xs text-gray-400 italic">Unassigned</span>
                  )}
                </div>
              </div>
            </div>

            {/* COMMENTS */}
            <div className="border-t border-gray-200 pt-3 mt-4">
              {/* ADD COMMENT */}
              <div className="flex gap-2 mb-3">
                <input
                  className="border border-gray-300 p-1.5 flex-1 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  placeholder="💬 Add comment..."
                  value={commentText[t._id] || ""}
                  onChange={(e) =>
                    setCommentText((prev) => ({
                      ...prev,
                      [t._id]: e.target.value,
                    }))
                  }
                />
                <button
                  onClick={() => submitComment(t._id)}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 rounded-lg text-sm font-medium hover:shadow-lg transition-all"
                >
                  Send
                </button>
              </div>

              {/* COMMENT HISTORY */}
              <div className="bg-gray-50 rounded-lg p-2 max-h-24 overflow-y-auto space-y-2 text-sm">
                {(comments[t._id] || []).length === 0 ? (
                  <p className="text-gray-400 text-xs italic text-center py-2">
                    No comments yet
                  </p>
                ) : (
                  comments[t._id].map((c) => (
                    <div key={c._id} className="bg-white rounded px-2 py-1.5 border border-gray-100">
                      <span className="font-semibold text-gray-900 text-xs">
                        {c.user?.name || "User"}
                      </span>
                      <p className="text-gray-600 text-xs line-clamp-2">{c.text}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex gap-2 mt-4 pt-3 border-t border-gray-200">
              {canUpdate && (
                <button
                  onClick={() => {
                    setEditTaskId(t._id);
                    setTitle(t.title);
                    setPriority(t.priority);
                    setSelectedAssignees(t.assignees?.map((u) => u._id) || []);
                  }}
                  className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-semibold py-1.5 px-2 rounded-lg transition-all hover:shadow-md"
                >
                  ✏️ Edit
                </button>
              )}

              {canDelete && (
                <button
                  onClick={() => deleteTask(t._id).then(loadTasks)}
                  className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 text-sm font-semibold py-1.5 px-2 rounded-lg transition-all hover:shadow-md"
                >
                  🗑️ Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
  );
}