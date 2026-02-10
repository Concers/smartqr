import dotenv from 'dotenv';

dotenv.config();

const nodeEnv = process.env.NODE_ENV || 'development';
const appUrl = process.env.APP_URL || 'http://localhost:3000';
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
const qrRootDomain = nodeEnv === 'development' 
  ? 'localhost:3000' 
  : (process.env.QR_ROOT_DOMAIN || 'netqr.io');
const qrProtocol = process.env.QR_PROTOCOL || 'https';
const qrBaseUrl = nodeEnv === 'development'
  ? appUrl
  : (process.env.QR_BASE_URL || 'https://qr.smartqrmanager.com');

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv,
  
  database: {
    url: process.env.DATABASE_URL!,
  },
  
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  
  jwt: {
    secret: process.env.JWT_SECRET!,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  
  app: {
    url: appUrl,
    frontendUrl,
  },
  
  qr: {
    baseUrl: qrBaseUrl,
    rootDomain: qrRootDomain,
    protocol: qrProtocol,
    customDomainEnabled: process.env.QR_CUSTOM_DOMAIN_ENABLED === 'true',
    domainAliases: process.env.QR_DOMAIN_ALIASES?.split(',') || [],
  },
  
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  },
  
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
  },
  
  analytics: {
    enabled: process.env.ANALYTICS_ENABLED === 'true',
    geolocationApiKey: process.env.GEOLOCATION_API_KEY,
  },
  
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12'),
    sessionSecret: process.env.SESSION_SECRET!,
  },
  
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'), // 5MB
    uploadPath: process.env.UPLOAD_PATH || './uploads',
  },
  
  email: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    fromEmail: process.env.FROM_EMAIL || 'noreply@smartqr.com',
  },
};
