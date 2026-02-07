import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useContext, useState } from "react";
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

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarMinimized, setSidebarMinimized] = useState(false);

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

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleSidebarMinimize = () => {
    setSidebarMinimized(!sidebarMinimized);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // Dynamic margin based on sidebar state
  const sidebarWidth = sidebarMinimized ? "5rem" : "16rem";
  const sidebarMargin = `ml-0 md:ml-20 lg:${sidebarMinimized ? "ml-20" : "ml-64"}`;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-black dark:text-white">
      <Sidebar isOpen={sidebarOpen} isMinimized={sidebarMinimized} onClose={closeSidebar} />

      {/* Overlay for mobile when sidebar is open */}
      {sidebarOpen && (
        <div
          onClick={closeSidebar}
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
        />
      )}

      {/* Fixed header: leave space for sidebar with left offset */}
      <header className={`fixed top-0 left-0 right-0 flex justify-between items-center px-4 py-3 border-b bg-white dark:bg-gray-800 z-20 transition-all duration-300 ${
        sidebarMinimized ? "md:ml-20" : "md:ml-64"
      }`}>
        <div className="flex items-center gap-3">
          {/* Hamburger button for mobile */}
          <button
            onClick={toggleSidebar}
            className="md:hidden p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition"
            aria-label="Toggle sidebar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Minimize button for desktop */}
          <button
            onClick={toggleSidebarMinimize}
            className="hidden md:block p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition"
            aria-label="Toggle sidebar minimize"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16" />
            </svg>
          </button>

          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-semibold text-sm">
            {displayName?.split(" ")?.map((s) => s[0])?.slice(0, 2).join("")}
          </div>
          <div className="hidden sm:block">
            <div className="text-sm text-gray-700 dark:text-gray-200">Hi! <span className="font-semibold">{displayName}</span></div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{t("welcomeBack")}</div>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <button
            onClick={toggleLanguage}
            className="text-xs md:text-sm border px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            {language === "en" ? "🇬🇧" : "🇮🇳"}
          </button>

          <button
            onClick={toggleTheme}
            className="text-xs md:text-sm border px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            {theme === "dark" ? "🌙" : "☀️"}
          </button>

          <NotificationBell />
        </div>
      </header>

      {/* Main content section */}
      <main
        className={`transition-all duration-300 pt-24 min-h-[calc(100vh-6rem)] ${
          sidebarMinimized
            ? "md:ml-20 ml-0"
            : "md:ml-64 ml-0"
        } p-4 md:p-6`}
      >
        <Outlet />
      </main>
    </div>
  );
}
