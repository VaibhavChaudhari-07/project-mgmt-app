import { NavLink, Outlet } from "react-router-dom";
import { useContext } from "react";
import { LanguageContext } from "../../context/LanguageContext";

export default function SettingsLayout() {
  const { t } = useContext(LanguageContext);

  const linkClass = ({ isActive }) =>
    `block px-4 py-2 rounded transition ${
      isActive
        ? "bg-blue-600 text-white"
        : "hover:bg-gray-200 dark:hover:bg-gray-700"
    }`;

  return (
    <div className="flex min-h-[80vh] bg-gray-50 dark:bg-gray-900 text-black dark:text-white">
      <div className="w-64 border-r border-gray-300 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
        <h2 className="text-xl font-bold mb-4">⚙ {t("settingsTitle")}</h2>

        <nav className="space-y-1">
          <NavLink to="profile" className={linkClass}>
            👤 {t("profile")}
          </NavLink>

          <NavLink to="notifications" className={linkClass}>
            🔔 {t("notifications")}
          </NavLink>

          <NavLink to="activity" className={linkClass}>
            📜 {t("activity")}
          </NavLink>
        </nav>
      </div>

      <div className="flex-1 p-6 bg-white dark:bg-gray-900">
        <Outlet />
      </div>
    </div>
  );
}
