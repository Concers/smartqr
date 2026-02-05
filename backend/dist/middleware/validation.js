"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateURL = exports.validatePagination = exports.validateUUID = exports.validateShortCode = exports.validateAnalyticsQuery = exports.validateUserLogin = exports.validateUserRegistration = exports.validateUpdateDestination = exports.validateCreateQR = void 0;
const validators_1 = require("@/utils/validators");
const validators_2 = require("@/utils/validators");
exports.validateCreateQR = (0, validators_1.validateSchema)(validators_2.qrCodeSchema);
exports.validateUpdateDestination = (0, validators_1.validateSchema)(validators_2.updateDestinationSchema);
exports.validateUserRegistration = (0, validators_1.validateSchema)(validators_2.userRegistrationSchema);
exports.validateUserLogin = (0, validators_1.validateSchema)(validators_2.userLoginSchema);
exports.validateAnalyticsQuery = (0, validators_1.validateSchema)(validators_2.analyticsQuerySchema);
const validateShortCode = (req, res, next) => {
    const { shortCode } = req.params;
    if (!shortCode || shortCode.length < 3 || shortCode.length > 20) {
        res.status(400).json({
            error: 'Invalid short code',
            message: 'Short code must be between 3 and 20 characters',
        });
        return;
    }
    const validPattern = /^[a-zA-Z0-9-]+$/;
    if (!validPattern.test(shortCode)) {
        res.status(400).json({
            error: 'Invalid short code format',
            message: 'Short code can only contain letters, numbers, and hyphens',
        });
        return;
    }
    next();
};
exports.validateShortCode = validateShortCode;
const validateUUID = (req, res, next) => {
    const { id } = req.params;
    if (!id || !/^[a-zA-Z0-9-]{20,}$/.test(id)) {
        res.status(400).json({
            error: 'Invalid ID format',
            message: 'ID must be a valid UUID or CUID',
        });
        return;
    }
    next();
};
exports.validateUUID = validateUUID;
const validatePagination = (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    if (page < 1) {
        res.status(400).json({
            error: 'Invalid page number',
            message: 'Page must be greater than 0',
        });
        return;
    }
    if (limit < 1 || limit > 100) {
        res.status(400).json({
            error: 'Invalid limit',
            message: 'Limit must be between 1 and 100',
        });
        return;
    }
    req.query.page = page.toString();
    req.query.limit = limit.toString();
    next();
};
exports.validatePagination = validatePagination;
const validateURL = (req, res, next) => {
    const { destinationUrl } = req.body;
    if (!destinationUrl) {
        res.status(400).json({
            error: 'Destination URL is required',
        });
        return;
    }
    try {
        new URL(destinationUrl);
        next();
    }
    catch {
        res.status(400).json({
            error: 'Invalid URL format',
            message: 'Please provide a valid URL',
        });
    }
};
exports.validateURL = validateURL;
//# sourceMappingURL=validation.js.map