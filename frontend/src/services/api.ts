import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
});

// Request interceptor: add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 429 rate limit
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 429) {
      const retryAfter = error.response.data?.retryAfter || 900;
      window.location.href = `/rate-limit?retryAfter=${retryAfter}`;
    }
    return Promise.reject(error);
  }
);
