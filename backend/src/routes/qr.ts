import { Router } from 'express';
import { QRController } from '@/controllers/qrController';
import { authenticateToken } from '@/middleware/auth';
import { requirePermission } from '@/middleware/subUserAuth';
import { 
  validateCreateQR, 
  validateUpdateDestination, 
  validateUUID, 
  validatePagination,
  validateAnalyticsQuery
} from '@/middleware/validation';
import { qrRateLimiter } from '@/middleware/rateLimit';

const router = Router();

// Protected QR code management routes
router.post('/',
  authenticateToken,
  requirePermission('qr_create'),
  qrRateLimiter,
  validateCreateQR,
  QRController.createQRCode
);

// Alias: POST /api/qr/generate
router.post('/generate',
  authenticateToken,
  requirePermission('qr_create'),
  qrRateLimiter,
  validateCreateQR,
  QRController.createQRCode
);

router.get('/',
  authenticateToken,
  requirePermission('qr_view'),
  qrRateLimiter,
  validatePagination,
  QRController.getQRCodes
);

// Alias: GET /api/qr/list
router.get('/list',
  authenticateToken,
  requirePermission('qr_view'),
  qrRateLimiter,
  validatePagination,
  QRController.getQRCodes
);

// Public resolve endpoint: check short code status without redirect
router.get('/resolve/:shortCode',
  QRController.resolveShortCode
);

router.get('/:id',
  authenticateToken,
  qrRateLimiter,
  validateUUID,
  QRController.getQRCodeById
);

router.put('/:id/destination',
  authenticateToken,
  qrRateLimiter,
  validateUUID,
  validateUpdateDestination,
  QRController.updateDestination
);

router.delete('/:id',
  authenticateToken,
  qrRateLimiter,
  validateUUID,
  QRController.deleteQRCode
);

router.patch('/:id/toggle',
  authenticateToken,
  qrRateLimiter,
  validateUUID,
  QRController.toggleQRCodeStatus
);

router.get('/:id/analytics',
  authenticateToken,
  qrRateLimiter,
  validateUUID,
  validateAnalyticsQuery,
  QRController.getQRCodeAnalytics
);

export default router;
