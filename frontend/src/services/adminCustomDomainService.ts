import { api } from './api';

export type CustomDomainStatus = 'pending' | 'approved' | 'rejected';

export type AdminCustomDomainUser = {
  email: string;
  subdomain?: string | null;
  createdAt?: string;
};

export type AdminCustomDomainItem = {
  id: string;
  domain: string;
  status: CustomDomainStatus;
  dnsVerified: boolean;
  sslConfigured: boolean;
  verificationToken?: string;
  adminNotes?: string | null;
  requestedAt: string;
  approvedAt?: string | null;
  rejectedAt?: string | null;
  user?: AdminCustomDomainUser;
};

export const adminCustomDomainService = {
  list: async (status?: CustomDomainStatus, page = 1, limit = 20) =>
    api.get('/admin/custom-domains', { params: { status, page, limit } }),

  approve: async (id: string) => api.post(`/admin/custom-domain/${id}/approve`, {}),

  reject: async (id: string, reason: string) => api.post(`/admin/custom-domain/${id}/reject`, { reason }),

  bulkApprove: async (domainIds: string[]) => api.post('/admin/custom-domains/bulk-approve', { domainIds }),

  bulkReject: async (domainIds: string[], reason: string) =>
    api.post('/admin/custom-domains/bulk-reject', { domainIds, reason }),
};
