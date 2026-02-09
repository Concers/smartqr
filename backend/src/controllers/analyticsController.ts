import { Request, Response } from 'express';
import prisma from '@/config/database';
import { AnalyticsService } from '@/services/analyticsService';

export class AnalyticsController {
  static async getOverallStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const qrId = req.query.qrId as string | undefined;
      const stats = await AnalyticsService.getOverallStats(userId, qrId);
      res.json({ success: true, data: stats });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Failed to get overall stats' });
    }
  }

  static async getDailyStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const qrId = req.query.qrId as string | undefined;
      const stats = await AnalyticsService.getDailyStats(userId, qrId);
      res.json({ success: true, data: stats });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Failed to get daily stats' });
    }
  }

  static async getGeoStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const qrId = req.query.qrId as string | undefined;
      const stats = await AnalyticsService.getGeoStats(userId, qrId);
      res.json({ success: true, data: stats });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Failed to get geo stats' });
    }
  }

  static async getDeviceStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const qrId = req.query.qrId as string | undefined;
      const stats = await AnalyticsService.getDeviceStats(userId, qrId);
      res.json({ success: true, data: stats });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Failed to get device stats' });
    }
  }

  static async getBrowserStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const qrId = req.query.qrId as string | undefined;
      const stats = await AnalyticsService.getBrowserStats(userId, qrId);
      res.json({ success: true, data: stats });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Failed to get browser stats' });
    }
  }

  static async getHourlyStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const qrId = req.query.qrId as string | undefined;
      const stats = await AnalyticsService.getHourlyStats(userId, qrId);
      res.json({ success: true, data: stats });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Failed to get hourly stats' });
    }
  }

  static async getRecentClicks(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const qrId = req.query.qrId as string | undefined;
      const limit = parseInt(req.query.limit as string) || 20;
      const clicks = await AnalyticsService.getRecentClicks(userId, qrId, limit);
      res.json({ success: true, data: clicks });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Failed to get recent clicks' });
    }
  }

  static async getQRCodeAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;
      const query = (req as any).validated || req.query;

      const owned = await prisma.qrCode.findFirst({ where: { id, userId } });
      if (!owned) {
        res.status(404).json({ success: false, error: 'QR code not found' });
        return;
      }

      const analytics = await AnalyticsService.getAnalytics(id, query as any);
      res.json({ success: true, data: analytics });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Failed to get analytics' });
    }
  }
}
