import { Request, Response, NextFunction } from 'express';
import { config } from '@/config/app';
import { CacheService } from '@/services/cacheService';

export const rateLimiter = (maxRequests: number = config.rateLimit.maxRequests, windowMs: number = config.rateLimit.windowMs) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Skip rate limiting entirely in development
    if (config.nodeEnv === 'development') {
      return next();
    }

    try {
      const identifier = req.ip || req.connection.remoteAddress || 'unknown';
      
      const allowed = await CacheService.setRateLimit(identifier, maxRequests, windowMs);
      
      if (!allowed) {
        res.status(429).json({
          error: 'Too many requests',
          message: `Rate limit exceeded. Max ${maxRequests} requests per ${windowMs / 1000} seconds.`,
          retryAfter: Math.ceil(windowMs / 1000),
        });
        return;
      }

      // Add rate limit headers
      const remaining = await CacheService.getClickCount(`rate_limit:${identifier}`);
      res.set({
        'X-RateLimit-Limit': maxRequests.toString(),
        'X-RateLimit-Remaining': Math.max(0, maxRequests - remaining).toString(),
        'X-RateLimit-Reset': new Date(Date.now() + windowMs).toISOString(),
      });

      next();
    } catch (error) {
      console.error('Rate limiter error:', error);
      // Allow request if rate limiter fails
      next();
    }
  };
};

export const qrRateLimiter = config.nodeEnv === 'development'
  ? rateLimiter(300, 60000) // dev: 300 requests per minute
  : rateLimiter(10, 60000); // prod: 10 requests per minute
export const authRateLimiter = config.nodeEnv === 'development'
  ? rateLimiter(100, 60000) // dev: 100 requests per minute
  : rateLimiter(5, 900000); // prod: 5 requests per 15 minutes
export const analyticsRateLimiter = rateLimiter(100, 60000); // 100 requests per minute

export const redirectRateLimiter = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { shortCode } = req.params;
    const identifier = `redirect:${shortCode}:${req.ip}`;
    
    const allowed = await CacheService.setRateLimit(identifier, 30, 60000); // 30 redirects per minute per short code
    
    if (!allowed) {
      res.status(429).json({
        error: 'Too many redirects',
        message: 'This QR code has been accessed too frequently. Please try again later.',
      });
      return;
    }

    next();
  } catch (error) {
    console.error('Redirect rate limiter error:', error);
    next();
  }
};
