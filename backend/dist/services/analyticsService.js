"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const database_1 = __importDefault(require("@/config/database"));
const cacheService_1 = require("./cacheService");
class AnalyticsService {
    static async trackClick(qrCodeId, req) {
        try {
            const userAgent = req.headers['user-agent'] || '';
            const ipAddress = req.ip || req.connection.remoteAddress || '';
            const deviceType = this.extractDeviceType(userAgent);
            const browser = this.extractBrowser(userAgent);
            console.log(`📊 Analytics: Tracking click for QR ${qrCodeId} from IP ${ipAddress}, device: ${deviceType}, browser: ${browser}`);
            await database_1.default.qrAnalytics.create({
                data: {
                    qrCodeId,
                    ipAddress,
                    userAgent,
                    deviceType,
                    browser,
                    accessedAt: new Date(),
                },
            });
            console.log(`✅ Analytics: Successfully saved click data for QR ${qrCodeId}`);
            await cacheService_1.CacheService.incrementClickCount(qrCodeId);
            await cacheService_1.CacheService.invalidateAnalytics(qrCodeId);
        }
        catch (error) {
            console.error('❌ Error tracking click:', error);
        }
    }
    static async getAnalytics(qrCodeId, query) {
        try {
            const cacheKey = `${JSON.stringify(query)}`;
            const cached = await cacheService_1.CacheService.getCachedAnalytics(`${qrCodeId}:${cacheKey}`);
            if (cached) {
                return cached;
            }
            const where = {
                qrCodeId,
                ...(query.from && { accessedAt: { gte: new Date(query.from) } }),
                ...(query.to && { accessedAt: { lte: new Date(query.to) } }),
            };
            const [totalClicks, uniqueVisitors, topCountries, devices,] = await Promise.all([
                this.getTotalClicks(where),
                this.getUniqueVisitors(where),
                this.getTopCountries(where),
                this.getDeviceBreakdown(where),
            ]);
            const analytics = {
                totalClicks,
                uniqueVisitors,
                topCountries,
                devices,
                dailyStats: [],
            };
            await cacheService_1.CacheService.cacheAnalytics(`${qrCodeId}:${cacheKey}`, analytics, 300);
            return analytics;
        }
        catch (error) {
            console.error('Error getting analytics:', error);
            throw new Error('Failed to get analytics');
        }
    }
    static async getTotalClicks(where) {
        return await database_1.default.qrAnalytics.count({ where });
    }
    static async getUniqueVisitors(where) {
        const uniqueIPs = await database_1.default.qrAnalytics.findMany({
            where,
            select: { ipAddress: true },
            distinct: ['ipAddress'],
        });
        return uniqueIPs.length;
    }
    static async getTopCountries(where, limit = 10) {
        return [];
    }
    static async getDeviceBreakdown(where) {
        const devices = await database_1.default.qrAnalytics.groupBy({
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
    static async getOverallStats(userId) {
        try {
            const analyticsWhere = userId ? { qrCode: { userId } } : undefined;
            const [totalQRs, totalClicks, activeQRs, uniqueVisitors, topCountries, deviceBreakdown, browserBreakdown] = await Promise.all([
                database_1.default.qrCode.count(userId ? { where: { userId } } : undefined),
                database_1.default.qrAnalytics.count({ where: analyticsWhere }),
                database_1.default.qrCode.count({
                    where: {
                        ...(userId ? { userId } : {}),
                        isActive: true,
                    },
                }),
                this.getUniqueVisitors(analyticsWhere),
                this.getTopCountries(analyticsWhere, 5),
                this.getDeviceBreakdown(analyticsWhere),
                this.getBrowserBreakdown(analyticsWhere),
            ]);
            return {
                totalClicks,
                uniqueVisitors,
                topCountries,
                deviceBreakdown: deviceBreakdown.map(d => ({ device: d.type, clicks: d.count })),
                browserBreakdown: browserBreakdown.map(b => ({ browser: b.name, clicks: b.count })),
            };
        }
        catch (error) {
            console.error('Error getting overall stats:', error);
            throw new Error('Failed to get overall stats');
        }
    }
    static async getDailyStats(userId) {
        try {
            const from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            const to = new Date();
            const analytics = await database_1.default.qrAnalytics.findMany({
                where: {
                    accessedAt: {
                        gte: from,
                        lte: to,
                    },
                },
                select: {
                    accessedAt: true,
                },
                orderBy: {
                    accessedAt: 'desc',
                },
            });
            const dailyStats = analytics.reduce((acc, item) => {
                const date = item.accessedAt.toISOString().split('T')[0];
                const existing = acc.find((d) => d.date === date);
                if (existing) {
                    existing.clicks += 1;
                }
                else {
                    acc.push({ date, clicks: 1 });
                }
                return acc;
            }, []);
            return dailyStats;
        }
        catch (error) {
            console.error('Error getting daily stats:', error);
            throw new Error('Failed to get daily stats');
        }
    }
    static extractDeviceType(userAgent) {
        const ua = userAgent.toLowerCase();
        if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
            return 'mobile';
        }
        else if (ua.includes('tablet') || ua.includes('ipad')) {
            return 'tablet';
        }
        else {
            return 'desktop';
        }
    }
    static extractBrowser(userAgent) {
        const ua = userAgent.toLowerCase();
        if (ua.includes('chrome'))
            return 'chrome';
        if (ua.includes('firefox'))
            return 'firefox';
        if (ua.includes('safari'))
            return 'safari';
        if (ua.includes('edge'))
            return 'edge';
        if (ua.includes('opera'))
            return 'opera';
        return 'unknown';
    }
    static async getGeoStats(userId) {
        try {
            return [];
        }
        catch (error) {
            console.error('Error getting geo stats:', error);
            throw new Error('Failed to get geo stats');
        }
    }
    static async getDeviceStats(userId) {
        try {
            const where = userId ? { qrCode: { userId } } : {};
            const devices = await database_1.default.qrAnalytics.groupBy({
                by: ['deviceType'],
                where,
                _count: {
                    deviceType: true,
                },
            });
            return devices.map(device => ({
                device: device.deviceType || 'unknown',
                clicks: device._count.deviceType,
            }));
        }
        catch (error) {
            console.error('Error getting device stats:', error);
            throw new Error('Failed to get device stats');
        }
    }
    static async getBrowserStats(userId) {
        try {
            const where = userId ? { qrCode: { userId } } : {};
            const browsers = await database_1.default.qrAnalytics.groupBy({
                by: ['browser'],
                where,
                _count: {
                    browser: true,
                },
            });
            return browsers.map(browser => ({
                browser: browser.browser || 'unknown',
                clicks: browser._count.browser,
            }));
        }
        catch (error) {
            console.error('Error getting browser stats:', error);
            throw new Error('Failed to get browser stats');
        }
    }
    static async getBrowserBreakdown(where) {
        const browsers = await database_1.default.qrAnalytics.groupBy({
            by: ['browser'],
            where,
            _count: {
                browser: true,
            },
        });
        return browsers.map(browser => ({
            name: browser.browser || 'unknown',
            count: browser._count.browser,
        }));
    }
    static async getRecentActivity(userId, limit = 10) {
        try {
            const where = userId ? { qrCode: { userId } } : {};
            const recentClicks = await database_1.default.qrAnalytics.findMany({
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
        }
        catch (error) {
            console.error('Error getting recent activity:', error);
            throw new Error('Failed to get recent activity');
        }
    }
    static async exportAnalytics(qrCodeId, format = 'csv') {
        try {
            const analytics = await database_1.default.qrAnalytics.findMany({
                where: { qrCodeId },
                orderBy: { accessedAt: 'desc' },
            });
            if (format === 'json') {
                return JSON.stringify(analytics, null, 2);
            }
            else {
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
        }
        catch (error) {
            console.error('Error exporting analytics:', error);
            throw new Error('Failed to export analytics');
        }
    }
}
exports.AnalyticsService = AnalyticsService;
//# sourceMappingURL=analyticsService.js.map