import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import CustomDomainService from '../services/customDomainService';

const router = Router();
const customDomainService = new CustomDomainService();

/**
 * POST /api/custom-domain/request
 * Request a custom domain
 */
router.post('/request', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { domain } = req.body;

    if (!domain) {
      return res.status(400).json({
        success: false,
        message: 'Domain is required'
      });
    }

    const result = await customDomainService.requestCustomDomain(userId, domain);
    
    res.status(201).json({
      success: true,
      message: 'Custom domain request submitted successfully',
      data: result
    });
  } catch (error) {
    console.error('Error requesting custom domain:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to request custom domain'
    });
  }
});

/**
 * GET /api/custom-domain/verify-dns/:domain
 * Verify DNS ownership for a domain
 */
router.get('/verify-dns/:domain', authenticateToken, async (req, res) => {
  try {
    const { domain } = req.params;
    
    const verified = await customDomainService.verifyDNSOwnership(domain);
    
    res.json({
      success: true,
      data: {
        domain,
        verified,
        message: verified ? 'DNS verification successful' : 'DNS verification failed'
      }
    });
  } catch (error) {
    console.error('Error verifying DNS:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify DNS ownership'
    });
  }
});

/**
 * GET /api/custom-domain/my-domains
 * Get current user's custom domain requests
 */
router.get('/my-domains', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const domains = await customDomainService.getUserCustomDomains(userId);

    res.json({
      success: true,
      data: {
        domains,
        total: domains.length
      }
    });
  } catch (error) {
    console.error('Error getting user custom domains:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get custom domains'
    });
  }
});

/**
 * GET /api/custom-domain/check/:domain
 * Check if domain is available
 */
router.get('/check/:domain', authenticateToken, async (req, res) => {
  try {
    const { domain } = req.params;
    
    const available = await customDomainService.isDomainAvailable(domain);
    
    res.json({
      success: true,
      data: {
        domain,
        available
      }
    });
  } catch (error) {
    console.error('Error checking domain availability:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check domain availability'
    });
  }
});

export default router;
