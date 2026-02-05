import { api } from './api';

export const authService = {
  register: async (email: string, password: string, name?: string) =>
    api.post('/auth/register', { email, password, name }),
  login: async (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  getOverallStats: async () => {
    const response = await api.get('/analytics/overview');
    return response.data.data;
  },
  getDailyStats: async () => {
    const response = await api.get('/analytics/daily');
    return response.data.data;
  },
  getGeoStats: async () => {
    const response = await api.get('/analytics/geo');
    return response.data.data;
  },
  getDeviceStats: async () => {
    const response = await api.get('/analytics/devices');
    return response.data.data;
  },
  getBrowserStats: async () => {
    const response = await api.get('/analytics/browsers');
    return response.data.data;
  },
};
