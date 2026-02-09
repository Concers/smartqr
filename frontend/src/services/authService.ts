import { api } from './api';

export const authService = {
  register: async (email: string, password: string, name?: string) =>
    api.post('/auth/register', { email, password, name }),
  login: async (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  getOverallStats: async (qrId?: string) => {
    const q = qrId ? `?qrId=${qrId}` : '';
    const response = await api.get(`/analytics/overview${q}`);
    return response.data.data;
  },
  getDailyStats: async (qrId?: string) => {
    const q = qrId ? `?qrId=${qrId}` : '';
    const response = await api.get(`/analytics/daily${q}`);
    return response.data.data;
  },
  getGeoStats: async (qrId?: string) => {
    const q = qrId ? `?qrId=${qrId}` : '';
    const response = await api.get(`/analytics/geo${q}`);
    return response.data.data;
  },
  getDeviceStats: async (qrId?: string) => {
    const q = qrId ? `?qrId=${qrId}` : '';
    const response = await api.get(`/analytics/devices${q}`);
    return response.data.data;
  },
  getBrowserStats: async (qrId?: string) => {
    const q = qrId ? `?qrId=${qrId}` : '';
    const response = await api.get(`/analytics/browsers${q}`);
    return response.data.data;
  },
  getHourlyStats: async (qrId?: string) => {
    const q = qrId ? `?qrId=${qrId}` : '';
    const response = await api.get(`/analytics/hourly${q}`);
    return response.data.data;
  },
  getRecentClicks: async (qrId?: string) => {
    const q = qrId ? `?qrId=${qrId}` : '';
    const response = await api.get(`/analytics/clicks${q}`);
    return response.data.data;
  },
};
