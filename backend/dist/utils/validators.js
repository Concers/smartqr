"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSchema = exports.analyticsQuerySchema = exports.userLoginSchema = exports.userRegistrationSchema = exports.updateDestinationSchema = exports.qrCodeSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.qrCodeSchema = joi_1.default.object({
    destinationUrl: joi_1.default.alternatives()
        .try(joi_1.default.string().uri(), joi_1.default.string().pattern(/^WIFI:/i), joi_1.default.string().pattern(/^data:text\/html/i))
        .required()
        .messages({
        'alternatives.match': 'Destination URL must be a valid URL, WIFI: config, or data: HTML',
        'any.required': 'Destination URL is required',
    }),
    customCode: joi_1.default.string()
        .pattern(/^[a-zA-Z0-9-]+$/)
        .min(3)
        .max(20)
        .optional()
        .messages({
        'string.pattern.base': 'Custom code must contain only alphanumeric characters and hyphens',
        'string.min': 'Custom code must be at least 3 characters long',
        'string.max': 'Custom code must not exceed 20 characters',
    }),
    customSubdomain: joi_1.default.string()
        .pattern(/^[a-z0-9-]+$/)
        .min(3)
        .max(20)
        .optional()
        .messages({
        'string.pattern.base': 'Custom subdomain must contain only lowercase letters, numbers, and hyphens',
        'string.min': 'Custom subdomain must be at least 3 characters long',
        'string.max': 'Custom subdomain must not exceed 20 characters',
    }),
    expiresAt: joi_1.default.date().iso().optional().messages({
        'date.format': 'Expiration date must be a valid ISO date',
    }),
});
exports.updateDestinationSchema = joi_1.default.object({
    destinationUrl: joi_1.default.alternatives()
        .try(joi_1.default.string().uri(), joi_1.default.string().pattern(/^WIFI:/i), joi_1.default.string().pattern(/^data:text\/html/i))
        .required()
        .messages({
        'alternatives.match': 'Destination URL must be a valid URL, WIFI: config, or data: HTML',
        'any.required': 'Destination URL is required',
    }),
    activeFrom: joi_1.default.date().iso().optional().messages({
        'date.format': 'Active from date must be a valid ISO date',
    }),
    expiresAt: joi_1.default.date().iso().optional().messages({
        'date.format': 'Expiration date must be a valid ISO date',
    }),
    isActive: joi_1.default.boolean().optional(),
});
exports.userRegistrationSchema = joi_1.default.object({
    email: joi_1.default.string().email().required().messages({
        'string.email': 'Email must be a valid email address',
        'any.required': 'Email is required',
    }),
    password: joi_1.default.string().min(6).required().messages({
        'string.min': 'Password must be at least 6 characters long',
        'any.required': 'Password is required',
    }),
    name: joi_1.default.string().min(2).max(100).optional().messages({
        'string.min': 'Name must be at least 2 characters long',
        'string.max': 'Name must not exceed 100 characters',
    }),
});
exports.userLoginSchema = joi_1.default.object({
    email: joi_1.default.string().email().required().messages({
        'string.email': 'Email must be a valid email address',
        'any.required': 'Email is required',
    }),
    password: joi_1.default.string().required().messages({
        'any.required': 'Password is required',
    }),
});
exports.analyticsQuerySchema = joi_1.default.object({
    from: joi_1.default.date().iso().optional(),
    to: joi_1.default.date().iso().optional(),
    limit: joi_1.default.number().integer().min(1).max(1000).default(100),
    offset: joi_1.default.number().integer().min(0).default(0),
});
const validateSchema = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body || req.query);
        if (error) {
            return res.status(400).json({
                error: 'Validation failed',
                details: error.details.map(detail => ({
                    field: detail.path.join('.'),
                    message: detail.message,
                })),
            });
        }
        req.validated = value;
        next();
    };
};
exports.validateSchema = validateSchema;
//# sourceMappingURL=validators.js.map