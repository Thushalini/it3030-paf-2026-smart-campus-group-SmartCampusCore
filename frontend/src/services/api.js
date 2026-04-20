import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const bookingAPI = {
  createBooking: (bookingData) => api.post('/bookings', bookingData),
  getMyBookings: () => api.get('/bookings/my'),
  getAllBookings: (filters) => api.get('/bookings', { params: filters }),
  approveBooking: (id) => api.patch(`/bookings/${id}/approve`),
  rejectBooking: (id, reason) => api.patch(`/bookings/${id}/reject`, { reason }),
  cancelBooking: (id) => api.patch(`/bookings/${id}/cancel`),
};

export const resourceAPI = {
  getActiveResources: () => api.get('/resources'),
};

export const authAPI = {
  login: (email, name, role) => api.post('/auth/login', null, { 
    params: { email, name, role } 
  }),
  getCurrentUser: () => api.get('/auth/me'),
};

export default api;
