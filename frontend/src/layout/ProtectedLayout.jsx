import { Navigate, Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function ProtectedLayout() {
  const token = localStorage.getItem("token");

  if (!token) return <Navigate to="/" />;

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ flex: 1, padding: "20px" }}>
        <Outlet />
      </div>
    </div>
  );
}
