import { api } from './api';

export interface Package {
  id: string;
  name: string;
  price: number;
  period: 'monthly' | 'yearly';
  currency: string;
  features: string[];
  popular: boolean;
  activeUsers: number;
  limits: {
    qrCodes: number;
    scans: number;
    subUsers: number;
    customDomains: boolean;
    analytics: boolean;
  };
}

export interface Purchase {
  id: string;
  userId: string;
  packageId: string;
  packageName: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  createdAt: string;
  expiresAt?: string;
}

export interface Invoice {
  id: string;
  purchaseId: string;
  amount: number;
  currency: string;
  status: 'paid' | 'unpaid' | 'overdue';
  dueDate: string;
  createdAt: string;
  pdfUrl?: string;
}

export const pricingService = {
  // Get overall stats
  getStats: async () => {
    const response = await api.get('/pricing/stats');
    return response.data.stats;
  },

  // Get all available packages
  getPackages: async (): Promise<Package[]> => {
    const response = await api.get('/pricing/packages');
    return response.data.packages;
  },

  // Get user's purchase history
  getPurchases: async (): Promise<Purchase[]> => {
    const response = await api.get('/pricing/purchases');
    return response.data.purchases;
  },

  // Get user's invoices
  getInvoices: async (): Promise<Invoice[]> => {
    const response = await api.get('/pricing/invoices');
    return response.data.invoices;
  },

  // Purchase a package
  purchasePackage: async (packageId: string, period: 'monthly' | 'yearly'): Promise<{ purchase: Purchase; paymentUrl?: string }> => {
    const response = await api.post('/pricing/purchase', { packageId, period });
    return response.data;
  },

  // Cancel subscription
  cancelSubscription: async (purchaseId: string): Promise<void> => {
    await api.post(`/pricing/cancel/${purchaseId}`);
  },

  // Download invoice PDF
  downloadInvoice: async (invoiceId: string): Promise<Blob> => {
    const response = await api.get(`/pricing/invoices/${invoiceId}/download`, {
      responseType: 'blob'
    });
    return response.data;
  },
};
