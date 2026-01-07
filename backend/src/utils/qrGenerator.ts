import QRCode from 'qrcode';
import sharp from 'sharp';
import { config } from '@/config/app';

export class QRGenerator {
  static async generateQRCode(
    url: string,
    options: {
      size?: number;
      margin?: number;
      color?: {
        dark?: string;
        light?: string;
      };
      errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
    } = {}
  ): Promise<Buffer> {
    const {
      size = 300,
      margin = 4,
      color = { dark: '#000000', light: '#FFFFFF' },
      errorCorrectionLevel = 'M',
    } = options;

    try {
      // Generate QR code as buffer
      const qrBuffer = await QRCode.toBuffer(url, {
        width: size,
        margin,
        color,
        errorCorrectionLevel,
      });

      // Add logo or additional processing if needed
      const processedBuffer = await sharp(qrBuffer)
        .png()
        .toBuffer();

      return processedBuffer;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw new Error('Failed to generate QR code');
    }
  }

  static async generateQRCodePngBuffer(
    url: string,
    options?: {
      size?: number;
      margin?: number;
      color?: {
        dark?: string;
        light?: string;
      };
      errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
    }
  ): Promise<Buffer> {
    return this.generateQRCode(url, options);
  }

  static async generateQRCodeBase64(
    url: string,
    options?: {
      size?: number;
      margin?: number;
      color?: {
        dark?: string;
        light?: string;
      };
      errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
    }
  ): Promise<string> {
    try {
      const buffer = await this.generateQRCode(url, options);
      return `data:image/png;base64,${buffer.toString('base64')}`;
    } catch (error) {
      console.error('Error generating QR code base64:', error);
      throw new Error('Failed to generate QR code base64');
    }
  }

  static async generateQRCodeWithLogo(
    url: string,
    logoPath?: string,
    options?: {
      size?: number;
      margin?: number;
      color?: {
        dark?: string;
        light?: string;
      };
      logoSize?: number;
    }
  ): Promise<Buffer> {
    const { logoSize = 60 } = options || {};

    try {
      // Generate base QR code
      const qrBuffer = await this.generateQRCode(url, options);

      if (!logoPath) {
        return qrBuffer;
      }

      // Add logo to center
      const qrImage = sharp(qrBuffer);
      const { width } = await qrImage.metadata();

      if (!width) {
        throw new Error('Could not get QR code dimensions');
      }

      const logoBuffer = await sharp(logoPath)
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
    } catch (error) {
      console.error('Error generating QR code with logo:', error);
      throw new Error('Failed to generate QR code with logo');
    }
  }

  static validateUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  static buildShortUrl(shortCode: string): string {
    return `${config.qr.baseUrl}/${shortCode}`;
  }
}
