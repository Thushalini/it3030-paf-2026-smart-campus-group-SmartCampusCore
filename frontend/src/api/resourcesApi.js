import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8080/api",
});

// ✅ Attach JWT token to every request automatically
API.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("token"); // make sure key matches what you store on login
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const getResources = (params) => API.get("/resources", { params });
export const getResourceById = (id) => API.get(`/resources/${id}`);
export const createResource = (data) => API.post("/resources", data);
export const updateResource = (id, data) => API.put(`/resources/${id}`, data);
export const deleteResource = (id) => API.delete(`/resources/${id}`);
export const getResourceAnalytics = (params) => API.get("/resources/analytics", { params });

export const uploadResourceImages = (files) => {
  const formData = new FormData();
  (files || []).forEach((file) => {
    formData.append("files", file);
  });
  return API.post("admin/resources/upload-images", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};