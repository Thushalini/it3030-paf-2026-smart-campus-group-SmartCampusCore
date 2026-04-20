import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export const getComments = (ticketId) =>
  axios.get(`${API_BASE}/tickets/${ticketId}/comments`);

export const addComment = (ticketId, content) =>
  axios.post(`${API_BASE}/tickets/${ticketId}/comments`, { content });
// TODO: backend will enforce ownership via JWT claims later
