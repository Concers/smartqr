import { api } from './api';

export const qrService = {
  generate: async (destinationUrl: string, customCode?: string, expiresAt?: string) =>
    api.post('/qr/generate', { destinationUrl, customCode, expiresAt }),
  uploadPdf: async (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post('/uploads/pdf', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadImage: async (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post('/uploads/image', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  list: async (page = 1, limit = 10, search?: string) => api.get('/qr/list', { params: { page, limit, search } }),
  updateDestination: async (id: string, destinationUrl: string, activeFrom?: string, isActive?: boolean, expiresAt?: string) =>
    api.put(`/qr/${id}/destination`, { destinationUrl, activeFrom, isActive, expiresAt }),
  toggleActive: async (id: string, active: boolean) =>
    api.put(`/qr/${id}/toggle`, { isActive: active }),
  delete: async (id: string) => api.delete(`/qr/${id}`),
};
