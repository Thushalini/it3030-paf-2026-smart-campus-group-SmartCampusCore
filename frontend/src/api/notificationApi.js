import axios from "axios";

const API_URL = "http://localhost:8080/api/notifications";

const getAuthHeader = () => ({
  headers: {
    Authorization: `Bearer ${sessionStorage.getItem("token")}`,
  },
});

export const getNotifications = () => {
  return axios.get(API_URL, getAuthHeader());
};

export const getUnreadCount = () => {
  return axios.get(`${API_URL}/unread-count`, getAuthHeader());
};

export const markAsRead = (id) => {
  return axios.put(`${API_URL}/${id}/read`, {}, getAuthHeader());
};

export const markAllAsRead = () => {
  return axios.put(`${API_URL}/mark-all-read`, {}, getAuthHeader());
};

// Admin APIs

export const broadcastNotification = (message, type = "ANNOUNCEMENT") => {
  return axios.post(
    `${API_URL.replace("notifications", "admin/notifications")}/broadcast`,
    { message, type },
    getAuthHeader()
  );
};

export const sendToRole = (role, message, type = "ANNOUNCEMENT") => {
  return axios.post(
    `${API_URL.replace("notifications", "admin/notifications")}/role/${role}`,
    { message, type },
    getAuthHeader()
  );
};

export const getNotificationHistory = () => {
  return axios.get(
    `${API_URL.replace("notifications", "admin/notifications")}/history`,
    getAuthHeader()
  );
};

export const deleteNotification = (id) => {
  return axios.delete(
    `${API_URL.replace("notifications", "admin/notifications")}/${id}`,
    getAuthHeader()
  );
};

export const deleteNotificationLog = (logId) => {
  return axios.delete(
    `${API_URL.replace("notifications", "admin/notifications")}/log/${logId}`,
    getAuthHeader()
  );
};

const ADMIN_URL = "http://localhost:8080/api/admin/notifications";

export const getAllNotificationsAdmin = (type = "") => {
  const params = type ? `?type=${type}` : "";
  return axios.get(`${ADMIN_URL}/all${params}`, getAuthHeader());
};

export const deleteNotificationById = (id) => {
  return axios.delete(`${ADMIN_URL}/${id}`, getAuthHeader());
};