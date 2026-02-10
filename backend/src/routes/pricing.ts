import { Router } from 'express';
import { authenticateToken } from '@/middleware/auth';
import prisma from '@/config/database';

const router = Router();

// Mock packages data - In production, this would come from database
const mockPackages = [
  {
    id: 'starter',
    name: 'Başlangıç',
    price: 49,
    period: 'monthly' as const,
    currency: 'TRY',
    features: ['10 QR Kodu', '1,000 Tarama/ay', 'Temel Analitik', 'Email Destek'],
    popular: false,
    activeUsers: 45,
    limits: {
      qrCodes: 10,
      scans: 1000,
      subUsers: 0,
      customDomains: false,
      analytics: false
    }
  },
  {
    id: 'professional',
    name: 'Profesyonel',
    price: 149,
    period: 'monthly' as const,
    currency: 'TRY',
    features: ['100 QR Kodu', '10,000 Tarama/ay', 'Gelişmiş Analitik', 'Öncelikli Destek', 'Özelleştirme'],
    popular: true,
    activeUsers: 128,
    limits: {
      qrCodes: 100,
      scans: 10000,
      subUsers: 5,
      customDomains: true,
      analytics: true
    }
  },
  {
    id: 'enterprise',
    name: 'Kurumsal',
    price: 499,
    period: 'monthly' as const,
    currency: 'TRY',
    features: ['Sınırsız QR Kodu', 'Sınırsız Tarama', 'Kurumsal Analitik', 'Hızmetli Destek', 'API Erişimi', 'Beyaz Etiket'],
    popular: false,
    activeUsers: 23,
    limits: {
      qrCodes: -1, // unlimited
      scans: -1, // unlimited
      subUsers: -1, // unlimited
      customDomains: true,
      analytics: true
    }
  }
];

/**
 * GET /api/pricing/stats
 * Get overall pricing statistics
 */
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    // Get user's QR count from database
    const userQRCount = await prisma.qrCode.count({
      where: { userId }
    });
    
    // Mock stats data - In production, this would query the database
    const mockStats = {
      totalRevenue: 0, // System-wide revenue, not user-specific
      activeUsers: 0,  // System-wide users, not user-specific  
      totalQRs: 8432,  // System-wide QRs
      userQRs: userQRCount, // Real user QR count
      monthlyGrowth: {
        revenue: 0,
        users: 0,
        qrs: 0
      }
    };

    res.json({
      success: true,
      stats: mockStats
    });
  } catch (error: any) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch stats'
    });
  }
});

/**
 * GET /api/pricing/packages
 * Get all available packages
 */
router.get('/packages', authenticateToken, async (req, res) => {
  try {
    res.json({
      success: true,
      packages: mockPackages
    });
  } catch (error: any) {
    console.error('Error fetching packages:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch packages'
    });
  }
});

/**
 * GET /api/pricing/purchases
 * Get user's purchase history
 */
router.get('/purchases', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    // Mock purchases data - In production, this would query the database
    const mockPurchases = [
      {
        id: 'purchase_1',
        userId: userId,
        packageId: 'professional',
        packageName: 'Profesyonel',
        amount: 149,
        currency: 'TRY',
        status: 'completed' as const,
        createdAt: new Date('2026-01-15').toISOString(),
        expiresAt: new Date('2026-02-15').toISOString()
      }
    ];

    res.json({
      success: true,
      purchases: mockPurchases
    });
  } catch (error: any) {
    console.error('Error fetching purchases:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch purchases'
    });
  }
});

/**
 * GET /api/pricing/invoices
 * Get user's invoices
 */
router.get('/invoices', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    // Mock invoices data - In production, this would query the database
    const mockInvoices = [
      {
        id: 'INV-2026-001',
        purchaseId: 'purchase_1',
        amount: 149,
        currency: 'TRY',
        status: 'paid' as const,
        dueDate: new Date('2026-01-15').toISOString(),
        createdAt: new Date('2026-01-15').toISOString(),
        pdfUrl: '/api/pricing/invoices/INV-2026-001/download'
      }
    ];

    res.json({
      success: true,
      invoices: mockInvoices
    });
  } catch (error: any) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch invoices'
    });
  }
});

/**
 * POST /api/pricing/purchase
 * Purchase a package
 */
router.post('/purchase', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { packageId, period } = req.body;

    if (!packageId || !period) {
      return res.status(400).json({
        success: false,
        error: 'Package ID and period are required'
      });
    }

    const selectedPackage = mockPackages.find(p => p.id === packageId);
    if (!selectedPackage) {
      return res.status(404).json({
        success: false,
        error: 'Package not found'
      });
    }

    // Mock purchase creation - In production, this would create a real purchase
    const mockPurchase = {
      id: `purchase_${Date.now()}`,
      userId: userId,
      packageId: packageId,
      packageName: selectedPackage.name,
      amount: selectedPackage.price,
      currency: selectedPackage.currency,
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
    };

    res.json({
      success: true,
      purchase: mockPurchase,
      paymentUrl: 'https://mock-payment-gateway.com/pay/' + mockPurchase.id
    });
  } catch (error: any) {
    console.error('Error creating purchase:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create purchase'
    });
  }
});

export default router;
