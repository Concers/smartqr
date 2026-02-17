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
      ? await prisma.user.findUnique({ where: { id: userId }, select: { subdomain: true } })
      : null;
    
    // Use user's current subdomain (ID-based or custom)
    const userSubdomain = user?.subdomain || 'default';

    // Generate QR content based on type
    const qrContent = this.generateQRContent(data.type, data.content, data.settings);

    const qrCode = await prisma.qrCode.create({
      data: {
        shortCode,
        type: data.type || 'url',
        originalUrl: data.type === 'url' ? (data.content?.url || data.destinationUrl) : null,
        content: data.content || {},
        settings: data.settings || {},
        userId,
        lockedSubdomain: userSubdomain,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        // For backward compatibility, keep destinations for URL type
        ...(data.type === 'url' && {
          destinations: {
            create: {
              destinationUrl: data.content?.url || data.destinationUrl,
              expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
            },
          },
        }),
        // Create multi-link for multi-link type
        ...(data.type === 'multi-link' && {
          multiLink: {
            create: {
              title: data.content?.title || 'My Links',
              description: data.content?.description,
              theme: data.content?.theme || {},
              userId,
              links: {
                create: (data.content?.links || []).map((link: any, index: number) => ({
                  title: link.title,
                  url: link.url,
                  description: link.description,
                  icon: link.icon,
                  order: link.order ?? index
                }))
              }
            }
          }
        }),
        // Create digital menu for digital-menu type
        ...(data.type === 'digital-menu' && {
          menu: {
            create: {
              title: data.content?.title || 'Menü',
              description: data.content?.description,
              currency: data.content?.currency || 'TRY',
              user: {
                connect: {
                  id: userId
                }
              }
            }
          }
        }),
        // Create coupon for coupon type
        ...(data.type === 'coupon' && {
          coupon: {
            create: {
              code: this.generateCouponCode(),
              title: data.content?.title || 'İndirim Kuponu',
              description: data.content?.description,
              discountType: data.content?.discountType || 'percentage',
              discountValue: data.content?.discountValue || 0,
              minAmount: data.content?.minAmount,
              maxDiscount: data.content?.maxDiscount,
              usageLimit: data.content?.usageLimit,
              usagePerUser: data.content?.usagePerUser,
              validFrom: data.content?.validFrom ? new Date(data.content.validFrom) : new Date(),
              validUntil: data.content?.validUntil ? new Date(data.content.validUntil) : null,
              user: {
                connect: {
                  id: userId
                }
              }
            }
          }
        }),
        // Create calendar for calendar type
        ...(data.type === 'calendar' && {
          calendar: {
            create: {
              title: data.content?.title || 'Etkinlik',
              description: data.content?.description,
              location: data.content?.location,
              startTime: new Date(data.content?.startTime),
              endTime: new Date(data.content?.endTime),
              isAllDay: data.content?.isAllDay || false,
              timezone: data.content?.timezone || 'Europe/Istanbul',
              reminder: data.content?.reminder,
              attendees: data.content?.attendees || [],
              user: {
                connect: {
                  id: userId
                }
              }
            }
          }
        }),
        // Create review platform for review-platform type
        ...(data.type === 'review-platform' && {
          reviewPlatform: {
            create: {
              platform: data.content?.platform,
              businessId: data.content?.businessId,
              businessName: data.content?.businessName,
              location: data.content?.location,
              rating: data.content?.rating,
              reviewCount: data.content?.reviewCount,
              user: {
                connect: {
                  id: userId
                }
              }
            }
          }
        }),
      },
    });

    const qrCodeUrl = `${config.qr.protocol}://${userSubdomain}.${config.qr.rootDomain}/${shortCode}`;

    // For non-URL types, encode content directly in QR
    const finalQRContent = this.shouldEncodeDirectly(data.type) ? qrContent : qrCodeUrl;

    const qrPng = await QRGenerator.generateQRCodePngBuffer(finalQRContent, data.settings);
    const stored = await storage.savePng({
      key: `qr/${shortCode}.png`,
      buffer: qrPng,
    });

    return {
      id: qrCode.id,
      shortCode,
      type: data.type || 'url',
      content: data.content || {},
      settings: data.settings || {},
      qrCodeUrl: this.shouldEncodeDirectly(data.type) ? qrContent : qrCodeUrl,
      qrCodeImageUrl: stored.publicUrl,
      destinationUrl: data.type === 'url' ? (data.content?.url || data.destinationUrl) : null,
      createdAt: qrCode.createdAt.toISOString(),
      expiresAt: data.expiresAt,
      isActive: qrCode.isActive,
      userId: qrCode.userId,
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
        qrCodeUrl: qr.lockedSubdomain 
          ? `${config.qr.protocol}://${qr.lockedSubdomain}.${config.qr.rootDomain}/${qr.shortCode}`
          : `${config.qr.baseUrl}/${qr.shortCode}`,
        qrCodeImageUrl: (qr as any).qrImageUrl || '',
        destinationUrl: qr.destinations[0]?.destinationUrl || '',
        createdAt: qr.createdAt.toISOString(),
        expiresAt: qr.destinations[0]?.expiresAt?.toISOString(),
        isActive: qr.isActive,
        clicks: qr._count.analytics,
        customSubdomain: qr.lockedSubdomain,
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
      qrCodeUrl: qrCode.lockedSubdomain 
        ? `${config.qr.protocol}://${qrCode.lockedSubdomain}.${config.qr.rootDomain}/${qrCode.shortCode}`
        : `${config.qr.baseUrl}/${qrCode.shortCode}`,
      qrCodeImage: '',
      destinationUrl: destination?.destinationUrl || '',
      createdAt: qrCode.createdAt.toISOString(),
      expiresAt: destination?.expiresAt?.toISOString(),
      isActive: qrCode.isActive,
      customSubdomain: qrCode.lockedSubdomain,
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
    const requestedSubdomain = parseRequestedUsernameFromHost(host);

    if (requestedSubdomain) {
      const qrCode = await prisma.qrCode.findUnique({
        where: { shortCode },
        select: { 
          lockedSubdomain: true,
          user: {
            select: {
              subdomain: true,
              subdomainHistory: true
            }
          }
        },
      });

      if (!qrCode?.lockedSubdomain) {
        return null;
      }

      // Check if requested subdomain matches current locked subdomain
      if (qrCode.lockedSubdomain === requestedSubdomain) {
        // Current subdomain - proceed normally
      } else {
        // Check if requested subdomain is in user's history
        const history = (qrCode.user?.subdomainHistory as any[]) || [];
        const isOldSubdomain = history.some((h: any) => h.subdomain === requestedSubdomain);
        
        if (isOldSubdomain || qrCode.lockedSubdomain === requestedSubdomain) {
          // Old subdomain - allow access (backward compatibility)
          console.log(`🔄 Old subdomain access: ${requestedSubdomain} -> current: ${qrCode.user?.subdomain}`);
        } else {
          // Not user's subdomain at all
          return null;
        }
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

  private static generateQRContent(type: string, content: any, settings?: any): string {
    switch (type) {
      case 'text':
        return content?.text || '';
      
      case 'email':
        const emailParts = [
          `mailto:${content?.to || ''}`,
          content?.subject ? `?subject=${encodeURIComponent(content.subject)}` : '',
          content?.body ? `&body=${encodeURIComponent(content.body)}` : '',
        ].join('');
        return emailParts;

      case 'phone':
        return `tel:${content?.phone || ''}`;

      case 'sms':
        const smsParts = [
          `smsto:${content?.phone || ''}`,
          content?.message ? `?body=${encodeURIComponent(content.message)}` : '',
        ].join('');
        return smsParts;

      case 'whatsapp':
        const phone = content?.phone?.replace(/[^\d]/g, '') || '';
        const message = content?.message ? encodeURIComponent(content.message) : '';
        return `https://wa.me/${phone}${message ? '?text=' + message : ''}`;

      case 'wifi':
        const wifiParts = [
          'WIFI:T:',
          content?.encryption || 'WPA',
          ';S:',
          content?.ssid || '',
          ';P:',
          content?.password || '',
          ';H:',
          content?.hidden ? 'true' : 'false',
          ';;'
        ];
        return wifiParts.join('');

      case 'vcard':
        return this.generateVCard(content);

      case 'map':
        return `geo:${content?.latitude || 0},${content?.longitude || 0}`;

      case 'instagram':
        return `https://instagram.com/${content?.username || ''}`;

      case 'facebook':
        return content?.url || '';

      case 'twitter':
        return `https://twitter.com/${content?.username || ''}`;

      case 'youtube':
        return content?.url || '';

      case 'linkedin':
        return content?.url || '';

      case 'tiktok':
        return `https://tiktok.com/@${content?.username || ''}`;

      case 'multi-link':
        return content?.url || '';

      case 'google-review':
        return `https://search.google.com/local/writereview?placeid=${content?.placeId || ''}`;

      case 'digital-menu':
        return content?.url || '';

      case 'coupon':
        return content?.url || '';

      case 'calendar':
        return this.generateICSContent(content);

      case 'review-platform':
        return this.generateReviewPlatformURL(content);

      default:
        return content?.url || '';
    }
  }

  private static generateVCard(content: any): string {
    const vcard = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${content?.name || ''}`,
      `ORG:${content?.company || ''}`,
      `TITLE:${content?.title || ''}`,
      `TEL:${content?.phone || ''}`,
      `EMAIL:${content?.email || ''}`,
      `URL:${content?.website || ''}`,
      `ADR:;;${content?.address || ''};;;;`,
      'END:VCARD'
    ];
    return vcard.join('\n');
  }

  private static generateCouponCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private static generateICSContent(content: any): string {
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    };

    const now = new Date();
    const startTime = new Date(content?.startTime || now);
    const endTime = new Date(content?.endTime || new Date(now.getTime() + 60 * 60 * 1000));

    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//SmartQR//Calendar Event//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${Date.now()}-calendar@smartqr.io`,
      `DTSTART:${formatDate(startTime)}`,
      `DTEND:${formatDate(endTime)}`,
      `DTSTAMP:${formatDate(now)}`,
      `SUMMARY:${content?.title || 'Event'}`,
      `DESCRIPTION:${content?.description || ''}`,
      `LOCATION:${content?.location || ''}`,
      'STATUS:CONFIRMED'
    ];

    if (content?.attendees && content.attendees.length > 0) {
      content.attendees.forEach((email: string) => {
        ics.push(`ATTENDEE:mailto:${email}`);
      });
    }

    if (content?.reminder) {
      ics.push('BEGIN:VALARM');
      ics.push('ACTION:DISPLAY');
      ics.push('DESCRIPTION:Reminder');
      ics.push(`TRIGGER:-${content.reminder}`);
      ics.push('END:VALARM');
    }

    ics.push('END:VEVENT');
    ics.push('END:VCALENDAR');

    return ics.join('\r\n');
  }

  private static generateReviewPlatformURL(content: any): string {
    const platform = content?.platform?.toLowerCase();
    const businessId = content?.businessId;

    switch (platform) {
      case 'yelp':
        return `https://www.yelp.com/writeareview?bizid=${businessId}`;
      
      case 'tripadvisor':
        return `https://www.tripadvisor.com/UserReview-g${businessId}`;
      
      case 'google':
        return `https://search.google.com/local/writereview?placeid=${businessId}`;
      
      case 'facebook':
        return `https://www.facebook.com/${businessId}/reviews`;
      
      default:
        return content?.url || '';
    }
  }

  private static shouldEncodeDirectly(type: string): boolean {
    return ['wifi', 'vcard', 'email', 'phone', 'sms', 'whatsapp', 'map', 'text', 'calendar'].includes(type);
  }
}
