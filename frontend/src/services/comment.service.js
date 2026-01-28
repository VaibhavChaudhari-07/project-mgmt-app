import { api } from "./api";

export const getCommentsByTicket = (ticketId) =>
  api.get(`/comments/ticket/${ticketId}`);

export const createComment = (data) =>
  api.post("/comments", data);
