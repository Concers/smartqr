import * as jwt from 'jsonwebtoken';
import type { RequestHandler } from 'express';
import { Request, Response, NextFunction } from 'express';
import { config } from '@/config/app';

type AuthErrorCode = 'AUTH_REQUIRED' | 'AUTH_INVALID' | 'AUTH_EXPIRED';

const sendAuthError = (res: Response, code: AuthErrorCode, message: string) => {
  res.status(401).json({
    success: false,
    error: {
      code,
      message,
    },
  });
};

const parseTokenPayload = (decoded: any) => {
  const isSubUser = decoded?.type === 'subuser' || !!decoded?.subUserId || !!decoded?.parentUserId;

  // Standardized user id: userId is always the parent/owner user id
  const userId = (decoded?.userId || decoded?.parentUserId) as string | undefined;
  const subUserId = (decoded?.subUserId || decoded?.id) as string | undefined;

  return {
    isSubUser,
    userId,
    subUserId,
    email: decoded?.email as string | undefined,
    permissions: decoded?.permissions,
  };
};

export const authenticateToken: RequestHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      sendAuthError(res, 'AUTH_REQUIRED', 'Access token required');
      return;
    }

    const decoded = jwt.verify(token, config.jwt.secret) as any;

    const payload = parseTokenPayload(decoded);
    if (typeof payload.userId !== 'string' || !payload.userId) {
      sendAuthError(res, 'AUTH_INVALID', 'Invalid token: missing userId');
      return;
    }

    if (payload.isSubUser) {
      (req as any).subUser = {
        userId: payload.userId,
        subUserId: payload.subUserId,
        email: payload.email,
        type: 'subuser',
        permissions: payload.permissions,
      };
    }

    // Unified request user: always the owner/parent user
    req.user = {
      id: payload.userId,
      email: payload.email,
      name: null,
      ...(payload.isSubUser
        ? {
            subUserId: payload.subUserId,
            type: 'subuser',
            permissions: payload.permissions,
          }
        : {
            type: 'user',
          }),
    } as any;

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      sendAuthError(res, 'AUTH_INVALID', 'Invalid token');
    } else if (error instanceof jwt.TokenExpiredError) {
      sendAuthError(res, 'AUTH_EXPIRED', 'Token expired');
    } else {
      console.error('Auth middleware error:', error);
      sendAuthError(res, 'AUTH_INVALID', 'Authentication failed');
    }
  }
};

export const optionalAuth: RequestHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, config.jwt.secret) as any;

      const payload = parseTokenPayload(decoded);
      if (typeof payload.userId === 'string' && payload.userId) {
        if (payload.isSubUser) {
          (req as any).subUser = {
            userId: payload.userId,
            subUserId: payload.subUserId,
            email: payload.email,
            type: 'subuser',
            permissions: payload.permissions,
          };
        }

        req.user = {
          id: payload.userId,
          email: payload.email,
          name: null,
          ...(payload.isSubUser
            ? {
                subUserId: payload.subUserId,
                type: 'subuser',
                permissions: payload.permissions,
              }
            : {
                type: 'user',
              }),
        } as any;
      }
    }

    next();
  } catch (error) {
    // Optional auth should not block requests
    next();
  }
};

export const generateToken = (userId: string): string => {
  const options: jwt.SignOptions = { expiresIn: config.jwt.expiresIn as any };
  return jwt.sign({ userId }, config.jwt.secret, options);
};

export const verifyToken = (token: string): any => {
  return jwt.verify(token, config.jwt.secret);
};
