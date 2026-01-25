import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { config } from '@/config/app';
import { connectRedis, disconnectRedis } from '@/config/redis';
import { rateLimiter } from '@/middleware/rateLimit';
import { redirectRateLimiter } from '@/middleware/rateLimit';
import { validateShortCode } from '@/middleware/validation';
import { validateDomain } from '@/middleware/domainValidation';
import { requestTracking, redirectTracking } from '@/middleware/requestTracking';

import './types/express';

// Import routes
import qrRoutes from './routes/qr';
import authRoutes from './routes/auth';
import analyticsRoutes from './routes/analytics';
import uploadsRoutes from './routes/uploads';
import { QRController } from './controllers/qrController';

const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files (local storage)
app.use('/uploads', express.static(path.resolve(config.upload.uploadPath)));

// Request tracking
app.use(requestTracking);

// Logging middleware
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate limiting (applies to all routes except analytics)
app.use('/api/analytics', analyticsRoutes);
app.use(rateLimiter());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv,
  });
});

// API routes
app.use('/api/qr', qrRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/uploads', uploadsRoutes);

// QR code redirect endpoint (no /api prefix)
app.get(
  '/:shortCode',
  validateDomain,
  validateShortCode,
  redirectRateLimiter,
  redirectTracking,
  QRController.redirectQRCode
);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error handler:', err);
  
  res.status(err.status || 500).json({
    success: false,
    error: config.nodeEnv === 'production' ? 'Internal server error' : err.message,
    ...(config.nodeEnv === 'development' && { stack: err.stack }),
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await disconnectRedis();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await disconnectRedis();
  process.exit(0);
});

// Start server
const startServer = async (): Promise<void> => {
  try {
    // Connect to Redis
    await connectRedis();
    
    app.listen(config.port, () => {
      console.log(`🚀 Server running on port ${config.port}`);
      console.log(`📊 Environment: ${config.nodeEnv}`);
      console.log(`🔗 API URL: ${config.app.url}`);
      console.log(`🎯 QR Base URL: ${config.qr.baseUrl}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Start the server
if (require.main === module) {
  startServer();
}

export default app;
