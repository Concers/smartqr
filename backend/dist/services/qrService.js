"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QRService = void 0;
const database_1 = __importDefault(require("@/config/database"));
const shortCodeGenerator_1 = require("@/utils/shortCodeGenerator");
const qrGenerator_1 = require("@/utils/qrGenerator");
const storageService_1 = require("@/services/storageService");
const app_1 = require("@/config/app");
const deriveUsernameFromEmail = (email) => {
    const local = (email || '').split('@')[0] || '';
    const normalized = local
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 30);
    return normalized;
};
const generateRandomSubdomain = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};
const parseRequestedUsernameFromHost = (host) => {
    const h = (host || '').toLowerCase();
    const root = (app_1.config.qr.rootDomain || '').toLowerCase();
    if (!h || !root)
        return '';
    if (h === root)
        return '';
    if (!h.endsWith(`.${root}`))
        return '';
    const sub = h.slice(0, -1 * (`.${root}`.length));
    if (!sub)
        return '';
    const first = sub.split('.')[0] || '';
    return first;
};
class QRService {
    static async createQRCode(data, userId) {
        const shortCode = await shortCodeGenerator_1.ShortCodeGenerator.generate(data.customCode);
        const user = userId
            ? await database_1.default.user.findUnique({ where: { id: userId }, select: { subdomain: true } })
            : null;
        const userSubdomain = user?.subdomain || 'default';
        const qrCode = await database_1.default.qrCode.create({
            data: {
                shortCode,
                originalUrl: data.destinationUrl,
                userId,
                lockedSubdomain: userSubdomain,
                destinations: {
                    create: {
                        destinationUrl: data.destinationUrl,
                        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
                    },
                },
            },
        });
        const qrCodeUrl = `${app_1.config.qr.protocol}://${userSubdomain}.${app_1.config.qr.rootDomain}/${shortCode}`;
        const qrPng = await qrGenerator_1.QRGenerator.generateQRCodePngBuffer(qrCodeUrl);
        const stored = await storageService_1.storage.savePng({
            key: `qr/${shortCode}.png`,
            buffer: qrPng,
        });
        await database_1.default.qrCode.update({
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
            customSubdomain: userSubdomain,
        };
    }
    static async getQRCodesByUser(userId, page = 1, limit = 10, search) {
        const skip = (page - 1) * limit;
        const where = {
            userId,
            ...(search && {
                OR: [
                    { shortCode: { contains: search, mode: 'insensitive' } },
                    { originalUrl: { contains: search, mode: 'insensitive' } },
                ],
            }),
        };
        const [qrCodes, total] = await Promise.all([
            database_1.default.qrCode.findMany({
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
            database_1.default.qrCode.count({ where }),
        ]);
        return {
            qrCodes: qrCodes.map((qr) => ({
                id: qr.id,
                shortCode: qr.shortCode,
                qrCodeUrl: qr.lockedSubdomain
                    ? `${app_1.config.qr.protocol}://${qr.lockedSubdomain}.${app_1.config.qr.rootDomain}/${qr.shortCode}`
                    : `${app_1.config.qr.baseUrl}/${qr.shortCode}`,
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
    static async getQRCodeById(id, userId) {
        const qrCode = await database_1.default.qrCode.findFirst({
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
        if (!qrCode)
            return null;
        const destination = qrCode.destinations[0];
        return {
            id: qrCode.id,
            shortCode: qrCode.shortCode,
            qrCodeUrl: qrCode.lockedSubdomain
                ? `${app_1.config.qr.protocol}://${qrCode.lockedSubdomain}.${app_1.config.qr.rootDomain}/${qrCode.shortCode}`
                : `${app_1.config.qr.baseUrl}/${qrCode.shortCode}`,
            qrCodeImage: '',
            destinationUrl: destination?.destinationUrl || '',
            createdAt: qrCode.createdAt.toISOString(),
            expiresAt: destination?.expiresAt?.toISOString(),
            isActive: qrCode.isActive,
            customSubdomain: qrCode.lockedSubdomain,
        };
    }
    static async updateDestination(qrCodeId, data, userId) {
        const qrCode = await database_1.default.qrCode.findFirst({
            where: {
                id: qrCodeId,
                ...(userId && { userId }),
            },
        });
        if (!qrCode) {
            throw new Error('QR code not found');
        }
        await database_1.default.urlDestination.updateMany({
            where: { qrCodeId, isActive: true },
            data: { isActive: false },
        });
        await database_1.default.urlDestination.create({
            data: {
                qrCodeId,
                destinationUrl: data.destinationUrl,
                activeFrom: data.activeFrom ? new Date(data.activeFrom) : new Date(),
                expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
            },
        });
        if (data.isActive !== undefined) {
            await database_1.default.qrCode.update({
                where: { id: qrCodeId },
                data: { isActive: data.isActive },
            });
        }
    }
    static async deleteQRCode(id, userId) {
        const qrCode = await database_1.default.qrCode.findFirst({
            where: {
                id,
                ...(userId && { userId }),
            },
        });
        if (!qrCode) {
            throw new Error('QR code not found');
        }
        await database_1.default.qrCode.delete({ where: { id: qrCode.id } });
    }
    static async toggleQRCodeStatus(id, userId) {
        const qrCode = await database_1.default.qrCode.findFirst({
            where: {
                id,
                ...(userId && { userId }),
            },
        });
        if (!qrCode) {
            throw new Error('QR code not found');
        }
        const updated = await database_1.default.qrCode.update({
            where: { id: qrCode.id },
            data: { isActive: !qrCode.isActive },
        });
        return updated.isActive;
    }
    static async getDestinationByShortCode(shortCode, host) {
        const requestedSubdomain = parseRequestedUsernameFromHost(host);
        if (requestedSubdomain) {
            const qrCode = await database_1.default.qrCode.findUnique({
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
            if (qrCode.lockedSubdomain === requestedSubdomain) {
            }
            else {
                const history = qrCode.user?.subdomainHistory || [];
                const isOldSubdomain = history.some((h) => h.subdomain === requestedSubdomain);
                if (isOldSubdomain || qrCode.lockedSubdomain === requestedSubdomain) {
                    console.log(`🔄 Old subdomain access: ${requestedSubdomain} -> current: ${qrCode.user?.subdomain}`);
                }
                else {
                    return null;
                }
            }
        }
        const destination = await database_1.default.urlDestination.findFirst({
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
    static async resolveShortCode(shortCode) {
        const qr = await database_1.default.qrCode.findUnique({
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
exports.QRService = QRService;
//# sourceMappingURL=qrService.js.map