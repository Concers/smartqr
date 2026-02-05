import { api } from './api';

export type SubdomainRequestStatus = 'pending' | 'approved' | 'rejected';

export type SubdomainRequestItem = {
  id: string;
  userId: string;
  requestedSubdomain: string;
  status: SubdomainRequestStatus;
  adminNotes?: string | null;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string | null;
  rejectedAt?: string | null;
  user?: {
    email: string;
    subdomain?: string | null;
    createdAt?: string;
  };
};

export const subdomainRequestService = {
  // User
  create: async (requestedSubdomain: string) => api.post('/subdomain-request', { requestedSubdomain }),
  myRequests: async () => api.get('/subdomain-request/my'),

  // Admin
  adminList: async (status?: SubdomainRequestStatus, page = 1, limit = 20) =>
    api.get('/admin/subdomain-requests', { params: { status, page, limit } }),
  adminApprove: async (id: string) => api.post(`/admin/subdomain-request/${id}/approve`, {}),
  adminReject: async (id: string, reason: string) => api.post(`/admin/subdomain-request/${id}/reject`, { reason }),
  adminUpdate: async (id: string, requestedSubdomain: string) => api.patch(`/admin/subdomain-request/${id}`, { requestedSubdomain }),
};
