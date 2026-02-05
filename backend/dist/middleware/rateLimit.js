"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redirectRateLimiter = exports.analyticsRateLimiter = exports.authRateLimiter = exports.qrRateLimiter = exports.rateLimiter = void 0;
const app_1 = require("@/config/app");
const cacheService_1 = require("@/services/cacheService");
const rateLimiter = (maxRequests = app_1.config.rateLimit.maxRequests, windowMs = app_1.config.rateLimit.windowMs) => {
    return async (req, res, next) => {
        if (app_1.config.nodeEnv === 'development') {
            return next();
        }
        try {
            const identifier = req.ip || req.connection.remoteAddress || 'unknown';
            const allowed = await cacheService_1.CacheService.setRateLimit(identifier, maxRequests, windowMs);
            if (!allowed) {
                res.status(429).json({
                    error: 'Too many requests',
                    message: `Rate limit exceeded. Max ${maxRequests} requests per ${windowMs / 1000} seconds.`,
                    retryAfter: Math.ceil(windowMs / 1000),
                });
                return;
            }
            const remaining = await cacheService_1.CacheService.getClickCount(`rate_limit:${identifier}`);
            res.set({
                'X-RateLimit-Limit': maxRequests.toString(),
                'X-RateLimit-Remaining': Math.max(0, maxRequests - remaining).toString(),
                'X-RateLimit-Reset': new Date(Date.now() + windowMs).toISOString(),
            });
            next();
        }
        catch (error) {
            console.error('Rate limiter error:', error);
            next();
        }
    };
};
exports.rateLimiter = rateLimiter;
exports.qrRateLimiter = app_1.config.nodeEnv === 'development'
    ? (0, exports.rateLimiter)(300, 60000)
    : (0, exports.rateLimiter)(10, 60000);
exports.authRateLimiter = app_1.config.nodeEnv === 'development'
    ? (0, exports.rateLimiter)(100, 60000)
    : (0, exports.rateLimiter)(5, 900000);
exports.analyticsRateLimiter = (0, exports.rateLimiter)(100, 60000);
const redirectRateLimiter = async (req, res, next) => {
    try {
        const { shortCode } = req.params;
        const identifier = `redirect:${shortCode}:${req.ip}`;
        const allowed = await cacheService_1.CacheService.setRateLimit(identifier, 30, 60000);
        if (!allowed) {
            res.status(429).json({
                error: 'Too many redirects',
                message: 'This QR code has been accessed too frequently. Please try again later.',
            });
            return;
        }
        next();
    }
    catch (error) {
        console.error('Redirect rate limiter error:', error);
        next();
    }
};
exports.redirectRateLimiter = redirectRateLimiter;
//# sourceMappingURL=rateLimit.js.map