import Joi from 'joi';

export const qrCodeSchema = Joi.object({
  destinationUrl: Joi.alternatives()
    .try(
      Joi.string().uri(), 
      Joi.string().pattern(/^WIFI:/i),
      Joi.string().pattern(/^data:text\/html/i)
    )
    .required()
    .messages({
      'alternatives.match': 'Destination URL must be a valid URL, WIFI: config, or data: HTML',
      'any.required': 'Destination URL is required',
    }),
  customCode: Joi.string()
    .pattern(/^[a-zA-Z0-9-]+$/)
    .min(3)
    .max(20)
    .optional()
    .messages({
      'string.pattern.base': 'Custom code must contain only alphanumeric characters and hyphens',
      'string.min': 'Custom code must be at least 3 characters long',
      'string.max': 'Custom code must not exceed 20 characters',
    }),
  customSubdomain: Joi.string()
    .pattern(/^[a-z0-9-]+$/)
    .min(3)
    .max(20)
    .optional()
    .messages({
      'string.pattern.base': 'Custom subdomain must contain only lowercase letters, numbers, and hyphens',
      'string.min': 'Custom subdomain must be at least 3 characters long',
      'string.max': 'Custom subdomain must not exceed 20 characters',
    }),
  expiresAt: Joi.date().iso().optional().messages({
    'date.format': 'Expiration date must be a valid ISO date',
  }),
});

export const updateDestinationSchema = Joi.object({
  destinationUrl: Joi.alternatives()
    .try(
      Joi.string().uri(), 
      Joi.string().pattern(/^WIFI:/i),
      Joi.string().pattern(/^data:text\/html/i)
    )
    .required()
    .messages({
      'alternatives.match': 'Destination URL must be a valid URL, WIFI: config, or data: HTML',
      'any.required': 'Destination URL is required',
    }),
  activeFrom: Joi.date().iso().optional().messages({
    'date.format': 'Active from date must be a valid ISO date',
  }),
  expiresAt: Joi.date().iso().optional().messages({
    'date.format': 'Expiration date must be a valid ISO date',
  }),
  isActive: Joi.boolean().optional(),
});

export const userRegistrationSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email must be a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters long',
    'any.required': 'Password is required',
  }),
  name: Joi.string().min(2).max(100).optional().messages({
    'string.min': 'Name must be at least 2 characters long',
    'string.max': 'Name must not exceed 100 characters',
  }),
});

export const userLoginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email must be a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required',
  }),
});

export const analyticsQuerySchema = Joi.object({
  from: Joi.date().iso().optional(),
  to: Joi.date().iso().optional(),
  limit: Joi.number().integer().min(1).max(1000).default(100),
  offset: Joi.number().integer().min(0).default(0),
});

export const validateSchema = (schema: Joi.ObjectSchema) => {
  return (req: any, res: any, next: any) => {
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
