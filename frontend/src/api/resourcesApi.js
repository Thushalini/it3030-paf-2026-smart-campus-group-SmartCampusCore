import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8084/api",
});

export const getResources = (params) => API.get("/resources", { params });
export const getResourceById = (id) => API.get(`/resources/${id}`);
export const createResource = (data) => API.post("/resources", data);
export const updateResource = (id, data) => API.put(`/resources/${id}`, data);
export const deleteResource = (id) => API.delete(`/resources/${id}`);