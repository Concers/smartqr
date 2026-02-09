import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '@/config/app';
import { SubUserService, SubUserPermissions } from '@/services/subUserService';

declare global {
  namespace Express {
    interface Request {
      subUser?: any;
      parentUser?: any;
    }
  }
}

const subUserService = new SubUserService();

/**
 * Authenticate sub-user token
 */
export const authenticateSubUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret) as any;

    // Check if it's a sub-user token
    if (decoded.type !== 'subuser') {
      return res.status(401).json({ error: 'Invalid token type' });
    }

    // You could add additional validation here if needed
    req.subUser = decoded;
    next();
  } catch (error: any) {
    console.error('Sub-user authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    
    return res.status(500).json({ error: 'Authentication failed' });
  }
};

/**
 * Check if sub-user has specific permission
 */
export const requireSubUserPermission = (permission: keyof SubUserPermissions) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.subUser) {
      return res.status(401).json({ error: 'Sub-user authentication required' });
    }

    if (!subUserService.hasPermission(req.subUser, permission)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: permission,
      });
    }

    next();
  };
};

/**
 * Check if user is either parent user or sub-user with required permission
 */
export const requirePermission = (permission: keyof SubUserPermissions) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // If it's a regular user (parent), allow
    if (req.user && !req.subUser) {
      return next();
    }

    // If it's a sub-user, check permissions
    if (req.subUser) {
      if (!subUserService.hasPermission(req.subUser, permission)) {
        return res.status(403).json({ 
          error: 'Insufficient permissions',
          required: permission,
        });
      }
      return next();
    }

    return res.status(401).json({ error: 'Authentication required' });
  };
};

/**
 * Middleware to handle both regular users and sub-users
 */
export const authenticateAnyUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, config.jwt.secret) as any;

    if (decoded.type === 'subuser') {
      req.subUser = decoded;
    } else {
      req.user = decoded;
    }

    next();
  } catch (error: any) {
    console.error('Authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    
    return res.status(500).json({ error: 'Authentication failed' });
  }
};
