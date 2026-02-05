import { Request, Response, NextFunction } from 'express';

export const requestTracking = (req: Request, res: Response, next: NextFunction): void => {
  // Basic request info
  (req as any).tracking = {
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.headers['user-agent'] || '',
    referer: req.headers.referer || req.headers.referrer || '',
    timestamp: new Date().toISOString(),
  };

  next();
};

export const redirectTracking = (req: Request, res: Response, next: NextFunction): void => {
  // Track only redirect-specific info
  (req as any).redirectTracking = {
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.headers['user-agent'] || '',
    shortCode: req.params.shortCode,
    timestamp: new Date().toISOString(),
  };

  next();
};
