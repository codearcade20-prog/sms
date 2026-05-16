import axios from 'axios';

const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the JWT token in every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('GLOBAL API ERROR:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message
    });
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async ({ email, password }) => {
    return await api.post('/auth/login', { email, password });
  },
  register: async (userData) => {
    return await api.post('/auth/register', userData);
  },
};

export const userAPI = {
  getMe: async () => {
    return await api.get('/users/me');
  },
  updateMe: async (data) => {
    return await api.patch('/users/me', data);
  },
  getAll: async () => {
    return await api.get('/users');
  },
  updateStatus: async (id, status, resignationReason = '') => {
    return await api.patch(`/users/${id}/status`, { status, resignationReason });
  },
  // If the backend doesn't have a general update route yet, we'll use this
  updateUser: async (id, updateData) => {
    return await api.patch(`/users/${id}`, updateData);
  },
};

export const taskAPI = {
  getAll: async () => {
    return await api.get('/tasks');
  },
  getMyTasks: async () => {
    return await api.get('/tasks/my');
  },
  create: async (taskData) => {
    return await api.post('/tasks', taskData);
  },
  updateStatus: async (id, status) => {
    return await api.patch(`/tasks/${id}/status`, { status });
  },
};

export const feedbackAPI = {
  getAll: async () => {
    return await api.get('/feedback');
  },
  submit: async (feedbackData) => {
    return await api.post('/feedback', feedbackData);
  },
};

export const statsAPI = {
  getDashboardStats: async () => {
    return await api.get('/stats/dashboard');
  },
  getLeaderboard: async () => {
    return await api.get('/leaderboard');
  },
};

export default api;
