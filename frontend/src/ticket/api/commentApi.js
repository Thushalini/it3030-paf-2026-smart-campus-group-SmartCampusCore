import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1";

const commentApi = axios.create({ baseURL: API_BASE });

commentApi.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token") 
             || sessionStorage.getItem("jwt") 
             || sessionStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

export const getComments = (ticketId) => commentApi.get(`/tickets/${ticketId}/comments`);

export const addComment = (ticketId, content) => commentApi.post(`/tickets/${ticketId}/comments`, { content });

export const updateComment = (ticketId, commentId, content) => commentApi.put(`/tickets/${ticketId}/comments/${commentId}`, { content });

export const deleteComment = (ticketId, commentId) => commentApi.delete(`/tickets/${ticketId}/comments/${commentId}`);