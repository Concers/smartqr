import { api } from './api';

export type CustomDomainStatus = 'pending' | 'approved' | 'rejected';

export type CustomDomainItem = {
  id: string;
  domain: string;
  status: CustomDomainStatus;
  dnsVerified: boolean;
  sslConfigured: boolean;
  adminNotes?: string | null;
  verificationToken?: string;
  requestedAt: string;
  approvedAt?: string | null;
  rejectedAt?: string | null;
};

export type VerificationInstructions = {
  type: 'TXT';
  name: string;
  value: string;
  ttl: number;
};

export const customDomainService = {
  request: async (domain: string) => api.post('/custom-domain/request', { domain }),

  myDomains: async () => api.get('/custom-domain/my-domains'),

  verifyDns: async (domain: string) => api.get(`/custom-domain/verify-dns/${encodeURIComponent(domain)}`),
};
