import { Request, Response, NextFunction } from 'express';
export declare const rateLimiter: (maxRequests?: number, windowMs?: number) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const qrRateLimiter: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const authRateLimiter: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const analyticsRateLimiter: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const redirectRateLimiter: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=rateLimit.d.ts.map