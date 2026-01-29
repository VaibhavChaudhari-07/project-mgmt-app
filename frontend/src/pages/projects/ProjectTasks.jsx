import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getTasks,
  createTask,
  deleteTask,
  updateTask,
} from "../../services/task.service";
import { getProjectById } from "../../services/project.service";
import { getTeams } from "../../services/team.service";
import {
  getCommentsByTicket,
  createComment,
} from "../../services/comment.service";

export default function ProjectTasks() {
  const { projectId } = useParams();

  // 🔐 Role handling
  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role;

  const canCreate = role === "admin" || role === "pm";
  const canUpdate = role === "admin" || role === "pm";
  const canDelete = role === "admin";

  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [teams, setTeams] = useState([]);

  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("medium");
  const [selectedAssignees, setSelectedAssignees] = useState([]);
  const [editTaskId, setEditTaskId] = useState(null);

  const [openAssignDropdown, setOpenAssignDropdown] = useState(false);

  const [comments, setComments] = useState({});
  const [commentText, setCommentText] = useState({});

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState([]);
  const [openFilterDropdown, setOpenFilterDropdown] = useState(false);

  const loadComments = async (taskId) => {
    const res = await getCommentsByTicket(taskId);
    setComments((prev) => ({ ...prev, [taskId]: res.data }));
  };

  const loadTasks = async () => {
    const res = await getTasks(projectId);
    const list = res.data || [];
    setTasks(list);
    list.forEach((t) => loadComments(t._id));
  };

  const loadMembers = async () => {
    const res = await getProjectById(projectId);
    setMembers(res.data.members || []);
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

  const handleSave = async () => {
    if (!title) return alert("Title required");

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

  const startEdit = (task) => {
    setEditTaskId(task._id);
    setTitle(task.title);
    setPriority(task.priority);
    setSelectedAssignees(task.assignees?.map((u) => u._id) || []);
  };

  const handleStatusChange = async (taskId, newStatus) => {
    await updateTask(taskId, { status: newStatus });
    loadTasks();
  };

  const toggleMemberAssign = (id) => {
    setSelectedAssignees((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const assignTeam = (team) => {
    const ids = team.members.map((m) => m._id);
    setSelectedAssignees((prev) => Array.from(new Set([...prev, ...ids])));
  };

  const submitComment = async (taskId) => {
    if (!commentText[taskId]?.trim()) return;

    await createComment({ ticketId: taskId, text: commentText[taskId] });
    setCommentText((prev) => ({ ...prev, [taskId]: "" }));
    loadComments(taskId);
  };

  // -------- FILTER LOGIC --------
  const matchesAssigneeFilter = (task) => {
    if (assigneeFilter.length === 0) return true;

    return assigneeFilter.every((filter) => {
      if (filter.startsWith("user:")) {
        const userId = filter.replace("user:", "");
        return task.assignees?.some((a) => a._id === userId);
      }

      if (filter.startsWith("team:")) {
        const teamId = filter.replace("team:", "");
        const team = teams.find((t) => t._id === teamId);
        if (!team) return false;

        const teamIds = team.members.map((m) => m._id);
        const taskIds = (task.assignees || []).map((a) => a._id);

        return teamIds.every((id) => taskIds.includes(id));
      }

      return true;
    });
  };

  const filteredTasks = tasks.filter((task) => {
    return (
      task.title.toLowerCase().includes(search.toLowerCase()) &&
      (!statusFilter || task.status === statusFilter) &&
      (!priorityFilter || task.priority === priorityFilter) &&
      matchesAssigneeFilter(task)
    );
  });

  const selectedNames = members
    .filter((m) => selectedAssignees.includes(m._id))
    .map((m) => m.name)
    .join(", ");

  const validTeams = teams.filter((t) =>
    t.members.every((tm) => members.some((pm) => pm._id === tm._id))
  );

  return (
    <div>
      <h2 className="text-xl mb-3">Tasks</h2>

      {/* Create Task */}
      {canCreate && (
        <div className="flex gap-2 mb-4 flex-wrap">
          {/* (unchanged UI) */}
          <input className="border p-2" placeholder="Task title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <select className="border p-2" value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
          </select>

          <div className="relative w-64">
            <button onClick={() => setOpenAssignDropdown(!openAssignDropdown)} className="border p-2 w-full text-left bg-white">
              {selectedNames || "Assign users ▾"}
            </button>

            {openAssignDropdown && (
              <div className="absolute z-30 bg-white border w-full mt-1 max-h-64 overflow-y-auto shadow">
                <div className="px-2 py-1 text-xs font-semibold text-gray-500 border-b">Teams</div>
                {validTeams.map((t) => (
                  <label key={t._id} className="flex gap-2 px-2 py-1 text-sm">
                    <input type="checkbox" checked={t.members.every((m) => selectedAssignees.includes(m._id))} onChange={() => assignTeam(t)} />
                    👥 {t.name}
                  </label>
                ))}
                <div className="px-2 py-1 text-xs font-semibold text-gray-500 border-b mt-2">Members</div>
                {members.map((m) => (
                  <label key={m._id} className="flex gap-2 px-2 py-1 text-sm">
                    <input type="checkbox" checked={selectedAssignees.includes(m._id)} onChange={() => toggleMemberAssign(m._id)} />
                    {m.name}
                  </label>
                ))}
              </div>
            )}
          </div>

          <button onClick={handleSave} className="bg-blue-600 text-white px-3">
            {editTaskId ? "Update" : "Add"}
          </button>
        </div>
      )}

      {/* TASK TABLE */}
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Title</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Priority</th>
            <th className="border p-2">Assignees</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredTasks.map((t) => (
            <>
              <tr key={t._id}>
                <td className="border p-2">{t.title}</td>
                <td className="border p-2">
                  {canUpdate ? (
                    <select value={t.status} onChange={(e) => handleStatusChange(t._id, e.target.value)}>
                      <option value="todo">To Do</option>
                      <option value="inprogress">In Progress</option>
                      <option value="review">Review</option>
                      <option value="done">Done</option>
                    </select>
                  ) : (
                    t.status
                  )}
                </td>
                <td className="border p-2">{t.priority}</td>
                <td className="border p-2">{t.assignees?.map((u) => u.name).join(", ") || "-"}</td>
                <td className="border p-2">
                  {canUpdate && <button onClick={() => startEdit(t)} className="text-blue-600">Edit</button>}{" "}
                  {canDelete && (
                    <button onClick={() => deleteTask(t._id).then(loadTasks)} className="text-red-600">
                      Delete
                    </button>
                  )}
                </td>
              </tr>

              <tr className="bg-gray-50">
                <td colSpan="5" className="p-2">
                  {(comments[t._id] || []).map((c) => (
                    <div key={c._id} className="text-sm">
                      <b>{c.user.name}</b>: {c.text}
                    </div>
                  ))}

                  <div className="flex gap-2 mt-1">
                    <input
                      className="border p-1 flex-1 text-sm"
                      value={commentText[t._id] || ""}
                      onChange={(e) =>
                        setCommentText((prev) => ({ ...prev, [t._id]: e.target.value }))
                      }
                      placeholder="Write a comment..."
                    />
                    <button onClick={() => submitComment(t._id)} className="bg-blue-500 text-white px-2 text-sm">
                      Send
                    </button>
                  </div>
                </td>
              </tr>
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
}