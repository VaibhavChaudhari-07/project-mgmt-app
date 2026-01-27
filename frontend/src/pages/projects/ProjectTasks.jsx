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

export default function ProjectTasks() {
  const { projectId } = useParams();

  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);

  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("medium");
  const [selectedAssignees, setSelectedAssignees] = useState([]);
  const [editTaskId, setEditTaskId] = useState(null);

  const [teams, setTeams] = useState([]);
  const [openTeamId, setOpenTeamId] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(false);

  const loadTasks = async () => {
    const res = await getTasks(projectId);
    setTasks(res.data || []);
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

  const toggleMember = (id) => {
    setSelectedAssignees((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id],
    );
  };

  const assignTeam = (team) => {
    const teamIds = team.members.map((m) => m._id);
    setSelectedAssignees((prev) => Array.from(new Set([...prev, ...teamIds])));
  };

  const selectedNames = members
    .filter((m) => selectedAssignees.includes(m._id))
    .map((m) => m.name)
    .join(", ");

  return (
    <div>
      <h2 className="text-xl mb-3">Tasks</h2>

      {/* Create / Edit task */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <input
          className="border p-2"
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <select
          className="border p-2"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        {/* Assignee dropdown */}
        <div className="relative w-64">
          <button
            type="button"
            onClick={() => setOpenDropdown(!openDropdown)}
            className="border p-2 w-full text-left bg-white"
          >
            {selectedNames || "Assign users ▾"}
          </button>

          {openDropdown && (
            <div className="absolute z-30 bg-white border w-full mt-1 max-h-64 overflow-y-auto shadow">
              {/* Teams */}
              <div className="px-2 py-1 text-xs font-semibold text-gray-500 border-b">
                Teams
              </div>

              {teams
                .filter((t) =>
                  t.members.every((m) =>
                    members.some((pm) => pm._id === m._id),
                  ),
                )
                .map((t) => (
                  <label
                    key={t._id}
                    className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 cursor-pointer text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={t.members.every((m) =>
                        selectedAssignees.includes(m._id),
                      )}
                      onChange={() => assignTeam(t)}
                    />
                    👥 {t.name}
                  </label>
                ))}

              {/* Members */}
              <div className="px-2 py-1 text-xs font-semibold text-gray-500 border-b mt-2">
                Members
              </div>

              {members.map((m) => (
                <label
                  key={m._id}
                  className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 cursor-pointer text-sm"
                >
                  <input
                    type="checkbox"
                    checked={selectedAssignees.includes(m._id)}
                    onChange={() => toggleMember(m._id)}
                  />
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

      {/* Tasks table */}
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
          {tasks.map((t) => (
            <tr key={t._id}>
              <td className="border p-2">{t.title}</td>

              <td className="border p-2">
                <select
                  className="border p-1"
                  value={t.status}
                  onChange={(e) => handleStatusChange(t._id, e.target.value)}
                >
                  <option value="todo">To Do</option>
                  <option value="inprogress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="done">Done</option>
                </select>
              </td>

              <td className="border p-2">{t.priority}</td>

              <td className="border p-2">
                {t.assignees?.length
                  ? t.assignees.map((u) => u.name).join(", ")
                  : "-"}
              </td>

              <td className="border p-2 flex gap-2">
                <button onClick={() => startEdit(t)} className="text-blue-600">
                  Edit
                </button>
                <button
                  onClick={() => deleteTask(t._id).then(loadTasks)}
                  className="text-red-600"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
