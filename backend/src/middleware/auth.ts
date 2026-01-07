import * as jwt from 'jsonwebtoken';
import type { RequestHandler } from 'express';
import { Request, Response, NextFunction } from 'express';
import { config } from '@/config/app';
import prisma from '@/config/database';

export const authenticateToken: RequestHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({ error: 'Access token required' });
      return;
    }

    const decoded = jwt.verify(token, config.jwt.secret) as any;
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name ?? null,
    };
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ error: 'Invalid token' });
    } else if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: 'Token expired' });
    } else {
      console.error('Auth middleware error:', error);
      res.status(500).json({ error: 'Authentication error' });
    }
  }
};

export const optionalAuth: RequestHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, config.jwt.secret) as any;
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          name: true,
        },
      });

      if (user) {
        req.user = {
          id: user.id,
          email: user.email,
          name: user.name ?? null,
        };
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
