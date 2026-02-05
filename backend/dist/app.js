"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("module-alias/register");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const path_1 = __importDefault(require("path"));
const app_1 = require("@/config/app");
const redis_1 = require("@/config/redis");
const rateLimit_1 = require("@/middleware/rateLimit");
const rateLimit_2 = require("@/middleware/rateLimit");
const validation_1 = require("@/middleware/validation");
const domainValidation_1 = require("@/middleware/domainValidation");
const requestTracking_1 = require("@/middleware/requestTracking");
require("./types/express");
const qr_1 = __importDefault(require("./routes/qr"));
const auth_1 = __importDefault(require("./routes/auth"));
const analytics_1 = __importDefault(require("./routes/analytics"));
const uploads_1 = __importDefault(require("./routes/uploads"));
const subdomain_1 = __importDefault(require("./routes/subdomain"));
const subdomainRequest_1 = __importDefault(require("./routes/subdomainRequest"));
const customDomain_1 = __importDefault(require("./routes/customDomain"));
const customDomain_2 = __importDefault(require("./routes/admin/customDomain"));
const subdomainRequests_1 = __importDefault(require("./routes/admin/subdomainRequests"));
const qrController_1 = require("./controllers/qrController");
const app = (0, express_1.default)();
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginEmbedderPolicy: false,
}));
const parseAllowedOrigins = () => {
    const allowed = new Set();
    const raw = (app_1.config.cors.origin || '').split(',').map((s) => s.trim()).filter(Boolean);
    for (const o of raw) {
        try {
            const u = new URL(o);
            allowed.add(u.origin);
        }
        catch {
        }
    }
    for (const u of [app_1.config.app.url, app_1.config.qr.baseUrl]) {
        try {
            allowed.add(new URL(u).origin);
        }
        catch {
        }
    }
    return allowed;
};
const allowedOrigins = parseAllowedOrigins();
const isOriginAllowed = (origin) => {
    if (!origin)
        return true;
    let host = '';
    try {
        host = new URL(origin).hostname.toLowerCase();
    }
    catch {
        return false;
    }
    if (app_1.config.nodeEnv === 'development' && (host === 'localhost' || host === '127.0.0.1')) {
        return true;
    }
    const root = (app_1.config.qr.rootDomain || '').toLowerCase();
    if (root && (host === root || host.endsWith(`.${root}`))) {
        return true;
    }
    return allowedOrigins.has(origin);
};
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (isOriginAllowed(origin || undefined)) {
            callback(null, true);
            return;
        }
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use('/uploads', express_1.default.static(path_1.default.resolve(app_1.config.upload.uploadPath)));
app.use(requestTracking_1.requestTracking);
if (app_1.config.nodeEnv === 'development') {
    app.use((0, morgan_1.default)('dev'));
}
else {
    app.use((0, morgan_1.default)('combined'));
}
app.use('/api/analytics', analytics_1.default);
app.use((0, rateLimit_1.rateLimiter)());
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: app_1.config.nodeEnv,
    });
});
app.use('/api/qr', qr_1.default);
app.use('/api/auth', auth_1.default);
app.use('/api/uploads', uploads_1.default);
app.use('/api/subdomain', subdomain_1.default);
app.use('/api/subdomain-request', subdomainRequest_1.default);
app.use('/api/custom-domain', customDomain_1.default);
app.use('/api/admin', customDomain_2.default);
app.use('/api/admin', subdomainRequests_1.default);
app.get('/:shortCode', domainValidation_1.validateDomain, validation_1.validateShortCode, rateLimit_2.redirectRateLimiter, requestTracking_1.redirectTracking, qrController_1.QRController.redirectQRCode);
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found',
    });
});
app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    res.status(err.status || 500).json({
        success: false,
        error: app_1.config.nodeEnv === 'production' ? 'Internal server error' : err.message,
        ...(app_1.config.nodeEnv === 'development' && { stack: err.stack }),
    });
});
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully');
    await (0, redis_1.disconnectRedis)();
    process.exit(0);
});
process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully');
    await (0, redis_1.disconnectRedis)();
    process.exit(0);
});
const startServer = async () => {
    try {
        await (0, redis_1.connectRedis)();
        app.listen(app_1.config.port, () => {
            console.log(`🚀 Server running on port ${app_1.config.port}`);
            console.log(`📊 Environment: ${app_1.config.nodeEnv}`);
            console.log(`🔗 API URL: ${app_1.config.app.url}`);
            console.log(`🎯 QR Base URL: ${app_1.config.qr.baseUrl}`);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});
if (require.main === module) {
    startServer();
}
exports.default = app;
//# sourceMappingURL=app.js.map