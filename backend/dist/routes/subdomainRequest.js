"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const database_1 = __importDefault(require("@/config/database"));
const router = (0, express_1.Router)();
const normalizeRequestedSubdomain = (input) => {
    return (input || '').trim().toLowerCase();
};
const isValidRequestedSubdomain = (sub) => {
    if (!sub)
        return false;
    if (sub.length < 3 || sub.length > 30)
        return false;
    if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(sub))
        return false;
    if (sub.includes('--'))
        return false;
    return true;
};
router.post('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const requestedSubdomain = normalizeRequestedSubdomain(req.body?.requestedSubdomain);
        if (!isValidRequestedSubdomain(requestedSubdomain)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid subdomain format',
            });
        }
        const reserved = new Set(['www', 'netqr', 'admin', 'api']);
        if (reserved.has(requestedSubdomain)) {
            return res.status(400).json({
                success: false,
                message: 'Subdomain is reserved',
            });
        }
        const existingUser = await database_1.default.user.findFirst({
            where: { subdomain: requestedSubdomain },
            select: { id: true },
        });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Subdomain is already in use',
            });
        }
        const existingRequest = await database_1.default.subdomainRequest.findFirst({
            where: {
                requestedSubdomain,
                status: { in: ['pending', 'approved'] },
            },
            select: { id: true },
        });
        if (existingRequest) {
            return res.status(400).json({
                success: false,
                message: 'Subdomain already requested',
            });
        }
        const created = await database_1.default.subdomainRequest.create({
            data: {
                userId,
                requestedSubdomain,
                status: 'pending',
            },
        });
        res.status(201).json({
            success: true,
            data: created,
            message: 'Subdomain request submitted',
        });
    }
    catch (error) {
        console.error('Subdomain request error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to submit subdomain request',
        });
    }
});
router.get('/my', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const requests = await database_1.default.subdomainRequest.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
        res.json({
            success: true,
            data: { requests },
        });
    }
    catch (error) {
        console.error('Get my subdomain requests error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get subdomain requests',
        });
    }
});
exports.default = router;
//# sourceMappingURL=subdomainRequest.js.map