import axios from "axios";

const API = "http://localhost:8080/api/auth";

export const loginUser = (data) => {
    return axios.post(`${API}/login`, data);
};

export const signupUser = (data) => {
    return axios.post(`${API}/signup`, data);
};

export const forgotPassword = (email) => {
    return axios.post(`${API}/forgot-password`, { email });
};

export const resetPassword = (token, newPassword) => {
    return axios.post(`${API}/reset-password`, { token, newPassword });
};