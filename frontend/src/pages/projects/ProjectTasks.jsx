import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getTasks,
  createTask,
  deleteTask,
  updateTask,
} from "../../services/task.service";
import { getProjectById } from "../../services/project.service";

export default function ProjectTasks() {
  const { projectId } = useParams();

  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);

  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("medium");
  const [assignee, setAssignee] = useState("");
  const [editTaskId, setEditTaskId] = useState(null);

  const loadTasks = async () => {
    const res = await getTasks(projectId);
    setTasks(res.data);
  };

  const loadMembers = async () => {
    const res = await getProjectById(projectId);
    setMembers(res.data.members || []);
  };

  useEffect(() => {
    loadTasks();
    loadMembers();
  }, [projectId]);

  const handleSave = async () => {
    if (!title) return alert("Title required");

    const payload = {
      title,
      priority,
      assignee: assignee || null,
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
    setAssignee("");
    loadTasks();
  };

  const startEdit = (task) => {
    setEditTaskId(task._id);
    setTitle(task.title);
    setPriority(task.priority);
    setAssignee(task.assignee?._id || "");
  };

  // ✅ NEW: status change handler
  const handleStatusChange = async (taskId, newStatus) => {
    await updateTask(taskId, { status: newStatus });
    loadTasks();
  };

  return (
    <div>
      <h2 className="text-xl mb-3">Tasks</h2>

      {/* Create / Edit task */}
      <div className="flex gap-2 mb-4">
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

        <select
          className="border p-2"
          value={assignee}
          onChange={(e) => setAssignee(e.target.value)}
        >
          <option value="">Unassigned</option>
          {members.map((m) => (
            <option key={m._id} value={m._id}>
              {m.name}
            </option>
          ))}
        </select>

        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-3"
        >
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
            <th className="border p-2">Assignee</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((t) => (
            <tr key={t._id}>
              <td className="border p-2">{t.title}</td>

              {/* ✅ Status dropdown */}
              <td className="border p-2">
                <select
                  className="border p-1"
                  value={t.status}
                  onChange={(e) =>
                    handleStatusChange(t._id, e.target.value)
                  }
                >
                  <option value="todo">To Do</option>
                  <option value="inprogress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="done">Done</option>
                </select>
              </td>

              <td className="border p-2">{t.priority}</td>
              <td className="border p-2">
                {t.assignee?.name || "-"}
              </td>

              <td className="border p-2 flex gap-2">
                <button
                  onClick={() => startEdit(t)}
                  className="text-blue-600"
                >
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
