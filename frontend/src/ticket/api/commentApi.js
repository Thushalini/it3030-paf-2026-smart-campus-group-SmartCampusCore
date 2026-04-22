import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export const getComments = (ticketId) =>
  axios.get(`${API_BASE}/tickets/${ticketId}/comments`);

export const addComment = (ticketId, content) =>
  axios.post(`${API_BASE}/tickets/${ticketId}/comments`, { content });

export const updateComment = (ticketId, commentId, content) =>
  axios.put(`${API_BASE}/tickets/${ticketId}/comments/${commentId}`, { content });

export const deleteComment = (ticketId, commentId) =>
  axios.delete(`${API_BASE}/tickets/${ticketId}/comments/${commentId}`);
// TODO: backend will enforce ownership via JWT claims later