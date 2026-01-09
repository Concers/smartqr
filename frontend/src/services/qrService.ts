import { api } from './api';

export const qrService = {
  generate: async (destinationUrl: string, customCode?: string, expiresAt?: string) =>
    api.post('/qr/generate', { destinationUrl, customCode, expiresAt }),
  list: async (page = 1, limit = 10) => api.get('/qr/list', { params: { page, limit } }),
  updateDestination: async (id: string, destinationUrl: string, activeFrom?: string, isActive?: boolean, expiresAt?: string) =>
    api.put(`/qr/${id}/destination`, { destinationUrl, activeFrom, isActive, expiresAt }),
  toggleActive: async (id: string, active: boolean) =>
    api.put(`/qr/${id}/toggle`, { isActive: active }),
  delete: async (id: string) => api.delete(`/qr/${id}`),
};
