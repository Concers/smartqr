import { Request, Response } from 'express';
import prisma from '@/config/database';
import { AnalyticsService } from '@/services/analyticsService';

export class AnalyticsController {
  static async getOverallStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const stats = await AnalyticsService.getOverallStats(userId);
      res.json({ success: true, data: stats });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Failed to get overall stats' });
    }
  }

  static async getDailyStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const stats = await AnalyticsService.getDailyStats(userId);
      res.json({ success: true, data: stats });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Failed to get daily stats' });
    }
  }

  static async getGeoStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const stats = await AnalyticsService.getGeoStats(userId);
      res.json({ success: true, data: stats });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Failed to get geo stats' });
    }
  }

  static async getDeviceStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const stats = await AnalyticsService.getDeviceStats(userId);
      res.json({ success: true, data: stats });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Failed to get device stats' });
    }
  }

  static async getBrowserStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const stats = await AnalyticsService.getBrowserStats(userId);
      res.json({ success: true, data: stats });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Failed to get browser stats' });
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
