import { Request, Response, NextFunction } from 'express';
import { validateSchema } from '@/utils/validators';
import { qrCodeSchema, updateDestinationSchema, userRegistrationSchema, userLoginSchema, analyticsQuerySchema } from '@/utils/validators';

export const validateCreateQR = validateSchema(qrCodeSchema);
export const validateUpdateDestination = validateSchema(updateDestinationSchema);
export const validateUserRegistration = validateSchema(userRegistrationSchema);
export const validateUserLogin = validateSchema(userLoginSchema);
export const validateAnalyticsQuery = validateSchema(analyticsQuerySchema);

export const validateShortCode = (req: Request, res: Response, next: NextFunction): void => {
  const { shortCode } = req.params;

  if (!shortCode || shortCode.length < 3 || shortCode.length > 20) {
    res.status(400).json({
      error: 'Invalid short code',
      message: 'Short code must be between 3 and 20 characters',
    });
    return;
  }

  // Only allow alphanumeric characters and hyphens
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

export const validateUUID = (req: Request, res: Response, next: NextFunction): void => {
  const { id } = req.params;

  // Allow UUIDs (36 chars) or CUIDs (usually 25 chars, alphanumeric)
  // Simple check: alphanumeric + hyphens, min length 20
  if (!id || !/^[a-zA-Z0-9-]{20,}$/.test(id)) {
    res.status(400).json({
      error: 'Invalid ID format',
      message: 'ID must be a valid UUID or CUID',
    });
    return;
  }

  next();
};

export const validatePagination = (req: Request, res: Response, next: NextFunction): void => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

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

export const validateURL = (req: Request, res: Response, next: NextFunction): void => {
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
  } catch {
    res.status(400).json({
      error: 'Invalid URL format',
      message: 'Please provide a valid URL',
    });
  }
};
