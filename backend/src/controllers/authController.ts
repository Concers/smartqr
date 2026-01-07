import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '@/config/database';
import { config } from '@/config/app';
import { generateToken } from '@/middleware/auth';

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, name } = (req as any).validated || req.body;

      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        res.status(400).json({ success: false, error: 'User already exists' });
        return;
      }

      const hashedPassword = await bcrypt.hash(password, config.security.bcryptRounds);

      const user = await prisma.user.create({
        data: { email, password: hashedPassword, name },
        select: { id: true, email: true, name: true, createdAt: true },
      });

      const token = generateToken(user.id);

      res.status(201).json({ success: true, data: { user, token } });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Registration failed' });
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = (req as any).validated || req.body;

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        res.status(401).json({ success: false, error: 'Invalid credentials' });
        return;
      }

      const ok = await bcrypt.compare(password, user.password);
      if (!ok) {
        res.status(401).json({ success: false, error: 'Invalid credentials' });
        return;
      }

      const token = generateToken(user.id);

      res.json({
        success: true,
        data: { user: { id: user.id, email: user.email, name: user.name }, token },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Login failed' });
    }
  }
}
