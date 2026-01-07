import prisma from '@/config/database';
import { CacheService } from './cacheService';
import { AnalyticsQuery, AnalyticsData } from '@/types';

export class AnalyticsService {
  static async trackClick(qrCodeId: string, req: any): Promise<void> {
    try {
      const userAgent = req.headers['user-agent'] || '';
      const ipAddress = req.ip || req.connection.remoteAddress || '';
      
      // Extract device and browser info
      const deviceType = this.extractDeviceType(userAgent);
      const browser = this.extractBrowser(userAgent);
      
      // Store analytics data
      await prisma.qrAnalytics.create({
        data: {
          qrCodeId,
          ipAddress,
          userAgent,
          deviceType,
          browser,
          accessedAt: new Date(),
        },
      });

      // Increment cache counter
      await CacheService.incrementClickCount(qrCodeId);
      
      // Invalidate cached analytics for this QR code
      await CacheService.invalidateAnalytics(qrCodeId);
      
    } catch (error) {
      console.error('Error tracking click:', error);
    }
  }

  static async getAnalytics(qrCodeId: string, query: AnalyticsQuery): Promise<AnalyticsData> {
    try {
      // Check cache first
      const cacheKey = `${JSON.stringify(query)}`;
      const cached = await CacheService.getCachedAnalytics(`${qrCodeId}:${cacheKey}`);
      
      if (cached) {
        return cached;
      }

      const where: any = {
        qrCodeId,
        ...(query.from && { accessedAt: { gte: new Date(query.from) } }),
        ...(query.to && { accessedAt: { lte: new Date(query.to) } }),
      };

      const [
        totalClicks,
        uniqueVisitors,
        topCountries,
        devices,
        dailyStats,
      ] = await Promise.all([
        this.getTotalClicks(where),
        this.getUniqueVisitors(where),
        this.getTopCountries(where),
        this.getDeviceBreakdown(where),
        this.getDailyStats(where, query),
      ]);

      const analytics: AnalyticsData = {
        totalClicks,
        uniqueVisitors,
        topCountries,
        devices,
        dailyStats,
      };

      // Cache the results
      await CacheService.cacheAnalytics(`${qrCodeId}:${cacheKey}`, analytics, 300); // 5 minutes

      return analytics;
    } catch (error) {
      console.error('Error getting analytics:', error);
      throw new Error('Failed to get analytics');
    }
  }

  private static async getTotalClicks(where: any): Promise<number> {
    return await prisma.qrAnalytics.count({ where });
  }

  private static async getUniqueVisitors(where: any): Promise<number> {
    const uniqueIPs = await prisma.qrAnalytics.findMany({
      where,
      select: { ipAddress: true },
      distinct: ['ipAddress'],
    });
    return uniqueIPs.length;
  }

  private static async getTopCountries(where: any, limit: number = 10): Promise<Array<{ country: string; count: number }>> {
    // This would require geolocation service integration
    // For now, return empty array
    return [];
  }

  private static async getDeviceBreakdown(where: any): Promise<Array<{ type: string; count: number }>> {
    const devices = await prisma.qrAnalytics.groupBy({
      by: ['deviceType'],
      where,
      _count: {
        deviceType: true,
      },
    });

    return devices.map(device => ({
      type: device.deviceType || 'unknown',
      count: device._count.deviceType,
    }));
  }

  private static async getDailyStats(where: any, query: AnalyticsQuery): Promise<Array<{ date: string; clicks: number }>> {
    const from = query.from ? new Date(query.from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const to = query.to ? new Date(query.to) : new Date();

    const dailyStats = await prisma.$queryRaw`
      SELECT 
        DATE(accessed_at) as date,
        COUNT(*) as clicks
      FROM qr_analytics
      WHERE 
        qr_code_id = ${where.qrCodeId}
        AND accessed_at >= ${from}
        AND accessed_at <= ${to}
      GROUP BY DATE(accessed_at)
      ORDER BY date DESC
    ` as Array<{ date: Date; clicks: bigint }>;

    return dailyStats.map(stat => ({
      date: stat.date.toISOString().split('T')[0],
      clicks: Number(stat.clicks),
    }));
  }

  private static extractDeviceType(userAgent: string): string {
    const ua = userAgent.toLowerCase();
    
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return 'mobile';
    } else if (ua.includes('tablet') || ua.includes('ipad')) {
      return 'tablet';
    } else {
      return 'desktop';
    }
  }

  private static extractBrowser(userAgent: string): string {
    const ua = userAgent.toLowerCase();
    
    if (ua.includes('chrome')) return 'chrome';
    if (ua.includes('firefox')) return 'firefox';
    if (ua.includes('safari')) return 'safari';
    if (ua.includes('edge')) return 'edge';
    if (ua.includes('opera')) return 'opera';
    
    return 'unknown';
  }

  static async getOverallStats(userId?: string): Promise<any> {
    try {
      const analyticsWhere = userId ? { qrCode: { userId } } : undefined;

      const [totalQRs, totalClicks, activeQRs] = await Promise.all([
        prisma.qrCode.count(userId ? { where: { userId } } : undefined),
        prisma.qrAnalytics.count({ where: analyticsWhere }),
        prisma.qrCode.count({
          where: {
            ...(userId ? { userId } : {}),
            isActive: true,
          },
        }),
      ]);

      return {
        totalQRs,
        totalClicks,
        activeQRs,
      };
    } catch (error) {
      console.error('Error getting overall stats:', error);
      throw new Error('Failed to get overall stats');
    }
  }

  static async getRecentActivity(userId?: string, limit: number = 10): Promise<any> {
    try {
      const where = userId ? { qrCode: { userId } } : {};

      const recentClicks = await prisma.qrAnalytics.findMany({
        where,
        include: {
          qrCode: {
            select: {
              shortCode: true,
            },
          },
        },
        orderBy: { accessedAt: 'desc' },
        take: limit,
      });

      return recentClicks.map(click => ({
        shortCode: click.qrCode.shortCode,
        accessedAt: click.accessedAt,
        ipAddress: click.ipAddress,
        deviceType: click.deviceType,
        browser: click.browser,
      }));
    } catch (error) {
      console.error('Error getting recent activity:', error);
      throw new Error('Failed to get recent activity');
    }
  }

  static async exportAnalytics(qrCodeId: string, format: 'csv' | 'json' = 'csv'): Promise<string> {
    try {
      const analytics = await prisma.qrAnalytics.findMany({
        where: { qrCodeId },
        orderBy: { accessedAt: 'desc' },
      });

      if (format === 'json') {
        return JSON.stringify(analytics, null, 2);
      } else {
        // CSV format
        const headers = ['Accessed At', 'IP Address', 'Device Type', 'Browser', 'User Agent'];
        const rows = analytics.map(a => [
          a.accessedAt.toISOString(),
          a.ipAddress || '',
          a.deviceType || '',
          a.browser || '',
          a.userAgent || '',
        ]);

        return [headers, ...rows].map(row => row.join(',')).join('\n');
      }
    } catch (error) {
      console.error('Error exporting analytics:', error);
      throw new Error('Failed to export analytics');
    }
  }
}
