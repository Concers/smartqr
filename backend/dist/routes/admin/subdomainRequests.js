"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../middleware/auth");
const database_1 = __importDefault(require("@/config/database"));
const subdomainService_1 = __importDefault(require("@/services/subdomainService"));
const router = (0, express_1.Router)();
const subdomainService = new subdomainService_1.default();
const requireAdmin = (req, res, next) => {
    const adminEmails = ['admin@netqr.io', 'admin@admin.com'];
    if (!adminEmails.includes(req.user.email)) {
        return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    next();
};
router.get('/subdomain-requests', auth_1.authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const where = status ? { status } : {};
        const [requests, total] = await Promise.all([
            database_1.default.subdomainRequest.findMany({
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
            database_1.default.subdomainRequest.count({ where }),
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
    }
    catch (error) {
        console.error('Error getting subdomain requests:', error);
        res.status(500).json({ success: false, message: 'Failed to get subdomain requests' });
    }
});
router.post('/subdomain-request/:id/approve', auth_1.authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const request = await database_1.default.subdomainRequest.findUnique({ where: { id } });
        if (!request)
            return res.status(404).json({ success: false, message: 'Request not found' });
        if (request.status !== 'pending') {
            return res.status(400).json({ success: false, message: 'Request is not pending' });
        }
        await subdomainService.assignRequestedSubdomainToUser(request.userId, request.requestedSubdomain);
        await database_1.default.subdomainRequest.update({
            where: { id },
            data: { status: 'approved', approvedAt: new Date() },
        });
        res.json({ success: true, message: 'Subdomain request approved' });
    }
    catch (error) {
        console.error('Error approving subdomain request:', error);
        const msg = error.message || 'Failed to approve subdomain request';
        res.status(400).json({ success: false, message: msg });
    }
});
router.post('/subdomain-request/:id/reject', auth_1.authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const request = await database_1.default.subdomainRequest.findUnique({ where: { id } });
        if (!request)
            return res.status(404).json({ success: false, message: 'Request not found' });
        if (request.status !== 'pending') {
            return res.status(400).json({ success: false, message: 'Request is not pending' });
        }
        await database_1.default.subdomainRequest.update({
            where: { id },
            data: {
                status: 'rejected',
                rejectedAt: new Date(),
                adminNotes: reason || 'Rejected',
            },
        });
        res.json({ success: true, message: 'Subdomain request rejected' });
    }
    catch (error) {
        console.error('Error rejecting subdomain request:', error);
        res.status(500).json({ success: false, message: 'Failed to reject subdomain request' });
    }
});
router.patch('/subdomain-request/:id', auth_1.authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { requestedSubdomain } = req.body;
        const request = await database_1.default.subdomainRequest.findUnique({ where: { id } });
        if (!request)
            return res.status(404).json({ success: false, message: 'Request not found' });
        if (request.status !== 'pending') {
            return res.status(400).json({ success: false, message: 'Only pending requests can be edited' });
        }
        const normalized = String(requestedSubdomain || '').trim().toLowerCase();
        if (!normalized) {
            return res.status(400).json({ success: false, message: 'requestedSubdomain is required' });
        }
        const existingUser = await database_1.default.user.findFirst({ where: { subdomain: normalized }, select: { id: true } });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Subdomain is already in use' });
        }
        const updated = await database_1.default.subdomainRequest.update({
            where: { id },
            data: { requestedSubdomain: normalized, updatedAt: new Date() },
        });
        res.json({ success: true, data: updated, message: 'Request updated' });
    }
    catch (error) {
        console.error('Error updating subdomain request:', error);
        res.status(500).json({ success: false, message: 'Failed to update subdomain request' });
    }
});
exports.default = router;
//# sourceMappingURL=subdomainRequests.js.map