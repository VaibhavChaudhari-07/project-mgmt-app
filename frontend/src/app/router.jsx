import { createBrowserRouter } from "react-router-dom";
import ProtectedLayout from "../layout/ProtectedLayout";

import Dashboard from "../pages/dashboard/Dashboard";
import Projects from "../pages/projects/Projects";
import Members from "../pages/members/Members";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ProjectTasks from "../pages/projects/ProjectTasks";
import ProjectKanban from "../pages/projects/ProjectKanban";
import MyTasks from "../pages/tasks/MyTasks";
import Board from "../pages/tasks/Board";

import Notifications from "../pages/notifications/Notifications";
import Activity from "../pages/activity/Activity";
import Profile from "../pages/profile/Profile";

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
      { path: "my-tasks", element: <MyTasks /> },
      { path: "board", element: <Board /> },

      { path: "projects/:projectId/tasks", element: <ProjectTasks /> },
      { path: "projects/:projectId/kanban", element: <ProjectKanban /> },

      { path: "notifications", element: <Notifications /> },
      { path: "activity", element: <Activity /> },
      { path: "profile", element: <Profile /> },
    ],
  },
]);
