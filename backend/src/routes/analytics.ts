import { Router } from 'express';
import { AnalyticsService } from '@/services/analyticsService';
import { authenticateToken } from '@/middleware/auth';
import { validateUUID, validateAnalyticsQuery } from '@/middleware/validation';
import { analyticsRateLimiter } from '@/middleware/rateLimit';
 import prisma from '@/config/database';

const router = Router();

// Get analytics for specific QR code
router.get('/:id',
  authenticateToken,
  analyticsRateLimiter,
  validateUUID,
  validateAnalyticsQuery,
  async (req: any, res: any) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const query = req.validated || req.query;

      // Verify QR code ownership
      const qrCode = await prisma.qrCode.findFirst({
        where: { id, userId },
      });

      if (!qrCode) {
        return res.status(404).json({
          success: false,
          error: 'QR code not found',
        });
      }

      const analytics = await AnalyticsService.getAnalytics(id, query);

      res.json({
        success: true,
        data: analytics,
      });
    } catch (error: any) {
      console.error('Get analytics error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get analytics',
      });
    }
  }
);

// Get overall stats for user
router.get('/',
  authenticateToken,
  analyticsRateLimiter,
  async (req: any, res: any) => {
    try {
      const userId = req.user?.id;
      const stats = await AnalyticsService.getOverallStats(userId);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      console.error('Get overall stats error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get overall stats',
      });
    }
  }
);

// Get recent activity
router.get('/activity/recent',
  authenticateToken,
  analyticsRateLimiter,
  async (req: any, res: any) => {
    try {
      const userId = req.user?.id;
      const limit = parseInt(req.query.limit as string) || 10;
      const activity = await AnalyticsService.getRecentActivity(userId, limit);

      res.json({
        success: true,
        data: activity,
      });
    } catch (error: any) {
      console.error('Get recent activity error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get recent activity',
      });
    }
  }
);

// Export analytics
router.get('/:id/export',
  authenticateToken,
  analyticsRateLimiter,
  validateUUID,
  async (req: any, res: any) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const format = (req.query.format as string) || 'csv';

      // Verify QR code ownership
      const qrCode = await prisma.qrCode.findFirst({
        where: { id, userId },
      });

      if (!qrCode) {
        return res.status(404).json({
          success: false,
          error: 'QR code not found',
        });
      }

      const exportData = await AnalyticsService.exportAnalytics(id, format as 'csv' | 'json');

      if (format === 'json') {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="analytics-${id}.json"`);
      } else {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="analytics-${id}.csv"`);
      }

      res.send(exportData);
    } catch (error: any) {
      console.error('Export analytics error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to export analytics',
      });
    }
  }
);

export default router;
