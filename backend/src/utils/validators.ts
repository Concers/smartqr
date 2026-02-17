import Joi from 'joi';

export const qrCodeSchema = Joi.object({
  type: Joi.string()
    .valid(
      'url', 'text', 'wifi', 'vcard', 'facebook', 'instagram', 'twitter', 
      'youtube', 'linkedin', 'tiktok', 'email', 'phone', 'sms', 'whatsapp', 
      'pdf', 'video', 'gallery', 'google-docs', 'google-forms', 'google-sheets', 
      'map', 'emergency-location', 'car-sticker', 'pet-id', 'multi-link', 
      'google-review', 'digital-menu', 'coupon', 'calendar', 'review-platform'
    )
    .default('url')
    .optional(),
  
  content: Joi.when('type', {
    is: 'url',
    then: Joi.object({
      url: Joi.string().uri().required()
    }),
    otherwise: Joi.when('type', {
      is: 'text',
      then: Joi.object({
        text: Joi.string().max(4000).required()
      }),
      otherwise: Joi.when('type', {
        is: 'email',
        then: Joi.object({
          to: Joi.string().email().required(),
          subject: Joi.string().max(200).optional(),
          body: Joi.string().max(2000).optional(),
          cc: Joi.string().email().optional(),
          bcc: Joi.string().email().optional()
        }),
        otherwise: Joi.when('type', {
          is: 'phone',
          then: Joi.object({
            phone: Joi.string().pattern(/^\+[\d\s\-\(\)]+$/).required(),
            name: Joi.string().max(100).optional(),
            businessHours: Joi.string().max(50).optional()
          }),
          otherwise: Joi.when('type', {
            is: 'sms',
            then: Joi.object({
              phone: Joi.string().pattern(/^\+[\d\s\-\(\)]+$/).required(),
              message: Joi.string().max(160).required()
            }),
            otherwise: Joi.when('type', {
              is: 'whatsapp',
              then: Joi.object({
                phone: Joi.string().pattern(/^\+[\d\s\-\(\)]+$/).required(),
                message: Joi.string().max(1000).optional()
              }),
              otherwise: Joi.when('type', {
                is: 'wifi',
                then: Joi.object({
                  ssid: Joi.string().max(32).required(),
                  password: Joi.string().max(64).optional(),
                  encryption: Joi.string().valid('WPA', 'WPA2', 'WEP', 'nopass').default('WPA'),
                  hidden: Joi.boolean().default(false)
                }),
                otherwise: Joi.when('type', {
                  is: 'vcard',
                  then: Joi.object({
                    name: Joi.string().max(100).required(),
                    company: Joi.string().max(100).optional(),
                    title: Joi.string().max(100).optional(),
                    phone: Joi.string().pattern(/^\+[\d\s\-\(\)]+$/).optional(),
                    email: Joi.string().email().optional(),
                    website: Joi.string().uri().optional(),
                    address: Joi.string().max(200).optional(),
                    photo: Joi.string().optional() // Base64 image data
                  }),
                  otherwise: Joi.when('type', {
                    is: 'map',
                    then: Joi.object({
                      latitude: Joi.number().min(-90).max(90).required(),
                      longitude: Joi.number().min(-180).max(180).required(),
                      address: Joi.string().max(200).optional(),
                      title: Joi.string().max(100).optional()
                    }),
                    otherwise: Joi.when('type', {
                      is: Joi.string().valid('instagram', 'twitter', 'tiktok'),
                      then: Joi.object({
                        username: Joi.string().pattern(/^@?[a-zA-Z0-9_.]+$/).required()
                      }),
                      otherwise: Joi.when('type', {
                        is: Joi.string().valid('facebook', 'youtube', 'linkedin'),
                        then: Joi.object({
                          url: Joi.string().uri().required()
                        }),
                        otherwise: Joi.when('type', {
                          is: 'multi-link',
                          then: Joi.object({
                            title: Joi.string().min(1).max(100).required(),
                            description: Joi.string().max(500).optional(),
                            theme: Joi.object({
                              primaryColor: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).optional(),
                              backgroundColor: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).optional(),
                              textColor: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).optional(),
                              fontFamily: Joi.string().valid('inter', 'roboto', 'opensans', 'montserrat').optional(),
                              layout: Joi.string().valid('grid', 'list').default('grid')
                            }).optional(),
                            links: Joi.array().items(
                              Joi.object({
                                title: Joi.string().min(1).max(100).required(),
                                url: Joi.string().uri().required(),
                                description: Joi.string().max(200).optional(),
                                icon: Joi.string().optional(),
                                order: Joi.number().integer().min(0).optional()
                              })
                            ).min(1).max(50).required()
                          }),
                          otherwise: Joi.when('type', {
                            is: 'google-review',
                            then: Joi.object({
                              placeId: Joi.string().pattern(/^ChI[a-zA-Z0-9_-]+$/).required(),
                              placeName: Joi.string().max(100).optional(),
                              address: Joi.string().max(200).optional()
                            }),
                            otherwise: Joi.when('type', {
                              is: 'digital-menu',
                              then: Joi.object({
                                title: Joi.string().min(1).max(100).required(),
                                description: Joi.string().max(500).optional(),
                                currency: Joi.string().length(3).default('TRY'),
                                categories: Joi.array().items(
                                  Joi.string().max(50)
                                ).optional(),
                                itemCount: Joi.number().integer().min(1).max(200).required()
                              }),
                              otherwise: Joi.when('type', {
                                is: 'coupon',
                                then: Joi.object({
                                  title: Joi.string().min(1).max(100).required(),
                                  description: Joi.string().max(500).optional(),
                                  discountType: Joi.string().valid('percentage', 'fixed').default('percentage'),
                                  discountValue: Joi.number().min(0).max(1000000).required(),
                                  minAmount: Joi.number().min(0).optional(),
                                  maxDiscount: Joi.number().min(0).optional(),
                                  usageLimit: Joi.number().integer().min(1).optional(),
                                  usagePerUser: Joi.number().integer().min(1).optional(),
                                  validFrom: Joi.date().optional(),
                                  validUntil: Joi.date().min(Joi.ref('validFrom')).optional()
                                }),
                                otherwise: Joi.when('type', {
                                  is: 'calendar',
                                  then: Joi.object({
                                    title: Joi.string().min(1).max(100).required(),
                                    description: Joi.string().max(500).optional(),
                                    location: Joi.string().max(200).optional(),
                                    startTime: Joi.date().required(),
                                    endTime: Joi.date().min(Joi.ref('startTime')).required(),
                                    isAllDay: Joi.boolean().default(false),
                                    timezone: Joi.string().default('Europe/Istanbul'),
                                    reminder: Joi.string().pattern(/^\d+[smhd]$/).optional(),
                                    attendees: Joi.array().items(
                                      Joi.string().email()
                                    ).max(50).optional()
                                  }),
                                  otherwise: Joi.when('type', {
                                    is: 'review-platform',
                                    then: Joi.object({
                                      platform: Joi.string().valid('yelp', 'tripadvisor', 'google', 'facebook').required(),
                                      businessId: Joi.string().required(),
                                      businessName: Joi.string().min(1).max(100).required(),
                                      location: Joi.string().max(200).optional(),
                                      rating: Joi.number().min(0).max(5).optional(),
                                      reviewCount: Joi.number().integer().min(0).optional()
                                    }),
                                    otherwise: Joi.object() // For other types, accept any content structure
                                  })
                                })
                              })
                            })
                          })
                        })
                      })
                    })
                  })
                })
              })
            })
          })
        })
      })
    })
  }).optional(),
  
  settings: Joi.object({
    size: Joi.number().integer().min(100).max(1000).default(300),
    color: Joi.object({
      dark: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).default('#000000'),
      light: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).default('#FFFFFF')
    }).optional(),
    errorCorrectionLevel: Joi.string().valid('L', 'M', 'Q', 'H').default('M'),
    margin: Joi.number().integer().min(0).max(20).default(4)
  }).optional(),
  
  customCode: Joi.string()
    .pattern(/^[a-zA-Z0-9-]+$/)
    .min(3)
    .max(20)
    .optional()
    .messages({
      'string.pattern.base': 'Custom code must contain only letters, numbers, and hyphens',
      'string.min': 'Custom code must be at least 3 characters long',
      'string.max': 'Custom code must not exceed 20 characters',
    }),
  
  expiresAt: Joi.date().iso().optional().messages({
    'date.format': 'Expiration date must be a valid ISO date',
  }),
  
  // Legacy support for old URL-based QR codes
  destinationUrl: Joi.string().uri().optional()
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
