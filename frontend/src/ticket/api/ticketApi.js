import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export const createTicket = (ticketData) =>
  axios.post(`${API_BASE}/tickets`, ticketData, {
    headers: { "Content-Type": "application/json" }
  });

export const uploadAttachments = (ticketId, files) => {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  return axios.post(`${API_BASE}/tickets/${ticketId}/attachments`, formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
};

export const getMyTickets = (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, value);
    }
  });
  return axios.get(`${API_BASE}/tickets/my?${params.toString()}`);
};

export const getTicketById = (ticketId) =>
  axios.get(`${API_BASE}/tickets/${ticketId}`);

export const updateTicketStatus = (ticketId, data) =>
  axios.patch(`${API_BASE}/tickets/${ticketId}/status`, data);

export const assignTechnician = (ticketId, data) =>
  axios.patch(`${API_BASE}/tickets/${ticketId}/assign`, data);
// TODO: replace stubbed user filtering with JWT-based backend filtering later
