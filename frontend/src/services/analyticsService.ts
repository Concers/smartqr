import { api } from './api';

export const analyticsService = {
  // Get overall stats for dashboard
  getOverview: async () => api.get('/analytics/overview'),
  
  // Get daily stats (last 7 days)
  getDaily: async () => api.get('/analytics/daily'),
  
  // Get geographic stats
  getGeo: async () => api.get('/analytics/geo'),
  
  // Get device stats
  getDevices: async () => api.get('/analytics/devices'),
  
  // Get browser stats
  getBrowsers: async () => api.get('/analytics/browsers'),
  
  // Get hourly distribution
  getHourly: async () => api.get('/analytics/hourly'),
  
  // Get recent clicks
  getClicks: async (limit = 20) => api.get('/analytics/clicks', { params: { limit } }),
  
  // Get analytics for specific QR code
  getQRAnalytics: async (qrId: string, params?: any) => 
    api.get(`/analytics/${qrId}`, { params }),
  
  // Get recent activity
  getRecentActivity: async (limit = 10) => 
    api.get('/analytics/activity/recent', { params: { limit } }),
  
  // Export analytics
  exportAnalytics: async (qrId: string, format = 'csv') => 
    api.get(`/analytics/${qrId}/export`, { 
      params: { format },
      responseType: 'blob'
    }),
};
