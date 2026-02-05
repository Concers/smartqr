"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const multer_1 = __importDefault(require("multer"));
const app_1 = require("@/config/app");
const auth_1 = require("@/middleware/auth");
const router = (0, express_1.Router)();
const maxSize = 3 * 1024 * 1024;
const pdfStorage = multer_1.default.diskStorage({
    destination: async (_req, _file, cb) => {
        const dest = path_1.default.resolve(app_1.config.upload.uploadPath, 'pdf');
        fs_1.default.mkdirSync(dest, { recursive: true });
        cb(null, dest);
    },
    filename: (_req, file, cb) => {
        const safeName = (file.originalname || 'file.pdf')
            .replace(/[^a-zA-Z0-9._-]/g, '_')
            .replace(/_+/g, '_');
        const ext = path_1.default.extname(safeName) || '.pdf';
        const base = path_1.default.basename(safeName, ext);
        const stamp = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
        cb(null, `${base}-${stamp}${ext}`);
    },
});
const uploadPdf = (0, multer_1.default)({
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
router.post('/pdf', auth_1.authenticateToken, uploadPdf.single('file'), async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            res.status(400).json({ success: false, error: 'File is required' });
            return;
        }
        const baseUrl = app_1.config.app.url.replace(/\/$/, '');
        const url = `${baseUrl}/uploads/pdf/${file.filename}`;
        res.json({
            success: true,
            data: { url },
        });
    }
    catch (e) {
        res.status(400).json({
            success: false,
            error: e?.message || 'Upload failed',
        });
    }
});
const imageStorage = multer_1.default.diskStorage({
    destination: async (_req, _file, cb) => {
        const dest = path_1.default.resolve(app_1.config.upload.uploadPath, 'images');
        fs_1.default.mkdirSync(dest, { recursive: true });
        cb(null, dest);
    },
    filename: (_req, file, cb) => {
        const safeName = (file.originalname || 'image')
            .replace(/[^a-zA-Z0-9._-]/g, '_')
            .replace(/_+/g, '_');
        const ext = (path_1.default.extname(safeName) || '.jpg').toLowerCase();
        const base = path_1.default.basename(safeName, ext);
        const stamp = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
        cb(null, `${base}-${stamp}${ext}`);
    },
});
const uploadImage = (0, multer_1.default)({
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
router.post('/image', auth_1.authenticateToken, uploadImage.single('file'), async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            res.status(400).json({ success: false, error: 'File is required' });
            return;
        }
        const baseUrl = app_1.config.app.url.replace(/\/$/, '');
        const url = `${baseUrl}/uploads/images/${file.filename}`;
        res.json({
            success: true,
            data: { url },
        });
    }
    catch (e) {
        res.status(400).json({
            success: false,
            error: e?.message || 'Upload failed',
        });
    }
});
exports.default = router;
//# sourceMappingURL=uploads.js.map