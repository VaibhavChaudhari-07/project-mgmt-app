import { useEffect, useState } from "react";
import { socket } from "../../../services/socket";
import {
  getNotifications,
  markNotificationsRead,
} from "../../../services/notification.service";

export default function NotificationSettings() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

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
      await markNotificationsRead();
      loadNotifications();
    } catch (err) {
      console.error("Failed to mark read", err);
    }
  };

  useEffect(() => {
    const init = async () => {
      await loadNotifications();
      await markNotificationsRead();
      loadNotifications();
    };

    init();

    socket.on("notification", loadNotifications);

    return () => socket.off("notification");
  }, []);

  const unreadCount = list.filter((n) => !n.read).length;

  return (
    <div className="max-w-2xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Notifications</h2>

        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-sm bg-blue-600 text-white px-3 py-1 rounded"
          >
            Mark all as read
          </button>
        )}
      </div>

      {loading && <div>Loading...</div>}

      {!loading && list.length === 0 && (
        <div className="text-gray-500">No notifications yet.</div>
      )}

      <div className="space-y-3">
        {list.map((n) => (
          <div
            key={n._id}
            className={`border p-3 rounded text-sm ${
              n.read
                ? "bg-gray-50 dark:bg-gray-800"
                : "bg-blue-50 dark:bg-gray-700 border-blue-400"
            }`}
          >
            <div>{n.message}</div>
            <div className="text-xs text-gray-500 mt-1">
              {new Date(n.createdAt).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
