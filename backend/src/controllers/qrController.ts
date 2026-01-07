import { Request, Response } from 'express';
import { QRService } from '@/services/qrService';
import { AnalyticsService } from '@/services/analyticsService';
import prisma from '@/config/database';
import { CacheService } from '@/services/cacheService';

export class QRController {
  static async createQRCode(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const qrCode = await QRService.createQRCode(req.body, userId);

      res.status(201).json({
        success: true,
        data: qrCode,
        message: 'QR code created successfully',
      });
    } catch (error: any) {
      console.error('Create QR code error:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to create QR code',
      });
    }
  }

  static async getQRCodes(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;

      const result = await QRService.getQRCodesByUser(userId!, page, limit, search);

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error('Get QR codes error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get QR codes',
      });
    }
  }

  static async getQRCodeById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const qrCode = await QRService.getQRCodeById(id, userId);

      if (!qrCode) {
        res.status(404).json({
          success: false,
          error: 'QR code not found',
        });
        return;
      }

      res.json({
        success: true,
        data: qrCode,
      });
    } catch (error: any) {
      console.error('Get QR code error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get QR code',
      });
    }
  }

  static async updateDestination(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      await QRService.updateDestination(id, req.body, userId);

      res.json({
        success: true,
        message: 'Destination updated successfully',
      });
    } catch (error: any) {
      console.error('Update destination error:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to update destination',
      });
    }
  }

  static async deleteQRCode(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      await QRService.deleteQRCode(id, userId);

      res.json({
        success: true,
        message: 'QR code deleted successfully',
      });
    } catch (error: any) {
      console.error('Delete QR code error:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to delete QR code',
      });
    }
  }

  static async toggleQRCodeStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const isActive = await QRService.toggleQRCodeStatus(id, userId);

      res.json({
        success: true,
        data: { isActive },
        message: `QR code ${isActive ? 'activated' : 'deactivated'} successfully`,
      });
    } catch (error: any) {
      console.error('Toggle QR code status error:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to toggle QR code status',
      });
    }
  }

  static async redirectQRCode(req: Request, res: Response): Promise<void> {
    try {
      const { shortCode } = req.params;

      // 1) Cache check
      let destinationUrl = await CacheService.getCachedDestination(shortCode);

      // 2) DB fallback
      if (!destinationUrl) {
        destinationUrl = await QRService.getDestinationByShortCode(shortCode);
        if (destinationUrl) {
          await CacheService.cacheDestination(shortCode, destinationUrl);
        }
      }

      if (!destinationUrl) {
        res.status(404).json({
          success: false,
          error: 'QR code not found or inactive',
        });
        return;
      }

      // Track analytics
      const qrCode = await prisma.qrCode.findUnique({
        where: { shortCode },
        select: { id: true },
      });

      if (qrCode) {
        await AnalyticsService.trackClick(qrCode.id, req);
      }

      // Redirect
      res.redirect(302, destinationUrl);
    } catch (error: any) {
      console.error('Redirect QR code error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to redirect',
      });
    }
  }

  static async getQRCodeAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const query = req.query as any;

      // Verify QR code ownership
      const qrCode = await QRService.getQRCodeById(id, userId);
      if (!qrCode) {
        res.status(404).json({
          success: false,
          error: 'QR code not found',
        });
        return;
      }

      const analytics = await AnalyticsService.getAnalytics(id, query);

      res.json({
        success: true,
        data: analytics,
      });
    } catch (error: any) {
      console.error('Get QR code analytics error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get analytics',
      });
    }
  }
}
