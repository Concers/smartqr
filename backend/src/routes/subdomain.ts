import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import SubdomainService from '../services/subdomainService';

const router = Router();
const subdomainService = new SubdomainService();

/**
 * GET /api/subdomain
 * Get current user's subdomain and history
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const [currentSubdomain, history] = await Promise.all([
      subdomainService.getUserSubdomain(userId),
      subdomainService.getSubdomainHistory(userId)
    ]);

    res.json({
      success: true,
      data: {
        subdomain: currentSubdomain,
        history,
        canChange: history.length < 5 // Limit subdomain changes
      }
    });
  } catch (error) {
    console.error('Error getting subdomain info:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get subdomain information'
    });
  }
});

/**
 * POST /api/subdomain/change
 * Change user's subdomain
 */
router.post('/change', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Check if user can change subdomain (limit changes)
    const history = await subdomainService.getSubdomainHistory(userId);
    if (history.length >= 5) {
      return res.status(400).json({
        success: false,
        message: 'Subdomain change limit reached (5 changes allowed)'
      });
    }

    const newSubdomain = await subdomainService.assignSubdomainToUser(userId);
    
    res.json({
      success: true,
      message: 'Subdomain changed successfully',
      data: {
        subdomain: newSubdomain,
        url: `https://${newSubdomain}.netqr.io`
      }
    });
  } catch (error) {
    console.error('Error changing subdomain:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to change subdomain'
    });
  }
});

/**
 * GET /api/subdomain/history
 * Get subdomain change history
 */
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const history = await subdomainService.getSubdomainHistory(userId);

    res.json({
      success: true,
      data: {
        history,
        totalChanges: history.length
      }
    });
  } catch (error) {
    console.error('Error getting subdomain history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get subdomain history'
    });
  }
});

/**
 * POST /api/subdomain/assign-existing
 * Admin endpoint: Assign subdomains to existing users
 */
router.post('/assign-existing', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin (for now, check by email or create admin role later)
    const adminEmails = ['admin@netqr.io', 'admin@admin.com']; // Temporary admin check
    if (!adminEmails.includes(req.user.email)) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    await subdomainService.assignSubdomainsToExistingUsers();
    
    res.json({
      success: true,
      message: 'Subdomain assignment process started for existing users'
    });
  } catch (error) {
    console.error('Error assigning subdomains to existing users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign subdomains to existing users'
    });
  }
});

/**
 * GET /api/subdomain/check/:subdomain
 * Check if subdomain is available
 */
router.get('/check/:subdomain', authenticateToken, async (req, res) => {
  try {
    const { subdomain } = req.params;
    
    // Validate format
    if (!subdomainService.isValidSubdomainFormat(subdomain)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid subdomain format'
      });
    }

    const isAvailable = await subdomainService.isSubdomainAvailable(subdomain);
    
    res.json({
      success: true,
      data: {
        subdomain,
        available: isAvailable
      }
    });
  } catch (error) {
    console.error('Error checking subdomain availability:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check subdomain availability'
    });
  }
});

export default router;
