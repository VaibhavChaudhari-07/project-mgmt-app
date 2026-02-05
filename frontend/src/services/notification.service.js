import { api } from "./api";

export const getNotifications = () => api.get("/notifications");

export const markAsRead = (notificationId) =>
  api.put(`/notifications/${notificationId}/read`);

export const markTabAsRead = (tab) =>
  api.put("/notifications/mark-tab-read", { tab });

export const deleteNotification = (notificationId) =>
  api.delete(`/notifications/${notificationId}`);

export const getUnreadCount = () => api.get("/notifications/unread-count");
