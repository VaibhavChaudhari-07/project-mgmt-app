import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../services/socket";
import { getUnreadCount } from "../services/notification.service";

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  const loadUnreadCount = async () => {
    try {
      const res = await getUnreadCount();
      setUnreadCount(res.data?.count || 0);
    } catch (err) {
      console.error("Failed to load unread count:", err);
    }
  };

  useEffect(() => {
    socket.connect();

    const user = JSON.parse(localStorage.getItem("user"));
    if (user?._id) socket.emit("join", user._id);

    loadUnreadCount();

    socket.on("notification", () => {
      loadUnreadCount();
    });

    return () => socket.off("notification");
  }, []);

  const handleClick = () => {
    // Navigate to notifications page
    navigate("/notifications");
  };

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        title="Notifications"
        className="relative p-2 hover:bg-gray-100 rounded-full transition"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>
    </div>
  );
}
