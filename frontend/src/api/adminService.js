import axios from "axios";

const API = "http://localhost:8080/api/users";

export const getAllUsers = (token) =>
  axios.get(API, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const assignRole = (id, role, token) =>
  axios.put(`${API}/admin/assign-role/${id}?role=${role}`, {}, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const updateUser = (id, user, token) =>
  axios.put(`${API}/${id}`, user, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const deleteUser = (id, token) =>
  axios.put(`${API}/admin/disable/${id}`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const enableUser = (id, token) => {
  return axios.put(
    `${API}/admin/enable/${id}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

