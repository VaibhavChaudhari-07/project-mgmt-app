import { useEffect, useState } from "react";
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


export default function Dashboard() {
  const [data, setData] = useState(null);

  const loadData = async () => {
    const res = await getDashboardSummary();
    setData(res.data);
  };

  useEffect(() => {
    loadData();
  }, []);

  if (!data) return <div>Loading...</div>;

  const statusData = data.byStatus.map((s) => ({
    name: s._id,
    value: s.count,
  }));

  const priorityData = data.byPriority.map((p) => ({
    name: p._id,
    value: p.count,
  }));

  return (
    <div>
      <h1 className="text-2xl mb-4">Dashboard</h1>

      {/* Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card title="Projects" value={data.totalProjects} />
        <Card title="Tasks" value={data.totalTasks} />
        <Card title="Completed" value={data.completedTasks} />
        <Card title="Pending" value={data.pendingTasks} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="border p-4">
          <h3 className="font-bold mb-2">Tasks by Status</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={statusData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" />
            </BarChart>
          </ResponsiveContainer>

        </div>

        <div className="border p-4">
          <h3 className="font-bold mb-2">Tasks by Priority</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={priorityData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
              >
                {priorityData.map((_, i) => (
                  <Cell key={i} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>

        </div>
      </div>

      {/* Recent tasks */}
      <div className="border p-4">
        <h3 className="font-bold mb-2">Recent Tasks</h3>
        <ul>
          {data.recentTasks.map((t) => (
            <li key={t._id} className="border-b py-1">
              {t.title} — {t.status}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="border p-4 rounded shadow">
      <div className="text-gray-500">{title}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}
