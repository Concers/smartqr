import prisma from '@/config/database';
import { ShortCodeGenerator } from '@/utils/shortCodeGenerator';
import { QRGenerator } from '@/utils/qrGenerator';
import { storage } from '@/services/storageService';

export class QRService {
  static async createQRCode(data: any, userId?: string): Promise<any> {
    const shortCode = await ShortCodeGenerator.generate(data.customCode);

    const qrCode = await prisma.qrCode.create({
      data: {
        shortCode,
        originalUrl: data.destinationUrl,
        userId,
        destinations: {
          create: {
            destinationUrl: data.destinationUrl,
            expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
          },
        },
      },
    });

    const qrCodeUrl = QRGenerator.buildShortUrl(shortCode);
    const qrPng = await QRGenerator.generateQRCodePngBuffer(qrCodeUrl);
    const stored = await storage.savePng({
      key: `qr/${shortCode}.png`,
      buffer: qrPng,
    });

    await prisma.qrCode.update({
      where: { id: qrCode.id },
      data: { qrImageUrl: stored.publicUrl },
    });

    return {
      id: qrCode.id,
      shortCode,
      qrCodeUrl,
      qrCodeImageUrl: stored.publicUrl,
      destinationUrl: data.destinationUrl,
      createdAt: qrCode.createdAt.toISOString(),
      expiresAt: data.expiresAt,
      isActive: qrCode.isActive,
    };
  }

  static async getQRCodesByUser(userId: string, page = 1, limit = 10, search?: string): Promise<any> {
    const skip = (page - 1) * limit;
    const where: any = {
      userId,
      ...(search && {
        OR: [
          { shortCode: { contains: search, mode: 'insensitive' as const } },
          { originalUrl: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [qrCodes, total] = await Promise.all([
      prisma.qrCode.findMany({
        where,
        include: {
          destinations: {
            where: { isActive: true },
            orderBy: { priority: 'desc' },
            take: 1,
          },
          _count: { select: { analytics: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.qrCode.count({ where }),
    ]);

    return {
      qrCodes: qrCodes.map((qr) => ({
        id: qr.id,
        shortCode: qr.shortCode,
        qrCodeUrl: QRGenerator.buildShortUrl(qr.shortCode),
        destinationUrl: qr.destinations[0]?.destinationUrl || '',
        createdAt: qr.createdAt.toISOString(),
        expiresAt: qr.destinations[0]?.expiresAt?.toISOString(),
        isActive: qr.isActive,
        clicks: qr._count.analytics,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async getQRCodeById(id: string, userId?: string): Promise<any | null> {
    const qrCode = await prisma.qrCode.findFirst({
      where: {
        id,
        ...(userId && { userId }),
      },
      include: {
        destinations: {
          where: {
            isActive: true,
            OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
          },
          orderBy: { priority: 'desc' },
          take: 1,
        },
      },
    });

    if (!qrCode) return null;

    const destination = qrCode.destinations[0];

    return {
      id: qrCode.id,
      shortCode: qrCode.shortCode,
      qrCodeUrl: QRGenerator.buildShortUrl(qrCode.shortCode),
      qrCodeImage: '',
      destinationUrl: destination?.destinationUrl || '',
      createdAt: qrCode.createdAt.toISOString(),
      expiresAt: destination?.expiresAt?.toISOString(),
      isActive: qrCode.isActive,
    };
  }

  static async updateDestination(qrCodeId: string, data: any, userId?: string): Promise<void> {
    const qrCode = await prisma.qrCode.findFirst({
      where: {
        id: qrCodeId,
        ...(userId && { userId }),
      },
    });

    if (!qrCode) {
      throw new Error('QR code not found');
    }

    await prisma.urlDestination.updateMany({
      where: { qrCodeId, isActive: true },
      data: { isActive: false },
    });

    await prisma.urlDestination.create({
      data: {
        qrCodeId,
        destinationUrl: data.destinationUrl,
        activeFrom: data.activeFrom ? new Date(data.activeFrom) : new Date(),
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      },
    });
  }

  static async deleteQRCode(id: string, userId?: string): Promise<void> {
    const qrCode = await prisma.qrCode.findFirst({
      where: {
        id,
        ...(userId && { userId }),
      },
    });

    if (!qrCode) {
      throw new Error('QR code not found');
    }

    await prisma.qrCode.delete({ where: { id: qrCode.id } });
  }

  static async toggleQRCodeStatus(id: string, userId?: string): Promise<boolean> {
    const qrCode = await prisma.qrCode.findFirst({
      where: {
        id,
        ...(userId && { userId }),
      },
    });

    if (!qrCode) {
      throw new Error('QR code not found');
    }

    const updated = await prisma.qrCode.update({
      where: { id: qrCode.id },
      data: { isActive: !qrCode.isActive },
    });

    return updated.isActive;
  }

  static async getDestinationByShortCode(shortCode: string): Promise<string | null> {
    const destination = await prisma.urlDestination.findFirst({
      where: {
        qrCode: {
          shortCode,
          isActive: true,
        },
        isActive: true,
        activeFrom: { lte: new Date() },
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      orderBy: { priority: 'desc' },
    });

    return destination?.destinationUrl || null;
  }
}
