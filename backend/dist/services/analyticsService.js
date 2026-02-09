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
            const ipAddress = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
                || req.headers['x-real-ip']
                || req.ip
                || req.connection?.remoteAddress
                || '';
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
    static async getOverallStats(userId, qrId) {
        try {
            const analyticsWhere = {};
            if (userId)
                analyticsWhere.qrCode = { userId };
            if (qrId)
                analyticsWhere.qrCodeId = qrId;
            const qrWhere = {};
            if (userId)
                qrWhere.userId = userId;
            if (qrId)
                qrWhere.id = qrId;
            const [totalQRs, totalClicks, activeQRs, uniqueVisitors, topCountries, deviceBreakdown, browserBreakdown] = await Promise.all([
                database_1.default.qrCode.count({ where: qrWhere }),
                database_1.default.qrAnalytics.count({ where: Object.keys(analyticsWhere).length ? analyticsWhere : undefined }),
                database_1.default.qrCode.count({
                    where: {
                        ...qrWhere,
                        isActive: true,
                    },
                }),
                this.getUniqueVisitors(Object.keys(analyticsWhere).length ? analyticsWhere : undefined),
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
    static async getDailyStats(userId, qrId) {
        try {
            const days = 30;
            const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
            const to = new Date();
            const where = {
                accessedAt: { gte: from, lte: to },
            };
            if (userId)
                where.qrCode = { userId };
            if (qrId)
                where.qrCodeId = qrId;
            const analytics = await database_1.default.qrAnalytics.findMany({
                where,
                select: {
                    accessedAt: true,
                    deviceType: true,
                },
                orderBy: {
                    accessedAt: 'desc',
                },
            });
            const dateMap = {};
            for (let i = 0; i < days; i++) {
                const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
                const key = d.toISOString().split('T')[0];
                dateMap[key] = { clicks: 0, mobile: 0, desktop: 0 };
            }
            for (const item of analytics) {
                const date = item.accessedAt.toISOString().split('T')[0];
                if (dateMap[date]) {
                    dateMap[date].clicks += 1;
                    if (item.deviceType === 'mobile')
                        dateMap[date].mobile += 1;
                    else
                        dateMap[date].desktop += 1;
                }
            }
            return Object.entries(dateMap)
                .map(([date, stats]) => ({ date, ...stats }))
                .sort((a, b) => a.date.localeCompare(b.date));
        }
        catch (error) {
            console.error('Error getting daily stats:', error);
            throw new Error('Failed to get daily stats');
        }
    }
    static async getHourlyStats(userId, qrId) {
        try {
            const from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            const where = { accessedAt: { gte: from } };
            if (userId)
                where.qrCode = { userId };
            if (qrId)
                where.qrCodeId = qrId;
            const analytics = await database_1.default.qrAnalytics.findMany({
                where,
                select: { accessedAt: true },
            });
            const hours = Array.from({ length: 24 }, (_, i) => ({ hour: i, clicks: 0 }));
            for (const item of analytics) {
                const h = item.accessedAt.getHours();
                hours[h].clicks += 1;
            }
            return hours;
        }
        catch (error) {
            console.error('Error getting hourly stats:', error);
            throw new Error('Failed to get hourly stats');
        }
    }
    static async getRecentClicks(userId, qrId, limit = 20) {
        try {
            const where = {};
            if (userId)
                where.qrCode = { userId };
            if (qrId)
                where.qrCodeId = qrId;
            const clicks = await database_1.default.qrAnalytics.findMany({
                where,
                include: { qrCode: { select: { shortCode: true } } },
                orderBy: { accessedAt: 'desc' },
                take: limit,
            });
            return clicks.map(c => ({
                shortCode: c.qrCode.shortCode,
                accessedAt: c.accessedAt,
                deviceType: c.deviceType,
                browser: c.browser,
                ipAddress: c.ipAddress,
            }));
        }
        catch (error) {
            console.error('Error getting recent clicks:', error);
            throw new Error('Failed to get recent clicks');
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
    static async getGeoStats(userId, qrId) {
        try {
            return [];
        }
        catch (error) {
            console.error('Error getting geo stats:', error);
            throw new Error('Failed to get geo stats');
        }
    }
    static async getDeviceStats(userId, qrId) {
        try {
            const where = {};
            if (userId)
                where.qrCode = { userId };
            if (qrId)
                where.qrCodeId = qrId;
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
    static async getBrowserStats(userId, qrId) {
        try {
            const where = {};
            if (userId)
                where.qrCode = { userId };
            if (qrId)
                where.qrCodeId = qrId;
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