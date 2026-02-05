import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useContext } from "react";
import Sidebar from "./Sidebar";
import NotificationBell from "../components/NotificationBell";
import { LanguageContext } from "../context/LanguageContext";
import { ThemeContext } from "../context/ThemeContext";

export default function ProtectedLayout() {
  const token = localStorage.getItem("token");
  const { language, setLanguage, t } = useContext(LanguageContext);

  const user = JSON.parse(localStorage.getItem("user") || null);
  const displayName = user?.name || "User";

  const { theme, setTheme } = useContext(ThemeContext);

  if (!token) return <Navigate to="/" />;

  useEffect(() => {
    // Ensure document class matches context theme on mount/update
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const toggleLanguage = () => {
    const next = language === "en" ? "hi" : "en";
    setLanguage(next);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-black dark:text-white">
      <Sidebar />

      {/* Fixed header: leave space for sidebar with left offset */}
      <header className="fixed top-0 left-64 right-0 flex justify-between items-center px-4 py-3 border-b bg-white dark:bg-gray-800 z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-semibold">
            {displayName?.split(" ")?.map((s) => s[0])?.slice(0, 2).join("")}
          </div>
          <div>
            <div className="text-sm text-gray-700 dark:text-gray-200">Hi! <span className="font-semibold">{displayName}</span></div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{t("welcomeBack")}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleLanguage}
            className="text-sm border px-2 py-1 rounded"
          >
            {language === "en" ? "🇬🇧 EN" : "🇮🇳 HI"}
          </button>

          <button onClick={toggleTheme} className="text-sm border px-2 py-1 rounded">
            {theme === "dark" ? "🌙 Dark" : "☀️ Light"}
          </button>

          <NotificationBell />
        </div>
      </header>

      {/* Main content: offset for sidebar (left-64) and header (approx h-16) */}
      <main className="ml-64 pt-16 p-6 min-h-[calc(100vh-4rem)]">
        <Outlet />
      </main>
    </div>
  );
}
