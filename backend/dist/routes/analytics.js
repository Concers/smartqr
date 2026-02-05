"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const analyticsService_1 = require("@/services/analyticsService");
const auth_1 = require("@/middleware/auth");
const validation_1 = require("@/middleware/validation");
const analyticsController_1 = require("@/controllers/analyticsController");
const database_1 = __importDefault(require("@/config/database"));
const router = (0, express_1.Router)();
router.get('/overview', auth_1.authenticateToken, analyticsController_1.AnalyticsController.getOverallStats);
router.get('/daily', auth_1.authenticateToken, analyticsController_1.AnalyticsController.getDailyStats);
router.get('/geo', auth_1.authenticateToken, analyticsController_1.AnalyticsController.getGeoStats);
router.get('/devices', auth_1.authenticateToken, analyticsController_1.AnalyticsController.getDeviceStats);
router.get('/browsers', auth_1.authenticateToken, analyticsController_1.AnalyticsController.getBrowserStats);
router.get('/:id', auth_1.authenticateToken, validation_1.validateUUID, validation_1.validateAnalyticsQuery, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        const query = req.validated || req.query;
        const qrCode = await database_1.default.qrCode.findFirst({
            where: { id, userId },
        });
        if (!qrCode) {
            return res.status(404).json({
                success: false,
                error: 'QR code not found',
            });
        }
        const analytics = await analyticsService_1.AnalyticsService.getAnalytics(id, query);
        res.json({
            success: true,
            data: analytics,
        });
    }
    catch (error) {
        console.error('Get analytics error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to get analytics',
        });
    }
});
router.get('/activity/recent', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.id;
        const limit = parseInt(req.query.limit) || 10;
        const activity = await analyticsService_1.AnalyticsService.getRecentActivity(userId, limit);
        res.json({
            success: true,
            data: activity,
        });
    }
    catch (error) {
        console.error('Get recent activity error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to get recent activity',
        });
    }
});
router.get('/:id/export', auth_1.authenticateToken, validation_1.validateUUID, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        const format = req.query.format || 'csv';
        const qrCode = await database_1.default.qrCode.findFirst({
            where: { id, userId },
        });
        if (!qrCode) {
            return res.status(404).json({
                success: false,
                error: 'QR code not found',
            });
        }
        const exportData = await analyticsService_1.AnalyticsService.exportAnalytics(id, format);
        if (format === 'json') {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', `attachment; filename="analytics-${id}.json"`);
        }
        else {
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="analytics-${id}.csv"`);
        }
        res.send(exportData);
    }
    catch (error) {
        console.error('Export analytics error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to export analytics',
        });
    }
});
exports.default = router;
//# sourceMappingURL=analytics.js.map