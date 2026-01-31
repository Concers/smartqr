import prisma from '@/config/database';
import { ShortCodeGenerator } from '@/utils/shortCodeGenerator';
import { QRGenerator } from '@/utils/qrGenerator';
import { storage } from '@/services/storageService';
import { config } from '@/config/app';
import { generateQRUrl } from '@/utils/urlGenerator';

const deriveUsernameFromEmail = (email?: string | null): string => {
  const local = (email || '').split('@')[0] || '';
  const normalized = local
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 30);
  return normalized;
};

const parseRequestedUsernameFromHost = (host?: string | null): string => {
  const h = (host || '').toLowerCase();
  const root = (config.qr.rootDomain || '').toLowerCase();
  if (!h || !root) return '';
  if (h === root) return '';
  if (!h.endsWith(`.${root}`)) return '';
  const sub = h.slice(0, -1 * (`.${root}`.length));
  if (!sub) return '';
  const first = sub.split('.')[0] || '';
  return first;
};

export class QRService {
  static async createQRCode(data: any, userId?: string): Promise<any> {
    const shortCode = await ShortCodeGenerator.generate(data.customCode);

    const user = userId
      ? await prisma.user.findUnique({ where: { id: userId } })
      : null;
    const username = deriveUsernameFromEmail(user?.email);

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

    const qrCodeUrl = QRGenerator.buildShortUrlForUser(shortCode, username);
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

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
    const username = deriveUsernameFromEmail(user?.email);

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
        qrCodeUrl: QRGenerator.buildShortUrlForUser(qr.shortCode, username),
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
        user: { select: { email: true } },
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

    const user = userId
      ? await prisma.user.findUnique({ where: { id: userId } })
      : null;

    const destination = qrCode.destinations[0];
    const username = deriveUsernameFromEmail(qrCode.user?.email);

    return {
      id: qrCode.id,
      shortCode: qrCode.shortCode,
      qrCodeUrl: QRGenerator.buildShortUrlForUser(qrCode.shortCode, username),
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

    if (data.isActive !== undefined) {
      await prisma.qrCode.update({
        where: { id: qrCodeId },
        data: { isActive: data.isActive },
      });
    }
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

  static async getDestinationByShortCode(shortCode: string, host?: string): Promise<string | null> {
    const requestedUsername = parseRequestedUsernameFromHost(host);

    if (requestedUsername) {
      const qrOwner = await prisma.qrCode.findUnique({
        where: { shortCode },
        select: { user: { select: { email: true } } },
      });

      const ownerUsername = deriveUsernameFromEmail(qrOwner?.user?.email);
      if (!ownerUsername || ownerUsername !== requestedUsername) {
        return null;
      }
    }

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

  static async resolveShortCode(shortCode: string): Promise<
    | { status: 'active'; destinationUrl: string }
    | { status: 'inactive' | 'not_found' }
  > {
    const qr = await prisma.qrCode.findUnique({
      where: { shortCode },
      select: { id: true, isActive: true },
    });

    if (!qr) {
      return { status: 'not_found' };
    }

    if (!qr.isActive) {
      return { status: 'inactive' };
    }

    const destinationUrl = await this.getDestinationByShortCode(shortCode);
    if (!destinationUrl) {
      return { status: 'inactive' };
    }

    return { status: 'active', destinationUrl };
  }
}
