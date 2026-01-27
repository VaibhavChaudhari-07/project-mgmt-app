import { api } from "./api";

export const getProjects = () => api.get("/projects");

export const createProject = (data) => api.post("/projects", data);

export const updateProject = (id, data) =>
  api.put(`/projects/${id}`, data);

export const deleteProject = (id) =>
  api.delete(`/projects/${id}`);

export const addMember = (id, email) =>
  api.post(`/projects/${id}/members`, { email });

export const removeMember = (id, userId) =>
  api.delete(`/projects/${id}/members/${userId}`);
