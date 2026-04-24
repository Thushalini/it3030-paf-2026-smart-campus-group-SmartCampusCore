import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1";

const ticketApi = axios.create({ baseURL: API_BASE });

// Auto-attach JWT token from sessionStorage (set by Member 4's OAuth login)
ticketApi.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token") 
             || sessionStorage.getItem("jwt") 
             || sessionStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

export const createTicket = (ticketData) => ticketApi.post(`/tickets`, ticketData);

export const uploadAttachments = (ticketId, files) => {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  return ticketApi.post(`/tickets/${ticketId}/attachments`, formData, {
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
  return ticketApi.get(`/tickets/my?${params.toString()}`);
};

export const getTicketById = (ticketId) => ticketApi.get(`/tickets/${ticketId}`);

export const updateTicketStatus = (ticketId, data) => ticketApi.patch(`/tickets/${ticketId}/status`, data);

export const assignTechnician = (ticketId, data) => ticketApi.patch(`/tickets/${ticketId}/assign`, data);

// Chunk 11 exports
export const getAllTickets = (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, value);
    }
  });
  return ticketApi.get(`/tickets?${params.toString()}`);
};

export const getTicketAnalytics = () => ticketApi.get(`/tickets/analytics`);

export const getTicketsByResource = (resourceId) => ticketApi.get(`/tickets/resource/${resourceId}`);

export default ticketApi;