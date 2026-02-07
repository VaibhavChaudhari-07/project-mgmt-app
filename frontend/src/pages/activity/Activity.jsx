import { useEffect, useState } from "react";
import { getActivity } from "../../services/activity.service";

export default function Activity() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getActivity();
        setList(res.data || []);
      } catch (err) {
        console.error("Failed to load activity", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const getActivityTypeColor = (action) => {
    const actionLower = action?.toLowerCase() || "";

    if (
      actionLower.includes("project") ||
      actionLower.includes("created project")
    ) {
      return {
        bg: "bg-blue-50 dark:bg-blue-900/20",
        border: "border-blue-200 dark:border-blue-700",
        icon: "🗂️",
        type: "Project",
      };
    } else if (
      actionLower.includes("task") ||
      actionLower.includes("created task")
    ) {
      return {
        bg: "bg-purple-50 dark:bg-purple-900/20",
        border: "border-purple-200 dark:border-purple-700",
        icon: "✓",
        type: "Task",
      };
    } else if (
      actionLower.includes("comment") ||
      actionLower.includes("commented")
    ) {
      return {
        bg: "bg-green-50 dark:bg-green-900/20",
        border: "border-green-200 dark:border-green-700",
        icon: "💬",
        type: "Comment",
      };
    } else if (actionLower.includes("status")) {
      return {
        bg: "bg-orange-50 dark:bg-orange-900/20",
        border: "border-orange-200 dark:border-orange-700",
        icon: "🔄",
        type: "Status",
      };
    } else if (
      actionLower.includes("member") ||
      actionLower.includes("team")
    ) {
      return {
        bg: "bg-pink-50 dark:bg-pink-900/20",
        border: "border-pink-200 dark:border-pink-700",
        icon: "👥",
        type: "Team",
      };
    } else {
      return {
        bg: "bg-gray-50 dark:bg-gray-900/20",
        border: "border-gray-200 dark:border-gray-700",
        icon: "📝",
        type: "Activity",
      };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 pt-16">
      <div className="max-w-4xl mx-auto h-screen flex flex-col">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">📊 Activity History</h2>
          <p className="text-gray-600">
            Track all your actions and changes across the platform
          </p>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
          </div>
        )}

        {!loading && list.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📭</div>
            <div className="text-lg text-gray-600">
              No activity yet. Start by creating projects or tasks!
            </div>
          </div>
        )}

        {!loading && list.length > 0 && (
          <div className="flex-1 overflow-y-auto space-y-4">
            {list.map((a) => {
              const activityType = getActivityTypeColor(a.action);
              return (
                <div
                  key={a._id}
                  className={`rounded-xl p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 border-l-4 bg-white ${activityType.border}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">{activityType.icon}</div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                          activityType.type === 'Project' ? 'bg-blue-100 text-blue-700' :
                          activityType.type === 'Task' ? 'bg-purple-100 text-purple-700' :
                          activityType.type === 'Comment' ? 'bg-green-100 text-green-700' :
                          activityType.type === 'Status' ? 'bg-orange-100 text-orange-700' :
                          activityType.type === 'Team' ? 'bg-pink-100 text-pink-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {activityType.type}
                        </span>
                      </div>

                      <div className="text-base font-medium text-gray-900 mb-1">
                        <b className="text-blue-600">{a.user?.name || "You"}</b> <span className="text-gray-600">{a.action || "performed an action"}</span>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                        {a.project?.name && (
                          <div className="flex items-center gap-1">
                            <span>📁</span>
                            <span><b>{a.project.name}</b></span>
                          </div>
                        )}
                        <div className="text-xs text-gray-400">
                          {new Date(a.createdAt).toLocaleDateString()} {new Date(a.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
