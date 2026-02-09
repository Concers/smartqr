import { api } from './api';
import subUserService from './subUserService';

export const authService = {
  register: async (email: string, password: string, name?: string) =>
    api.post('/auth/register', { email, password, name }),
  login: async (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  // Try normal login first, then sub-user login
  loginAny: async (email: string, password: string) => {
    console.log('authService.loginAny called with:', { email, password: '***' });
    try {
      // Try normal user login first
      console.log('Trying normal user login...');
      const response = await api.post('/auth/login', { email, password });
      console.log('Normal user login response:', response.data);
      return { ...response.data, userType: 'user' };
    } catch (error: any) {
      console.log('Normal user login failed:', error.response?.status, error.response?.data);
      // If normal login fails, try sub-user login
      if (error.response?.status === 401) {
        console.log('Trying sub-user login...');
        try {
          const subUserResponse = await subUserService.loginSubUser(email, password);
          console.log('Sub-user login response:', subUserResponse);
          return { user: subUserResponse, userType: 'subuser' };
        } catch (subError) {
          console.log('Sub-user login also failed:', subError);
          throw error; // Throw original error
        }
      }
      console.log('Login failed with non-401 error:', error);
      throw error;
    }
  },
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
