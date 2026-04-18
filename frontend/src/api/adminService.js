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

// import axios from "axios";

// const API = "http://localhost:8080/api";

// // ✅ Get all users
// export const getAllUsers = async (token) => {
//   return axios.get(`${API}/users`, {
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   });
// };

// // ✅ Assign role
// export const assignRole = async (id, role, token) => {
//   return axios.put(
//     `${API}/admin/assign-role/${id}?role=${role}`,
//     {},
//     {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     }
//   );
// };

// // ✅ Delete user
// export const deleteUser = async (id, token) => {
//   return axios.delete(`${API}/users/${id}`, {
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   });
// };