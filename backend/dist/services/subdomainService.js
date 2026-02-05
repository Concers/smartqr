"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubdomainService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class SubdomainService {
    constructor() {
        this.SUBDOMAIN_PREFIX = 'user-';
        this.SUBDOMAIN_LENGTH = 10;
        this.MAX_ATTEMPTS = 100;
    }
    normalizeRequestedSubdomain(input) {
        return (input || '').trim().toLowerCase();
    }
    isValidRequestedSubdomainFormat(subdomain) {
        if (!subdomain)
            return false;
        if (subdomain.length < 3 || subdomain.length > 30)
            return false;
        if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(subdomain))
            return false;
        if (subdomain.includes('--'))
            return false;
        return true;
    }
    isReservedSubdomain(subdomain) {
        const reserved = new Set(['www', 'netqr', 'admin', 'api']);
        return reserved.has(subdomain);
    }
    generateSubdomainFromUserId(userId) {
        const shortId = userId.slice(0, 8).toLowerCase();
        return shortId;
    }
    async isSubdomainAvailable(subdomain) {
        try {
            const existingUser = await prisma.user.findUnique({
                where: { subdomain }
            });
            return !existingUser;
        }
        catch (error) {
            console.error('Error checking subdomain availability:', error);
            throw new Error('Failed to check subdomain availability');
        }
    }
    async assignRequestedSubdomainToUser(userId, requestedSubdomain) {
        const subdomain = this.normalizeRequestedSubdomain(requestedSubdomain);
        if (!this.isValidRequestedSubdomainFormat(subdomain)) {
            throw new Error('Invalid subdomain format');
        }
        if (this.isReservedSubdomain(subdomain)) {
            throw new Error('Subdomain is reserved');
        }
        const available = await this.isSubdomainAvailable(subdomain);
        if (!available) {
            throw new Error('Subdomain is already in use');
        }
        await this.updateSubdomainHistory(userId);
        await prisma.user.update({
            where: { id: userId },
            data: { subdomain },
        });
        console.log(`✅ Requested subdomain assigned: ${subdomain} for user: ${userId}`);
        return subdomain;
    }
    async assignSubdomainToUser(userId) {
        try {
            const subdomain = this.generateSubdomainFromUserId(userId);
            await prisma.user.update({
                where: { id: userId },
                data: { subdomain }
            });
            console.log(`✅ ID-based subdomain assigned: ${subdomain} for user: ${userId}`);
            return subdomain;
        }
        catch (error) {
            console.error('Failed to assign subdomain:', error);
            throw new Error('Unable to assign subdomain');
        }
    }
    async updateSubdomainHistory(userId) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { subdomain: true, subdomainHistory: true }
            });
            if (user?.subdomain) {
                const history = user.subdomainHistory || [];
                history.push({
                    subdomain: user.subdomain,
                    changed_at: new Date().toISOString()
                });
                await prisma.user.update({
                    where: { id: userId },
                    data: { subdomainHistory: history }
                });
                console.log(`📝 Subdomain history updated for user: ${userId}`);
            }
        }
        catch (error) {
            console.error('Error updating subdomain history:', error);
            throw new Error('Failed to update subdomain history');
        }
    }
    async getSubdomainHistory(userId) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { subdomainHistory: true }
            });
            return user?.subdomainHistory || [];
        }
        catch (error) {
            console.error('Error getting subdomain history:', error);
            return [];
        }
    }
    async getUserSubdomain(userId) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { subdomain: true }
            });
            return user?.subdomain || null;
        }
        catch (error) {
            console.error('Error getting user subdomain:', error);
            return null;
        }
    }
    async assignSubdomainOnRegistration(userId) {
        try {
            console.log(`🔧 Assigning subdomain for new user: ${userId}`);
            const subdomain = await this.assignSubdomainToUser(userId);
            return subdomain;
        }
        catch (error) {
            console.error('Error assigning subdomain on registration:', error);
            throw new Error('Failed to assign subdomain during registration');
        }
    }
    isValidSubdomainFormat(subdomain) {
        const pattern = /^user-[a-z0-9]{10}$/;
        return pattern.test(subdomain);
    }
    async assignSubdomainsToExistingUsers() {
        try {
            const usersWithoutSubdomain = await prisma.user.findMany({
                where: { subdomain: null },
                select: { id: true, email: true }
            });
            console.log(`🔄 Found ${usersWithoutSubdomain.length} users without subdomain`);
            for (const user of usersWithoutSubdomain) {
                try {
                    await this.assignSubdomainToUser(user.id);
                    console.log(`✅ Assigned subdomain to user: ${user.email}`);
                }
                catch (error) {
                    console.error(`❌ Failed to assign subdomain to user: ${user.email}`, error);
                }
            }
            console.log('🎉 Subdomain assignment completed');
        }
        catch (error) {
            console.error('Error in bulk subdomain assignment:', error);
        }
    }
}
exports.SubdomainService = SubdomainService;
exports.default = SubdomainService;
//# sourceMappingURL=subdomainService.js.map