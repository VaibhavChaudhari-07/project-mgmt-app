import { useEffect, useState } from "react";
import { socket } from "../services/socket";
import { getNotifications } from "../services/notification.service";

export default function NotificationBell() {
  const [count, setCount] = useState(0);

  const loadCount = async () => {
    const res = await getNotifications();
    const unread = res.data.filter(n => !n.read).length;
    setCount(unread);
  };

  useEffect(() => {
    socket.connect();

    const user = JSON.parse(localStorage.getItem("user"));
    if (user?._id) socket.emit("join", user._id);

    loadCount();

    socket.on("notification", () => {
      loadCount();
    });

    return () => socket.off("notification");
  }, []);

  return (
    <div className="relative cursor-pointer">
      🔔
      {count > 0 && (
        <span className="absolute -top-1 -right-2 bg-red-600 text-white text-xs px-1 rounded">
          {count}
        </span>
      )}
    </div>
  );
}
