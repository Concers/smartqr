import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { generateToken } from '@/middleware/auth';
import { config } from '@/config/app';
import { validateUserRegistration, validateUserLogin } from '@/middleware/validation';
import { authRateLimiter } from '@/middleware/rateLimit';
import prisma from '@/config/database';

const router = Router();

// Register new user
router.post('/register',
  authRateLimiter,
  validateUserRegistration,
  async (req: any, res: any) => {
    try {
      const { email, password, name } = req.validated;

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'User already exists',
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, config.security.bcryptRounds);

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
        },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
        },
      });

      // Generate token
      const token = generateToken(user.id);

      res.status(201).json({
        success: true,
        data: {
          user,
          token,
        },
        message: 'User registered successfully',
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Registration failed',
      });
    }
  }
);

// Login user
router.post('/login',
  authRateLimiter,
  validateUserLogin,
  async (req: any, res: any) => {
    try {
      const { email, password } = req.validated;

      // Find user
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials',
        });
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials',
        });
      }

      // Generate token
      const token = generateToken(user.id);

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
          },
          token,
        },
        message: 'Login successful',
      });
    } catch (error: any) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Login failed',
      });
    }
  }
);

// Get current user profile
router.get('/profile',
  async (req: any, res: any) => {
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];

      if (!token) {
        return res.status(401).json({
          success: false,
          error: 'Access token required',
        });
      }

      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, config.jwt.secret) as any;
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
        },
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid token',
        });
      }

      res.json({
        success: true,
        data: { user },
      });
    } catch (error: any) {
      console.error('Profile error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get profile',
      });
    }
  }
);

export default router;
