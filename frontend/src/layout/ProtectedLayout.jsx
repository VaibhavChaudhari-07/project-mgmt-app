import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import Sidebar from "./Sidebar";
import NotificationBell from "../components/NotificationBell";
import { LanguageContext } from "../context/LanguageContext";

export default function ProtectedLayout() {
  const token = localStorage.getItem("token");
  const { language, setLanguage, t } = useContext(LanguageContext);

  const [darkMode, setDarkMode] = useState(false);

  if (!token) return <Navigate to="/" />;

  useEffect(() => {
    const themePref = localStorage.getItem("theme") || "light";
    const isDark = themePref === "dark";
    setDarkMode(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggleTheme = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  const toggleLanguage = () => {
    const next = language === "en" ? "hi" : "en";
    setLanguage(next);
  };

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 text-black dark:text-white">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-center px-4 py-2 border-b bg-white dark:bg-gray-800">
          <h1 className="font-semibold text-lg">{t("projectManager")}</h1>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleLanguage}
              className="text-sm border px-2 py-1 rounded"
            >
              {language === "en" ? "🇬🇧 EN" : "🇮🇳 HI"}
            </button>

            <button
              onClick={toggleTheme}
              className="text-sm border px-2 py-1 rounded"
            >
              {darkMode ? "🌙 Dark" : "☀️ Light"}
            </button>

            <NotificationBell />
          </div>
        </div>

        <div className="flex-1 p-4 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
