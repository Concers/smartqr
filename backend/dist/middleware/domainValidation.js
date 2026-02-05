"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateDomain = void 0;
const app_1 = require("@/config/app");
const validateDomain = (req, res, next) => {
    try {
        const host = (req.hostname || '').toLowerCase();
        if (app_1.config.nodeEnv === 'development' && (host === 'localhost' || host.startsWith('localhost:'))) {
            next();
            return;
        }
        const allowed = [];
        if (app_1.config.qr.baseUrl) {
            try {
                const baseHost = new URL(app_1.config.qr.baseUrl).hostname.toLowerCase();
                allowed.push(baseHost);
            }
            catch {
            }
        }
        if (app_1.config.qr.customDomainEnabled) {
            for (const d of app_1.config.qr.domainAliases) {
                const dom = (d || '').trim().toLowerCase();
                if (dom)
                    allowed.push(dom);
            }
        }
        if (app_1.config.qr.rootDomain) {
            const dom = (app_1.config.qr.rootDomain || '').trim().toLowerCase();
            if (dom)
                allowed.push(dom);
        }
        if (allowed.includes(host)) {
            next();
            return;
        }
        for (const d of allowed) {
            if (host.endsWith(`.${d}`)) {
                next();
                return;
            }
        }
        res.status(403).json({
            success: false,
            error: 'Domain not allowed',
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: 'Domain validation error',
        });
    }
};
exports.validateDomain = validateDomain;
//# sourceMappingURL=domainValidation.js.map