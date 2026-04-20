import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL; // ensure .env is set

// Create ticket (JSON only, without image)
export const createTicket = (ticketData) =>
  axios.post(`${API_BASE}/tickets`, ticketData, {
    headers: { "Content-Type": "application/json" }
    // TODO: add Authorization header once Member 4 JWT is integrated
  });

// Upload attachments (images, max 3)
export const uploadAttachments = (ticketId, files) => {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));

  return axios.post(`${API_BASE}/tickets/${ticketId}/attachments`, formData, {
    headers: { "Content-Type": "multipart/form-data" }
    // TODO: add Authorization header once Member 4 JWT is integrated
  });
};

// TODO: replace stubbed user filtering with JWT-based backend filtering later
