import { createBrowserRouter } from "react-router-dom";
import ProtectedLayout from "../layout/ProtectedLayout";

import Dashboard from "../pages/dashboard/Dashboard";
import Projects from "../pages/projects/Projects";
import Members from "../pages/members/Members";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ProjectTasks from "../pages/projects/ProjectTasks";
import ProjectKanban from "../pages/projects/ProjectKanban";

import SettingsLayout from "../pages/settings/SettingsLayout.jsx";
import ProfileSettings from "../pages/settings/tabs/ProfileSettings.jsx";
import NotificationSettings from "../pages/settings/tabs/NotificationSettings.jsx";
import ActivitySettings from "../pages/settings/tabs/ActivitySettings.jsx";

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

      { path: "projects/:projectId/tasks", element: <ProjectTasks /> },
      { path: "projects/:projectId/kanban", element: <ProjectKanban /> },

      {
        path: "settings",
        element: <SettingsLayout />,
        children: [
          { index: true, element: <ProfileSettings /> },
          { path: "profile", element: <ProfileSettings /> },
          { path: "notifications", element: <NotificationSettings /> },
          { path: "activity", element: <ActivitySettings /> },
        ],
      },
    ],
  },
]);
