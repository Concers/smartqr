"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const auth_1 = require("@/middleware/auth");
const app_1 = require("@/config/app");
const validation_1 = require("@/middleware/validation");
const rateLimit_1 = require("@/middleware/rateLimit");
const database_1 = __importDefault(require("@/config/database"));
const subdomainService_1 = __importDefault(require("@/services/subdomainService"));
const router = (0, express_1.Router)();
router.post('/register', rateLimit_1.authRateLimiter, validation_1.validateUserRegistration, async (req, res) => {
    try {
        const { email, password, name } = req.validated;
        const existingUser = await database_1.default.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: 'User already exists',
            });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, app_1.config.security.bcryptRounds);
        const user = await database_1.default.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
            },
            select: {
                id: true,
                email: true,
                name: true,
                createdAt: true,
                subdomain: true,
            },
        });
        const subdomainService = new subdomainService_1.default();
        let assignedSubdomain = user.subdomain;
        if (!assignedSubdomain) {
            assignedSubdomain = await subdomainService.assignSubdomainOnRegistration(user.id);
        }
        const token = (0, auth_1.generateToken)(user.id);
        res.status(201).json({
            success: true,
            data: {
                user: {
                    ...user,
                    subdomain: assignedSubdomain,
                },
                token,
            },
            message: 'User registered successfully',
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Registration failed',
        });
    }
});
router.post('/login', rateLimit_1.authRateLimiter, validation_1.validateUserLogin, async (req, res) => {
    try {
        const { email, password } = req.validated;
        const user = await database_1.default.user.findUnique({
            where: { email },
        });
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials',
            });
        }
        const isValidPassword = await bcryptjs_1.default.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials',
            });
        }
        let subdomain = user.subdomain;
        if (!subdomain) {
            const subdomainService = new subdomainService_1.default();
            subdomain = await subdomainService.assignSubdomainToUser(user.id);
        }
        const token = (0, auth_1.generateToken)(user.id);
        res.json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    subdomain,
                },
                token,
            },
            message: 'Login successful',
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Login failed',
        });
    }
});
router.get('/profile', async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Access token required',
            });
        }
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, app_1.config.jwt.secret);
        const user = await database_1.default.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                email: true,
                name: true,
                createdAt: true,
            },
        });
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid token',
            });
        }
        res.json({
            success: true,
            data: { user },
        });
    }
    catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to get profile',
        });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map