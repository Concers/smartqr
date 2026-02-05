"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const customDomainService_1 = __importDefault(require("../services/customDomainService"));
const router = (0, express_1.Router)();
const customDomainService = new customDomainService_1.default();
router.post('/request', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { domain } = req.body;
        if (!domain) {
            return res.status(400).json({
                success: false,
                message: 'Domain is required'
            });
        }
        const result = await customDomainService.requestCustomDomain(userId, domain);
        res.status(201).json({
            success: true,
            message: 'Custom domain request submitted successfully',
            data: result
        });
    }
    catch (error) {
        console.error('Error requesting custom domain:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to request custom domain'
        });
    }
});
router.get('/verify-dns/:domain', auth_1.authenticateToken, async (req, res) => {
    try {
        const { domain } = req.params;
        const verified = await customDomainService.verifyDNSOwnership(domain);
        res.json({
            success: true,
            data: {
                domain,
                verified,
                message: verified ? 'DNS verification successful' : 'DNS verification failed'
            }
        });
    }
    catch (error) {
        console.error('Error verifying DNS:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify DNS ownership'
        });
    }
});
router.get('/my-domains', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const domains = await customDomainService.getUserCustomDomains(userId);
        res.json({
            success: true,
            data: {
                domains,
                total: domains.length
            }
        });
    }
    catch (error) {
        console.error('Error getting user custom domains:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get custom domains'
        });
    }
});
router.get('/check/:domain', auth_1.authenticateToken, async (req, res) => {
    try {
        const { domain } = req.params;
        const available = await customDomainService.isDomainAvailable(domain);
        res.json({
            success: true,
            data: {
                domain,
                available
            }
        });
    }
    catch (error) {
        console.error('Error checking domain availability:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check domain availability'
        });
    }
});
exports.default = router;
//# sourceMappingURL=customDomain.js.map