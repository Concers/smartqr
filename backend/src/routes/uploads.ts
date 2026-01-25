import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { config } from '@/config/app';
import { authenticateToken } from '@/middleware/auth';

const router = Router();

const maxSize = 3 * 1024 * 1024;

const pdfStorage = multer.diskStorage({
  destination: async (_req, _file, cb) => {
    const dest = path.resolve(config.upload.uploadPath, 'pdf');
    fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: (_req, file, cb) => {
    const safeName = (file.originalname || 'file.pdf')
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/_+/g, '_');
    const ext = path.extname(safeName) || '.pdf';
    const base = path.basename(safeName, ext);
    const stamp = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    cb(null, `${base}-${stamp}${ext}`);
  },
});

const uploadPdf = multer({
  storage: pdfStorage,
  limits: { fileSize: maxSize },
  fileFilter: (_req, file, cb) => {
    const isPdf = file.mimetype === 'application/pdf' || (file.originalname || '').toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      cb(new Error('Only PDF files are allowed'));
      return;
    }
    cb(null, true);
  },
});

router.post('/pdf', authenticateToken, uploadPdf.single('file'), async (req, res) => {
  try {
    const file = (req as any).file as any;
    if (!file) {
      res.status(400).json({ success: false, error: 'File is required' });
      return;
    }

    const baseUrl = config.app.url.replace(/\/$/, '');
    const url = `${baseUrl}/uploads/pdf/${file.filename}`;

    res.json({
      success: true,
      data: { url },
    });
  } catch (e: any) {
    res.status(400).json({
      success: false,
      error: e?.message || 'Upload failed',
    });
  }
});

const imageStorage = multer.diskStorage({
  destination: async (_req, _file, cb) => {
    const dest = path.resolve(config.upload.uploadPath, 'images');
    fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: (_req, file, cb) => {
    const safeName = (file.originalname || 'image')
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/_+/g, '_');
    const ext = (path.extname(safeName) || '.jpg').toLowerCase();
    const base = path.basename(safeName, ext);
    const stamp = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    cb(null, `${base}-${stamp}${ext}`);
  },
});

const uploadImage = multer({
  storage: imageStorage,
  limits: { fileSize: maxSize },
  fileFilter: (_req, file, cb) => {
    const ok = ['image/png', 'image/jpeg', 'image/webp'].includes(file.mimetype);
    if (!ok) {
      cb(new Error('Only PNG/JPEG/WEBP images are allowed'));
      return;
    }
    cb(null, true);
  },
});

router.post('/image', authenticateToken, uploadImage.single('file'), async (req, res) => {
  try {
    const file = (req as any).file as any;
    if (!file) {
      res.status(400).json({ success: false, error: 'File is required' });
      return;
    }

    const baseUrl = config.app.url.replace(/\/$/, '');
    const url = `${baseUrl}/uploads/images/${file.filename}`;

    res.json({
      success: true,
      data: { url },
    });
  } catch (e: any) {
    res.status(400).json({
      success: false,
      error: e?.message || 'Upload failed',
    });
  }
});

export default router;
