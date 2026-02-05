"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const subdomainService_1 = __importDefault(require("../services/subdomainService"));
const router = (0, express_1.Router)();
const subdomainService = new subdomainService_1.default();
router.get('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const [currentSubdomain, history] = await Promise.all([
            subdomainService.getUserSubdomain(userId),
            subdomainService.getSubdomainHistory(userId)
        ]);
        res.json({
            success: true,
            data: {
                subdomain: currentSubdomain,
                history,
                canChange: history.length < 5
            }
        });
    }
    catch (error) {
        console.error('Error getting subdomain info:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get subdomain information'
        });
    }
});
router.post('/change', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const history = await subdomainService.getSubdomainHistory(userId);
        if (history.length >= 5) {
            return res.status(400).json({
                success: false,
                message: 'Subdomain change limit reached (5 changes allowed)'
            });
        }
        const newSubdomain = await subdomainService.assignSubdomainToUser(userId);
        res.json({
            success: true,
            message: 'Subdomain changed successfully',
            data: {
                subdomain: newSubdomain,
                url: `https://${newSubdomain}.netqr.io`
            }
        });
    }
    catch (error) {
        console.error('Error changing subdomain:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to change subdomain'
        });
    }
});
router.get('/history', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const history = await subdomainService.getSubdomainHistory(userId);
        res.json({
            success: true,
            data: {
                history,
                totalChanges: history.length
            }
        });
    }
    catch (error) {
        console.error('Error getting subdomain history:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get subdomain history'
        });
    }
});
router.post('/assign-existing', auth_1.authenticateToken, async (req, res) => {
    try {
        const adminEmails = ['admin@netqr.io', 'admin@admin.com'];
        if (!adminEmails.includes(req.user.email)) {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }
        await subdomainService.assignSubdomainsToExistingUsers();
        res.json({
            success: true,
            message: 'Subdomain assignment process started for existing users'
        });
    }
    catch (error) {
        console.error('Error assigning subdomains to existing users:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to assign subdomains to existing users'
        });
    }
});
router.get('/check/:subdomain', auth_1.authenticateToken, async (req, res) => {
    try {
        const { subdomain } = req.params;
        if (!subdomainService.isValidSubdomainFormat(subdomain)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid subdomain format'
            });
        }
        const isAvailable = await subdomainService.isSubdomainAvailable(subdomain);
        res.json({
            success: true,
            data: {
                subdomain,
                available: isAvailable
            }
        });
    }
    catch (error) {
        console.error('Error checking subdomain availability:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check subdomain availability'
        });
    }
});
exports.default = router;
//# sourceMappingURL=subdomain.js.map