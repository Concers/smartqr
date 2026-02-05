import { Router } from 'express';
import { authenticateToken } from '../../middleware/auth';
import prisma from '@/config/database';
import SubdomainService from '@/services/subdomainService';

const router = Router();
const subdomainService = new SubdomainService();

const requireAdmin = (req: any, res: any, next: any) => {
  const adminEmails = ['admin@netqr.io', 'admin@admin.com'];
  if (!adminEmails.includes(req.user.email)) {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
};

// GET /api/admin/subdomain-requests?status=pending&page=1&limit=20
router.get('/subdomain-requests', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query as any;
    const where: any = status ? { status } : {};

    const [requests, total] = await Promise.all([
      prisma.subdomainRequest.findMany({
        where,
        include: {
          user: {
            select: { email: true, subdomain: true, createdAt: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
      }),
      prisma.subdomainRequest.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        requests,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error: any) {
    console.error('Error getting subdomain requests:', error);
    res.status(500).json({ success: false, message: 'Failed to get subdomain requests' });
  }
});

// POST /api/admin/subdomain-request/:id/approve
router.post('/subdomain-request/:id/approve', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const request = await prisma.subdomainRequest.findUnique({ where: { id } });
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Request is not pending' });
    }

    await subdomainService.assignRequestedSubdomainToUser(request.userId, request.requestedSubdomain);

    await prisma.subdomainRequest.update({
      where: { id },
      data: { status: 'approved', approvedAt: new Date() },
    });

    res.json({ success: true, message: 'Subdomain request approved' });
  } catch (error: any) {
    console.error('Error approving subdomain request:', error);
    const msg = error.message || 'Failed to approve subdomain request';
    res.status(400).json({ success: false, message: msg });
  }
});

// POST /api/admin/subdomain-request/:id/reject
router.post('/subdomain-request/:id/reject', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const request = await prisma.subdomainRequest.findUnique({ where: { id } });
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Request is not pending' });
    }

    await prisma.subdomainRequest.update({
      where: { id },
      data: {
        status: 'rejected',
        rejectedAt: new Date(),
        adminNotes: reason || 'Rejected',
      },
    });

    res.json({ success: true, message: 'Subdomain request rejected' });
  } catch (error: any) {
    console.error('Error rejecting subdomain request:', error);
    res.status(500).json({ success: false, message: 'Failed to reject subdomain request' });
  }
});

// PATCH /api/admin/subdomain-request/:id (edit requestedSubdomain before approval)
router.patch('/subdomain-request/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { requestedSubdomain } = req.body;

    const request = await prisma.subdomainRequest.findUnique({ where: { id } });
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Only pending requests can be edited' });
    }

    const normalized = String(requestedSubdomain || '').trim().toLowerCase();
    if (!normalized) {
      return res.status(400).json({ success: false, message: 'requestedSubdomain is required' });
    }

    // Ensure not used by a user
    const existingUser = await prisma.user.findFirst({ where: { subdomain: normalized }, select: { id: true } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Subdomain is already in use' });
    }

    const updated = await prisma.subdomainRequest.update({
      where: { id },
      data: { requestedSubdomain: normalized, updatedAt: new Date() },
    });

    res.json({ success: true, data: updated, message: 'Request updated' });
  } catch (error: any) {
    console.error('Error updating subdomain request:', error);
    res.status(500).json({ success: false, message: 'Failed to update subdomain request' });
  }
});

export default router;
