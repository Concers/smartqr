"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../middleware/auth");
const customDomainService_1 = __importDefault(require("../../services/customDomainService"));
const router = (0, express_1.Router)();
const customDomainService = new customDomainService_1.default();
const requireAdmin = (req, res, next) => {
    const adminEmails = ['admin@netqr.io', 'admin@admin.com'];
    if (!adminEmails.includes(req.user.email)) {
        return res.status(403).json({
            success: false,
            message: 'Admin access required'
        });
    }
    next();
};
router.get('/custom-domains', auth_1.authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const result = await customDomainService.getAllCustomDomains(status, Number(page), Number(limit));
        res.json({
            success: true,
            data: result
        });
    }
    catch (error) {
        console.error('Error getting custom domains:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get custom domains'
        });
    }
});
router.post('/custom-domain/:id/approve', auth_1.authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.user.id;
        await customDomainService.approveDomain(id, adminId);
        res.json({
            success: true,
            message: 'Custom domain approved successfully'
        });
    }
    catch (error) {
        console.error('Error approving custom domain:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to approve custom domain'
        });
    }
});
router.post('/custom-domain/:id/reject', auth_1.authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        if (!reason) {
            return res.status(400).json({
                success: false,
                message: 'Rejection reason is required'
            });
        }
        await customDomainService.rejectDomain(id, reason);
        res.json({
            success: true,
            message: 'Custom domain rejected successfully'
        });
    }
    catch (error) {
        console.error('Error rejecting custom domain:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to reject custom domain'
        });
    }
});
router.post('/custom-domains/bulk-approve', auth_1.authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { domainIds } = req.body;
        const adminId = req.user.id;
        if (!domainIds || !Array.isArray(domainIds)) {
            return res.status(400).json({
                success: false,
                message: 'Domain IDs array is required'
            });
        }
        let successCount = 0;
        let errorCount = 0;
        const errors = [];
        for (const domainId of domainIds) {
            try {
                await customDomainService.approveDomain(domainId, adminId);
                successCount++;
            }
            catch (error) {
                errorCount++;
                errors.push({
                    domainId,
                    error: error.message
                });
            }
        }
        res.json({
            success: true,
            message: `Bulk approval completed. Success: ${successCount}, Errors: ${errorCount}`,
            data: {
                successCount,
                errorCount,
                errors
            }
        });
    }
    catch (error) {
        console.error('Error in bulk approve:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to bulk approve custom domains'
        });
    }
});
router.post('/custom-domains/bulk-reject', auth_1.authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { domainIds, reason } = req.body;
        if (!domainIds || !Array.isArray(domainIds)) {
            return res.status(400).json({
                success: false,
                message: 'Domain IDs array is required'
            });
        }
        if (!reason) {
            return res.status(400).json({
                success: false,
                message: 'Rejection reason is required'
            });
        }
        let successCount = 0;
        let errorCount = 0;
        const errors = [];
        for (const domainId of domainIds) {
            try {
                await customDomainService.rejectDomain(domainId, reason);
                successCount++;
            }
            catch (error) {
                errorCount++;
                errors.push({
                    domainId,
                    error: error.message
                });
            }
        }
        res.json({
            success: true,
            message: `Bulk rejection completed. Success: ${successCount}, Errors: ${errorCount}`,
            data: {
                successCount,
                errorCount,
                errors
            }
        });
    }
    catch (error) {
        console.error('Error in bulk reject:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to bulk reject custom domains'
        });
    }
});
router.get('/custom-domains/stats', auth_1.authenticateToken, requireAdmin, async (req, res) => {
    try {
        const stats = {
            total: 0,
            pending: 0,
            approved: 0,
            rejected: 0,
            dnsVerified: 0,
            sslConfigured: 0
        };
        res.json({
            success: true,
            data: stats
        });
    }
    catch (error) {
        console.error('Error getting custom domain stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get custom domain statistics'
        });
    }
});
exports.default = router;
//# sourceMappingURL=customDomain.js.map