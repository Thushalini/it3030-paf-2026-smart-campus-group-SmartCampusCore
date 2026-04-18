import axios from "axios";

const API_URL = "http://localhost:8080/api/notifications";

const getAuthHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
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