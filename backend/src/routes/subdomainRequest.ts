import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import prisma from '@/config/database';

const router = Router();

const normalizeRequestedSubdomain = (input: string): string => {
  return (input || '').trim().toLowerCase();
};

const isValidRequestedSubdomain = (sub: string): boolean => {
  // Allow: a-z 0-9 and hyphen, must start/end with alnum, length 3-30
  if (!sub) return false;
  if (sub.length < 3 || sub.length > 30) return false;
  if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(sub)) return false;
  if (sub.includes('--')) return false;
  return true;
};

/**
 * POST /api/subdomain-request
 * User requests a custom subdomain under netqr.io
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const requestedSubdomain = normalizeRequestedSubdomain(req.body?.requestedSubdomain);

    if (!isValidRequestedSubdomain(requestedSubdomain)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid subdomain format',
      });
    }

    // Block reserved subdomains
    const reserved = new Set(['www', 'netqr', 'admin', 'api']);
    if (reserved.has(requestedSubdomain)) {
      return res.status(400).json({
        success: false,
        message: 'Subdomain is reserved',
      });
    }

    // Must not already be used by another user
    const existingUser = await prisma.user.findFirst({
      where: { subdomain: requestedSubdomain },
      select: { id: true },
    });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Subdomain is already in use',
      });
    }

    // Must not already have an open request
    const existingRequest = await prisma.subdomainRequest.findFirst({
      where: {
        requestedSubdomain,
        status: { in: ['pending', 'approved'] },
      },
      select: { id: true },
    });
    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'Subdomain already requested',
      });
    }

    const created = await prisma.subdomainRequest.create({
      data: {
        userId,
        requestedSubdomain,
        status: 'pending',
      },
    });

    res.status(201).json({
      success: true,
      data: created,
      message: 'Subdomain request submitted',
    });
  } catch (error: any) {
    console.error('Subdomain request error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to submit subdomain request',
    });
  }
});

/**
 * GET /api/subdomain-request/my
 * List current user's requests
 */
router.get('/my', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const requests = await prisma.subdomainRequest.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: { requests },
    });
  } catch (error: any) {
    console.error('Get my subdomain requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get subdomain requests',
    });
  }
});

export default router;
