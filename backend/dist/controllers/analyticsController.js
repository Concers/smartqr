"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsController = void 0;
const database_1 = __importDefault(require("@/config/database"));
const analyticsService_1 = require("@/services/analyticsService");
class AnalyticsController {
    static async getOverallStats(req, res) {
        try {
            const userId = req.user?.id;
            const qrId = req.query.qrId;
            const stats = await analyticsService_1.AnalyticsService.getOverallStats(userId, qrId);
            res.json({ success: true, data: stats });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message || 'Failed to get overall stats' });
        }
    }
    static async getDailyStats(req, res) {
        try {
            const userId = req.user?.id;
            const qrId = req.query.qrId;
            const stats = await analyticsService_1.AnalyticsService.getDailyStats(userId, qrId);
            res.json({ success: true, data: stats });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message || 'Failed to get daily stats' });
        }
    }
    static async getGeoStats(req, res) {
        try {
            const userId = req.user?.id;
            const qrId = req.query.qrId;
            const stats = await analyticsService_1.AnalyticsService.getGeoStats(userId, qrId);
            res.json({ success: true, data: stats });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message || 'Failed to get geo stats' });
        }
    }
    static async getDeviceStats(req, res) {
        try {
            const userId = req.user?.id;
            const qrId = req.query.qrId;
            const stats = await analyticsService_1.AnalyticsService.getDeviceStats(userId, qrId);
            res.json({ success: true, data: stats });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message || 'Failed to get device stats' });
        }
    }
    static async getBrowserStats(req, res) {
        try {
            const userId = req.user?.id;
            const qrId = req.query.qrId;
            const stats = await analyticsService_1.AnalyticsService.getBrowserStats(userId, qrId);
            res.json({ success: true, data: stats });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message || 'Failed to get browser stats' });
        }
    }
    static async getHourlyStats(req, res) {
        try {
            const userId = req.user?.id;
            const qrId = req.query.qrId;
            const stats = await analyticsService_1.AnalyticsService.getHourlyStats(userId, qrId);
            res.json({ success: true, data: stats });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message || 'Failed to get hourly stats' });
        }
    }
    static async getRecentClicks(req, res) {
        try {
            const userId = req.user?.id;
            const qrId = req.query.qrId;
            const limit = parseInt(req.query.limit) || 20;
            const clicks = await analyticsService_1.AnalyticsService.getRecentClicks(userId, qrId, limit);
            res.json({ success: true, data: clicks });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message || 'Failed to get recent clicks' });
        }
    }
    static async getQRCodeAnalytics(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user?.id;
            const query = req.validated || req.query;
            const owned = await database_1.default.qrCode.findFirst({ where: { id, userId } });
            if (!owned) {
                res.status(404).json({ success: false, error: 'QR code not found' });
                return;
            }
            const analytics = await analyticsService_1.AnalyticsService.getAnalytics(id, query);
            res.json({ success: true, data: analytics });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message || 'Failed to get analytics' });
        }
    }
}
exports.AnalyticsController = AnalyticsController;
//# sourceMappingURL=analyticsController.js.map