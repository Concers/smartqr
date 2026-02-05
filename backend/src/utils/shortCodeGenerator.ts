import crypto from 'crypto';
import prisma from '@/config/database';

export class ShortCodeGenerator {
  private static readonly LENGTH = 6;
  private static readonly ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  private static readonly ATTEMPTS = 10;

  static async generate(customCode?: string): Promise<string> {
    if (customCode) {
      const exists = await prisma.qrCode.findUnique({
        where: { shortCode: customCode },
      });

      if (exists) {
        throw new Error('Custom code already exists');
      }

      if (!this.isValidCode(customCode)) {
        throw new Error('Invalid custom code format');
      }

      return customCode;
    }

    for (let attempt = 0; attempt < this.ATTEMPTS; attempt++) {
      const code = this.generateRandom();
      const exists = await prisma.qrCode.findUnique({
        where: { shortCode: code },
      });

      if (!exists) {
        return code;
      }
    }

    throw new Error('Failed to generate unique short code');
  }

  private static generateRandom(): string {
    let result = '';
    for (let i = 0; i < this.LENGTH; i++) {
      result += this.ALPHABET.charAt(
        crypto.randomInt(0, this.ALPHABET.length)
      );
    }
    return result;
  }

  static isValidCode(code: string): boolean {
    if (!code || code.length < 3 || code.length > 20) {
      return false;
    }

    // Only allow alphanumeric characters and hyphens
    const validPattern = /^[a-zA-Z0-9-]+$/;
    return validPattern.test(code);
  }

  static async isAvailable(code: string): Promise<boolean> {
    const exists = await prisma.qrCode.findUnique({
      where: { shortCode: code },
    });
    return !exists;
  }
}
