import { createBrowserRouter } from "react-router-dom";
import ProtectedLayout from "../layout/ProtectedLayout";

import Dashboard from "../pages/dashboard/Dashboard";
import Projects from "../pages/projects/Projects";
import Members from "../pages/members/Members";
import Settings from "../pages/settings/Settings";
import Login from "../pages/auth/Login";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/",
    element: <ProtectedLayout />,
    children: [
      { path: "dashboard", element: <Dashboard /> },
      { path: "projects", element: <Projects /> },
      { path: "members", element: <Members /> },
      { path: "settings", element: <Settings /> },
    ],
  },
]);
