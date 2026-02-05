import { NavLink } from "react-router-dom";
import { useContext } from "react";
import { LanguageContext } from "../context/LanguageContext";

export default function Sidebar() {
  const { t } = useContext(LanguageContext);

  const items = [
    { to: "/dashboard", label: t("dashboard"), color: "text-teal-300" },
    { to: "/projects", label: t("projects"), color: "text-indigo-300" },
    { to: "/my-tasks", label: "My Tasks", color: "text-red-300" },
    { to: "/board", label: "Board", color: "text-yellow-300" },
    { to: "/members", label: t("members"), color: "text-pink-300" },
  ];

  const topItems = [
    { to: "/dashboard", label: t("dashboard"), color: "text-teal-300", icon: "📊" },
    { to: "/projects", label: t("projects"), color: "text-indigo-300", icon: "📁" },
    { to: "/my-tasks", label: "My Tasks", color: "text-red-300", icon: "✓" },
    { to: "/board", label: "Board", color: "text-yellow-300", icon: "📋" },
    { to: "/members", label: t("members"), color: "text-pink-300", icon: "👥" },
    // Direct notifications and activity links (point to settings sub-pages)
    { to: "/notifications", label: "Notifications", color: "text-amber-300", icon: "🔔" },
    { to: "/activity", label: "Activity", color: "text-lime-300", icon: "📝" },
  ];

  const profileItem = { to: "/profile", label: "Profile", color: "text-gray-300", icon: "👤" };

  return (
    <aside className="fixed left-0 top-0 w-64 h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 text-white p-5 z-40 flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center font-bold text-lg">TS</div>
        <div>
          <h2 className="text-xl font-bold">TaskSprint</h2>
          <div className="text-xs text-gray-400">Project Management</div>
        </div>
      </div>

      {/* Scrollable nav items */}
      <nav className="flex flex-col gap-2 flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
        {topItems.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded transition ${it.color} ${
                isActive
                  ? "bg-white/8 shadow-lg scale-100 ring-1 ring-white/10"
                  : "hover:bg-white/5"
              }`
            }
          >
            <span className="text-lg">{it.icon}</span>
            <span className="font-medium text-sm">{it.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Fixed profile button at bottom */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <NavLink
          to={profileItem.to}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded transition ${profileItem.color} ${
              isActive
                ? "bg-white/8 shadow-lg scale-100 ring-1 ring-white/10"
                : "hover:bg-white/5"
            }`
          }
        >
          <span className="text-lg">{profileItem.icon}</span>
          <span className="font-medium text-sm">{profileItem.label}</span>
        </NavLink>
      </div>
    </aside>
  );
}
