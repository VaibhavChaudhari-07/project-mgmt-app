import { useEffect, useState } from "react";
import { socket } from "../../services/socket";
import {
  getNotifications,
  markTabAsRead,
  markAsRead,
  deleteNotification,
} from "../../services/notification.service";

export default function Notifications() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Project");

  const TABS = ["Project", "Tasks", "Comments", "Project Invitation"];

  const loadNotifications = async () => {
    try {
      const res = await getNotifications();
      setList(res.data || []);
    } catch (err) {
      console.error("Failed to load notifications", err);
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    try {
      await Promise.all([
        markTabAsRead("Project"),
        markTabAsRead("Tasks"),
        markTabAsRead("Comments"),
        markTabAsRead("Project Invitation"),
      ]);
      loadNotifications();
    } catch (err) {
      console.error("Failed to mark read", err);
    }
  };

  const handleTabClick = async (tab) => {
    setActiveTab(tab);
    try {
      await markTabAsRead(tab);
    } catch (err) {
      console.error("Failed to mark tab read", err);
    }
    loadNotifications();
  };

  const handleNotificationClick = async (id) => {
    try {
      await markAsRead(id);
    } catch (err) {
      console.error("Failed to mark notification read", err);
    }
    loadNotifications();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this notification?")) return;
    try {
      await deleteNotification(id);
      loadNotifications();
    } catch (err) {
      console.error("Failed to delete notification", err);
    }
  };

  useEffect(() => {
    const init = async () => {
      await loadNotifications();
    };

    init();

    socket.on("notification", loadNotifications);

    return () => socket.off("notification");
  }, []);

  const unreadCount = list.filter((n) => !n.read).length;
  const tabUnread = (tab) => list.filter((n) => n.tab === tab && !n.read).length;
  const filtered = list.filter((n) => n.tab === activeTab);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 pt-16">
      <div className="max-w-4xl mx-auto h-screen flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">🔔 Notifications</h2>
            <p className="text-gray-600 mt-1">Stay updated with all your notifications</p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Mark all as read
            </button>
          )}
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
          </div>
        )}

        {!loading && list.length === 0 && (
          <div className="text-center py-12">
            <div className="text-5xl mb-3">📭</div>
            <div className="text-gray-600">No notifications yet. You're all caught up!</div>
          </div>
        )}

        {!loading && list.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col flex-1">
            {/* Tabs */}
            <div className="flex border-b bg-gradient-to-r from-blue-50 to-blue-50 overflow-x-auto">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => handleTabClick(tab)}
                  className={`flex-1 px-4 py-4 text-sm font-semibold transition relative whitespace-nowrap ${
                    activeTab === tab
                      ? "border-b-2 border-blue-600 text-blue-600 bg-white"
                      : "text-gray-600 hover:text-gray-900 hover:bg-blue-50"
                  }`}
                >
                  {tab}
                  {tabUnread(tab) > 0 && (
                    <span className="ml-2 inline-flex items-center justify-center w-6 h-6 bg-red-600 text-white text-xs font-bold rounded-full">
                      {tabUnread(tab) > 99 ? "99+" : tabUnread(tab)}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Notifications list */}
            <div className="p-4 flex-1 overflow-y-auto space-y-3">
              {filtered.length === 0 && (
                <div className="text-center text-gray-500 py-8">No notifications in {activeTab}</div>
              )}

              {filtered.map((n) => (
                <div
                  key={n._id}
                  className={`p-4 rounded-lg border-l-4 transition-all duration-200 hover:shadow-md flex justify-between items-start gap-3 ${
                    n.read
                      ? "bg-gray-50 border-gray-300"
                      : "bg-blue-50 border-blue-500 ring-1 ring-blue-100"
                  }`}
                >
                  <div className="flex-1 cursor-pointer" onClick={() => handleNotificationClick(n._id)}>
                    <div className={`text-sm font-medium ${
                      n.read ? "text-gray-700" : "text-gray-900 font-semibold"
                    }`}>
                      {n.message}
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      {new Date(n.createdAt).toLocaleDateString()} {new Date(n.createdAt).toLocaleTimeString()}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(n._id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded text-xs font-medium transition-colors"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
