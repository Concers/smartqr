import type { RequestHandler } from 'express';
export declare const authenticateToken: RequestHandler;
export declare const optionalAuth: RequestHandler;
export declare const generateToken: (userId: string) => string;
export declare const verifyToken: (token: string) => any;
//# sourceMappingURL=auth.d.ts.map