import { Link } from "react-router-dom";
import { useContext } from "react";
import { LanguageContext } from "../context/LanguageContext";

export default function Sidebar() {
  const { t } = useContext(LanguageContext);

  return (
    <div className="w-64 h-screen bg-gray-900 text-white p-4">
      <h2 className="text-xl font-bold mb-6">TaskSprint</h2>

      <nav className="flex flex-col gap-3">
        <Link to="/dashboard">{t("dashboard")}</Link>
        <Link to="/projects">{t("projects")}</Link>
        <Link to="/members">{t("members")}</Link>
        <Link to="/settings">{t("settings")}</Link>
      </nav>
    </div>
  );
}
