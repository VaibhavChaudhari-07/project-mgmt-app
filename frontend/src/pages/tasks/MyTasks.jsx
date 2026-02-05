import { useEffect, useState } from "react";
import { getMyTasks } from "../../services/task.service";

export default function MyTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const tasksRes = await getMyTasks();
        setTasks(tasksRes.data || []);
      } catch (err) {
        console.error("Failed to load tasks", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // Priority levels
  const priorityOrder = { high: 1, medium: 2, low: 3 };

  // Sort tasks by priority
  const sortedTasks = [...tasks].sort(
    (a, b) =>
      (priorityOrder[a.priority] || 999) -
      (priorityOrder[b.priority] || 999)
  );

  // Get background color based on priority
  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700";
      case "medium":
        return "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700";
      case "low":
        return "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700";
      default:
        return "bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-700";
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "🔴";
      case "medium":
        return "🟡";
      case "low":
        return "🟢";
      default:
        return "⚪";
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/40";
      case "medium":
        return "text-yellow-700 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/40";
      case "low":
        return "text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/40";
      default:
        return "text-gray-700 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/40";
    }
  };

  const getStatusLabel = (status) => {
    switch (status?.toLowerCase()) {
      case "todo":
        return "To Do";
      case "inprogress":
        return "In Progress";
      case "review":
        return "In Review";
      case "done":
        return "Done";
      default:
        return status || "TODO";
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">My Tasks</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Tasks assigned to you, sorted by priority
        </p>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
        </div>
      )}

      {!loading && sortedTasks.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">📭</div>
          <div className="text-gray-500 dark:text-gray-400">
            No tasks assigned to you yet
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {sortedTasks.map((task) => (
          <div
            key={task._id}
            className={`rounded-xl p-5 border-l-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 bg-white border ${
              getPriorityColor(task.priority)
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className="text-2xl">{getPriorityIcon(task.priority)}</span>
                  <span
                    className={`inline-block px-3 py-1 text-xs font-bold rounded-full ${
                      getPriorityBadge(task.priority)
                    }`}
                  >
                    {task.priority?.toUpperCase() || "NORMAL"}
                  </span>
                  <span className={`text-xs px-3 py-1 font-semibold rounded-full ${
                    task.status?.toLowerCase() === 'done' ? 'bg-green-100 text-green-700' :
                    task.status?.toLowerCase() === 'inprogress' ? 'bg-blue-100 text-blue-700' :
                    task.status?.toLowerCase() === 'review' ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {getStatusLabel(task.status)}
                  </span>
                </div>

                <div className="mb-2">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {task.title}
                  </h3>
                  <p className="text-sm text-gray-600 inline-block px-2 py-1 bg-gray-100 rounded">
                    📁 {task.project?.name || "Unknown Project"}
                  </p>
                </div>

                {task.description && (
                  <div className="text-sm text-gray-700 mt-3 bg-gray-50 p-3 rounded">
                    {task.description}
                  </div>
                )}

                <div className="text-xs text-gray-500 mt-3">
                  ⏰ {new Date(task.createdAt).toLocaleDateString()} {new Date(task.createdAt).toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
