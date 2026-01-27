import { createBrowserRouter } from "react-router-dom";
import ProtectedLayout from "../layout/ProtectedLayout";

import Dashboard from "../pages/dashboard/Dashboard";
import Projects from "../pages/projects/Projects";
import Members from "../pages/members/Members";
import Settings from "../pages/settings/Settings";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ProjectTasks from "../pages/projects/ProjectTasks";



export const router = createBrowserRouter([
  { path: "/", element: <Login /> },
  { path: "/register", element: <Register /> },

  {
    path: "/",
    element: <ProtectedLayout />,
    children: [
      { path: "dashboard", element: <Dashboard /> },
      { path: "projects", element: <Projects /> },
      { path: "members", element: <Members /> },
      { path: "settings", element: <Settings /> },
      { path: "projects/:projectId/tasks", element: <ProjectTasks /> },

    ],
  },
]);
