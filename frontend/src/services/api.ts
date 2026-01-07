import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api',
});

// Request interceptor: add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('🔵 API Request:', config.method?.toUpperCase(), config.url, config.headers.Authorization);
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 429 rate limit
api.interceptors.response.use(
  (response) => {
    console.log('🟢 API Response:', response.config.method?.toUpperCase(), response.config.url, response.status);
    return response;
  },
  (error) => {
    console.log('🔴 API Error:', error.config?.method?.toUpperCase(), error.config?.url, error.response?.status, error.response?.data);
    if (error.response?.status === 429) {
      const retryAfter = error.response.data?.retryAfter || 900;
      window.location.href = `/rate-limit?retryAfter=${retryAfter}`;
    }
    return Promise.reject(error);
  }
);
