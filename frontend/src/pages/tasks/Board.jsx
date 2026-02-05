import { useEffect, useState } from "react";
import { getMyTasks } from "../../services/task.service";

export default function Board() {
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

  // Get unique statuses and group tasks by status
  const statuses = ["todo", "inprogress", "review", "done"];
  const groupedTasks = {};

  statuses.forEach((status) => {
    groupedTasks[status] = tasks.filter(
      (task) => (task.status || "todo") === status
    );
  });

  const statusLabels = {
    todo: "To Do",
    inprogress: "In Progress",
    review: "In Review",
    done: "Done",
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Board</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Kanban board view of tasks assigned to you
        </p>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
        </div>
      )}

      {!loading && tasks.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">📭</div>
          <div className="text-gray-500 dark:text-gray-400">
            No tasks assigned to you yet
          </div>
        </div>
      )}

      {!loading && tasks.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pb-6">
          {statuses.map((status) => (
            <div
              key={status}
              className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {statusLabels[status]}
                </h3>
                <span className="bg-gray-300 dark:bg-gray-700 text-xs font-semibold px-2 py-1 rounded">
                  {groupedTasks[status].length}
                </span>
              </div>

              <div className="space-y-3">
                {groupedTasks[status].map((task) => (
                  <div
                    key={task._id}
                    className={`border-l-4 rounded p-3 cursor-move transition-all duration-200 hover:shadow-md border ${getPriorityColor(
                      task.priority
                    )}`}
                  >
                    <div className="flex items-start gap-2 mb-2">
                      <span className="text-lg">
                        {getPriorityIcon(task.priority)}
                      </span>
                      <span
                        className={`text-xs font-semibold rounded px-1.5 py-0.5 ${getPriorityBadge(
                          task.priority
                        )}`}
                      >
                        {task.priority?.toUpperCase() || "NONE"}
                      </span>
                    </div>

                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                       {task.title}
                    </div>

                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                       {task.project?.name || "Unknown Project"}
                    </div>

                    {task.description && (
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                        {task.description}
                      </div>
                    )}

                    <div className="text-xs text-gray-500 dark:text-gray-500">
                      {new Date(task.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
