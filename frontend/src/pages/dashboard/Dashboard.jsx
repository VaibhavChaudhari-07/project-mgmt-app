import { useEffect, useState, useContext } from "react";
import { getDashboardSummary } from "../../services/dashboard.service";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { LanguageContext } from "../../context/LanguageContext";

const STATUS_COLORS = {
  todo: "#9ca3af",       // gray
  inprogress: "#2563eb", // blue
  review: "#7c3aed",     // purple
  done: "#16a34a",       // green
};

const PRIORITY_COLORS = {
  high: "#dc2626",   // red
  medium: "#facc15", // yellow
  low: "#16a34a",    // green
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const { t } = useContext(LanguageContext);

  useEffect(() => {
    getDashboardSummary().then((res) => setData(res.data));
  }, []);

  if (!data) return <div className="p-6">Loading...</div>;

  const statusData = (data.byStatus || []).map((s) => ({
    name: s._id,
    value: s.count,
  }));

  const priorityData = (data.byPriority || []).map((p) => ({
    name: p._id,
    value: p.count,
  }));

  return (
    <div className="p-6 pt-16 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-semibold mb-6">{t("dashboard")}</h1>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card title={t("projects")} value={data.totalProjects} />
        <Card title={t("tasks")} value={data.totalTasks} />
        <Card title={t("completed")} value={data.completedTasks} />
        <Card title={t("pending")} value={data.pendingTasks} />
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* TASKS BY STATUS */}
        <div className="bg-white rounded-xl p-5 shadow">
          <h3 className="font-semibold mb-4">Tasks by Status</h3>

          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={statusData}>
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value">
                {statusData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={STATUS_COLORS[entry.name] || "#2563eb"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* TASKS BY PRIORITY */}
        <div className="bg-white rounded-xl p-5 shadow">
          <h3 className="font-semibold mb-4">Tasks by Priority</h3>

          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={priorityData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={95}
                label
              >
                {priorityData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={PRIORITY_COLORS[entry.name] || "#9ca3af"}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* RECENT TASKS */}
      <div className="bg-white rounded-xl p-5 shadow">
        <h3 className="font-semibold mb-4">{t("recentTasks")}</h3>

        {data.recentTasks.length === 0 ? (
          <p className="text-sm text-gray-500">No recent tasks</p>
        ) : (
          <ul className="space-y-3">
            {data.recentTasks.map((task) => (
              <li
                key={task._id}
                className="flex justify-between items-center border-b pb-2 text-sm"
              >
                <span className="font-medium">{task.title}</span>

                <span
                  className="px-2 py-0.5 rounded text-xs font-semibold text-white"
                  style={{
                    backgroundColor:
                      STATUS_COLORS[task.status] || "#6b7280",
                  }}
                >
                  {task.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/* ---------------- CARD ---------------- */

function Card({ title, value }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}