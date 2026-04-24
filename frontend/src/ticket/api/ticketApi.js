import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1";

const ticketApi = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

// Auto-attach JWT token (supports both localStorage keys our team uses)
ticketApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("token") 
             || localStorage.getItem("jwt") 
             || sessionStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Strip empty/null/undefined params so Spring doesn't try to convert "" into an Enum
const cleanParams = (params) => {
  if (!params) return {};
  return Object.fromEntries(
    Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== "")
  );
};

// ─── Existing exports (unchanged signatures so CreateTicketPage & co still work) ───
export const createTicket = (ticketData) => ticketApi.post(`/tickets`, ticketData);

export const uploadAttachments = (ticketId, files) => {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  return ticketApi.post(`/tickets/${ticketId}/attachments`, formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
};

export const getMyTickets = (filters = {}) => 
  ticketApi.get(`/tickets/my`, { params: cleanParams(filters) });

export const getTicketById = (ticketId) => ticketApi.get(`/tickets/${ticketId}`);

export const updateTicketStatus = (ticketId, data) => 
  ticketApi.patch(`/tickets/${ticketId}/status`, data);

export const assignTechnician = (ticketId, data) => 
  ticketApi.patch(`/tickets/${ticketId}/assign`, data);

export const getAllTickets = (filters = {}) => 
  ticketApi.get(`/tickets`, { params: cleanParams(filters) });

export const getTicketAnalytics = () => ticketApi.get(`/tickets/analytics`);

export const getTicketsByResource = (resourceId) => 
  ticketApi.get(`/tickets/resource/${resourceId}`);

// ─── New exports ───
export const getTechnicians = () => ticketApi.get(`/tickets/technicians`);

export default ticketApi;