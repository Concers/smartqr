"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redirectTracking = exports.requestTracking = void 0;
const requestTracking = (req, res, next) => {
    req.tracking = {
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'] || '',
        referer: req.headers.referer || req.headers.referrer || '',
        timestamp: new Date().toISOString(),
    };
    next();
};
exports.requestTracking = requestTracking;
const redirectTracking = (req, res, next) => {
    req.redirectTracking = {
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'] || '',
        shortCode: req.params.shortCode,
        timestamp: new Date().toISOString(),
    };
    next();
};
exports.redirectTracking = redirectTracking;
//# sourceMappingURL=requestTracking.js.map