"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QRGenerator = void 0;
const qrcode_1 = __importDefault(require("qrcode"));
const sharp_1 = __importDefault(require("sharp"));
const app_1 = require("@/config/app");
class QRGenerator {
    static async generateQRCode(url, options = {}) {
        const { size = 300, margin = 4, color = { dark: '#000000', light: '#FFFFFF' }, errorCorrectionLevel = 'M', } = options;
        try {
            const qrBuffer = await qrcode_1.default.toBuffer(url, {
                width: size,
                margin,
                color,
                errorCorrectionLevel,
            });
            const processedBuffer = await (0, sharp_1.default)(qrBuffer)
                .png()
                .toBuffer();
            return processedBuffer;
        }
        catch (error) {
            console.error('Error generating QR code:', error);
            throw new Error('Failed to generate QR code');
        }
    }
    static async generateQRCodePngBuffer(url, options) {
        return this.generateQRCode(url, options);
    }
    static async generateQRCodeBase64(url, options) {
        try {
            const buffer = await this.generateQRCode(url, options);
            return `data:image/png;base64,${buffer.toString('base64')}`;
        }
        catch (error) {
            console.error('Error generating QR code base64:', error);
            throw new Error('Failed to generate QR code base64');
        }
    }
    static async generateQRCodeWithLogo(url, logoPath, options) {
        const { logoSize = 60 } = options || {};
        try {
            const qrBuffer = await this.generateQRCode(url, options);
            if (!logoPath) {
                return qrBuffer;
            }
            const qrImage = (0, sharp_1.default)(qrBuffer);
            const { width } = await qrImage.metadata();
            if (!width) {
                throw new Error('Could not get QR code dimensions');
            }
            const logoBuffer = await (0, sharp_1.default)(logoPath)
                .resize(logoSize, logoSize)
                .png()
                .toBuffer();
            const compositeImage = await qrImage
                .composite([{
                    input: logoBuffer,
                    left: Math.round((width - logoSize) / 2),
                    top: Math.round((width - logoSize) / 2),
                }])
                .png()
                .toBuffer();
            return compositeImage;
        }
        catch (error) {
            console.error('Error generating QR code with logo:', error);
            throw new Error('Failed to generate QR code with logo');
        }
    }
    static validateUrl(url) {
        try {
            new URL(url);
            return true;
        }
        catch {
            return false;
        }
    }
    static buildShortUrl(shortCode) {
        return `${app_1.config.qr.baseUrl}/${shortCode}`;
    }
    static buildShortUrlForUser(shortCode, username) {
        const u = (username || '').trim().toLowerCase();
        if (u && app_1.config.qr.rootDomain) {
            return `${app_1.config.qr.protocol}://${u}.${app_1.config.qr.rootDomain}/${shortCode}`;
        }
        return this.buildShortUrl(shortCode);
    }
}
exports.QRGenerator = QRGenerator;
//# sourceMappingURL=qrGenerator.js.map