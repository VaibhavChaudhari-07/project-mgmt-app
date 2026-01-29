import { api } from "./api";

export const getNotifications = () => api.get("/notifications");

export const markNotificationsRead = () => api.put("/notifications/read");
