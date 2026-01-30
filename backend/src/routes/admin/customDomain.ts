import { Router } from 'express';
import { authenticateToken } from '../../middleware/auth';
import CustomDomainService from '../../services/customDomainService';

const router = Router();
const customDomainService = new CustomDomainService();

/**
 * Middleware to check admin access
 */
const requireAdmin = (req: any, res: any, next: any) => {
  const adminEmails = ['admin@netqr.io', 'admin@admin.com']; // Temporary admin check
  if (!adminEmails.includes(req.user.email)) {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  next();
};

/**
 * GET /api/admin/custom-domains
 * Get all custom domain requests (Admin)
 */
router.get('/custom-domains', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    const result = await customDomainService.getAllCustomDomains(
      status as string,
      Number(page),
      Number(limit)
    );
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error getting custom domains:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get custom domains'
    });
  }
});

/**
 * POST /api/admin/custom-domain/:id/approve
 * Approve a custom domain (Admin)
 */
router.post('/custom-domain/:id/approve', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;
    
    await customDomainService.approveDomain(id, adminId);
    
    res.json({
      success: true,
      message: 'Custom domain approved successfully'
    });
  } catch (error) {
    console.error('Error approving custom domain:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to approve custom domain'
    });
  }
});

/**
 * POST /api/admin/custom-domain/:id/reject
 * Reject a custom domain (Admin)
 */
router.post('/custom-domain/:id/reject', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }
    
    await customDomainService.rejectDomain(id, reason);
    
    res.json({
      success: true,
      message: 'Custom domain rejected successfully'
    });
  } catch (error) {
    console.error('Error rejecting custom domain:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to reject custom domain'
    });
  }
});

/**
 * POST /api/admin/custom-domains/bulk-approve
 * Bulk approve multiple custom domains (Admin)
 */
router.post('/custom-domains/bulk-approve', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { domainIds } = req.body;
    const adminId = req.user.id;
    
    if (!domainIds || !Array.isArray(domainIds)) {
      return res.status(400).json({
        success: false,
        message: 'Domain IDs array is required'
      });
    }
    
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    
    for (const domainId of domainIds) {
      try {
        await customDomainService.approveDomain(domainId, adminId);
        successCount++;
      } catch (error) {
        errorCount++;
        errors.push({
          domainId,
          error: error.message
        });
      }
    }
    
    res.json({
      success: true,
      message: `Bulk approval completed. Success: ${successCount}, Errors: ${errorCount}`,
      data: {
        successCount,
        errorCount,
        errors
      }
    });
  } catch (error) {
    console.error('Error in bulk approve:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to bulk approve custom domains'
    });
  }
});

/**
 * POST /api/admin/custom-domains/bulk-reject
 * Bulk reject multiple custom domains (Admin)
 */
router.post('/custom-domains/bulk-reject', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { domainIds, reason } = req.body;
    
    if (!domainIds || !Array.isArray(domainIds)) {
      return res.status(400).json({
        success: false,
        message: 'Domain IDs array is required'
      });
    }
    
    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }
    
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    
    for (const domainId of domainIds) {
      try {
        await customDomainService.rejectDomain(domainId, reason);
        successCount++;
      } catch (error) {
        errorCount++;
        errors.push({
          domainId,
          error: error.message
        });
      }
    }
    
    res.json({
      success: true,
      message: `Bulk rejection completed. Success: ${successCount}, Errors: ${errorCount}`,
      data: {
        successCount,
        errorCount,
        errors
      }
    });
  } catch (error) {
    console.error('Error in bulk reject:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to bulk reject custom domains'
    });
  }
});

/**
 * GET /api/admin/custom-domains/stats
 * Get custom domain statistics (Admin)
 */
router.get('/custom-domains/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // This would require additional Prisma queries for statistics
    // For now, return basic stats
    const stats = {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      dnsVerified: 0,
      sslConfigured: 0
    };
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error getting custom domain stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get custom domain statistics'
    });
  }
});

export default router;
