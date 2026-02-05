"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheService = void 0;
const redis_1 = __importDefault(require("@/config/redis"));
class CacheService {
    static async cacheDestination(shortCode, destinationUrl, ttl = this.DEFAULT_TTL) {
        try {
            const key = `${this.DESTINATION_PREFIX}${shortCode}`;
            await redis_1.default.setEx(key, ttl, destinationUrl);
        }
        catch (error) {
            console.error('Error caching destination:', error);
        }
    }
    static async getCachedDestination(shortCode) {
        try {
            const key = `${this.DESTINATION_PREFIX}${shortCode}`;
            const value = await redis_1.default.get(key);
            if (value == null)
                return null;
            return typeof value === 'string' ? value : value.toString('utf8');
        }
        catch (error) {
            console.error('Error getting cached destination:', error);
            return null;
        }
    }
    static async invalidateDestination(shortCode) {
        try {
            const key = `${this.DESTINATION_PREFIX}${shortCode}`;
            await redis_1.default.del(key);
        }
        catch (error) {
            console.error('Error invalidating destination cache:', error);
        }
    }
    static async cacheQRCode(qrCodeId, data, ttl = this.DEFAULT_TTL) {
        try {
            const key = `${this.QR_PREFIX}${qrCodeId}`;
            await redis_1.default.setEx(key, ttl, JSON.stringify(data));
        }
        catch (error) {
            console.error('Error caching QR code:', error);
        }
    }
    static async getCachedQRCode(qrCodeId) {
        try {
            const key = `${this.QR_PREFIX}${qrCodeId}`;
            const data = await redis_1.default.get(key);
            if (!data)
                return null;
            const text = typeof data === 'string' ? data : data.toString('utf8');
            return JSON.parse(text);
        }
        catch (error) {
            console.error('Error getting cached QR code:', error);
            return null;
        }
    }
    static async invalidateQRCode(qrCodeId) {
        try {
            const key = `${this.QR_PREFIX}${qrCodeId}`;
            await redis_1.default.del(key);
        }
        catch (error) {
            console.error('Error invalidating QR code cache:', error);
        }
    }
    static async cacheAnalytics(qrCodeId, data, ttl = this.DEFAULT_TTL) {
        try {
            const key = `${this.ANALYTICS_PREFIX}${qrCodeId}`;
            await redis_1.default.setEx(key, ttl, JSON.stringify(data));
        }
        catch (error) {
            console.error('Error caching analytics:', error);
        }
    }
    static async getCachedAnalytics(qrCodeId) {
        try {
            const key = `${this.ANALYTICS_PREFIX}${qrCodeId}`;
            const data = await redis_1.default.get(key);
            if (!data)
                return null;
            const text = typeof data === 'string' ? data : data.toString('utf8');
            return JSON.parse(text);
        }
        catch (error) {
            console.error('Error getting cached analytics:', error);
            return null;
        }
    }
    static async invalidateAnalytics(qrCodeId) {
        try {
            const key = `${this.ANALYTICS_PREFIX}${qrCodeId}`;
            await redis_1.default.del(key);
        }
        catch (error) {
            console.error('Error invalidating analytics cache:', error);
        }
    }
    static async incrementClickCount(qrCodeId) {
        try {
            const key = `${this.ANALYTICS_PREFIX}${qrCodeId}:clicks`;
            const count = await redis_1.default.incr(key);
            await redis_1.default.expire(key, this.DEFAULT_TTL);
            return Number(count);
        }
        catch (error) {
            console.error('Error incrementing click count:', error);
            return 0;
        }
    }
    static async getClickCount(qrCodeId) {
        try {
            const key = `${this.ANALYTICS_PREFIX}${qrCodeId}:clicks`;
            const count = await redis_1.default.get(key);
            if (!count)
                return 0;
            const text = typeof count === 'string' ? count : count.toString('utf8');
            return parseInt(text, 10);
        }
        catch (error) {
            console.error('Error getting click count:', error);
            return 0;
        }
    }
    static async setRateLimit(identifier, limit, windowMs) {
        try {
            const key = `rate_limit:${identifier}`;
            const current = await redis_1.default.incr(key);
            if (current === 1) {
                await redis_1.default.expire(key, Math.ceil(windowMs / 1000));
            }
            return Number(current) <= limit;
        }
        catch (error) {
            console.error('Error setting rate limit:', error);
            return true;
        }
    }
    static async clearCache() {
        try {
            const keys = await redis_1.default.keys('*');
            if (keys.length > 0) {
                await redis_1.default.del(keys);
            }
        }
        catch (error) {
            console.error('Error clearing cache:', error);
        }
    }
    static async getCacheStats() {
        try {
            const info = await redis_1.default.info('memory');
            const keyspace = await redis_1.default.info('keyspace');
            return {
                memory: info,
                keyspace: keyspace,
            };
        }
        catch (error) {
            console.error('Error getting cache stats:', error);
            return null;
        }
    }
}
exports.CacheService = CacheService;
CacheService.QR_PREFIX = 'qr:';
CacheService.DESTINATION_PREFIX = 'dest:';
CacheService.ANALYTICS_PREFIX = 'analytics:';
CacheService.DEFAULT_TTL = 3600;
//# sourceMappingURL=cacheService.js.map