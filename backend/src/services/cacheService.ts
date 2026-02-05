import redisClient from '@/config/redis';
import { config } from '@/config/app';

export class CacheService {
  private static readonly QR_PREFIX = 'qr:';
  private static readonly DESTINATION_PREFIX = 'dest:';
  private static readonly ANALYTICS_PREFIX = 'analytics:';
  private static readonly DEFAULT_TTL = 3600; // 1 hour

  static async cacheDestination(shortCode: string, destinationUrl: string, ttl: number = this.DEFAULT_TTL): Promise<void> {
    try {
      const key = `${this.DESTINATION_PREFIX}${shortCode}`;
      await redisClient.setEx(key, ttl, destinationUrl);
    } catch (error) {
      console.error('Error caching destination:', error);
    }
  }

  static async getCachedDestination(shortCode: string): Promise<string | null> {
    try {
      const key = `${this.DESTINATION_PREFIX}${shortCode}`;
      const value = await redisClient.get(key);
      if (value == null) return null;
      return typeof value === 'string' ? value : value.toString('utf8');
    } catch (error) {
      console.error('Error getting cached destination:', error);
      return null;
    }
  }

  static async invalidateDestination(shortCode: string): Promise<void> {
    try {
      const key = `${this.DESTINATION_PREFIX}${shortCode}`;
      await redisClient.del(key);
    } catch (error) {
      console.error('Error invalidating destination cache:', error);
    }
  }

  static async cacheQRCode(qrCodeId: string, data: any, ttl: number = this.DEFAULT_TTL): Promise<void> {
    try {
      const key = `${this.QR_PREFIX}${qrCodeId}`;
      await redisClient.setEx(key, ttl, JSON.stringify(data));
    } catch (error) {
      console.error('Error caching QR code:', error);
    }
  }

  static async getCachedQRCode(qrCodeId: string): Promise<any | null> {
    try {
      const key = `${this.QR_PREFIX}${qrCodeId}`;
      const data = await redisClient.get(key);
      if (!data) return null;
      const text = typeof data === 'string' ? data : data.toString('utf8');
      return JSON.parse(text);
    } catch (error) {
      console.error('Error getting cached QR code:', error);
      return null;
    }
  }

  static async invalidateQRCode(qrCodeId: string): Promise<void> {
    try {
      const key = `${this.QR_PREFIX}${qrCodeId}`;
      await redisClient.del(key);
    } catch (error) {
      console.error('Error invalidating QR code cache:', error);
    }
  }

  static async cacheAnalytics(qrCodeId: string, data: any, ttl: number = this.DEFAULT_TTL): Promise<void> {
    try {
      const key = `${this.ANALYTICS_PREFIX}${qrCodeId}`;
      await redisClient.setEx(key, ttl, JSON.stringify(data));
    } catch (error) {
      console.error('Error caching analytics:', error);
    }
  }

  static async getCachedAnalytics(qrCodeId: string): Promise<any | null> {
    try {
      const key = `${this.ANALYTICS_PREFIX}${qrCodeId}`;
      const data = await redisClient.get(key);
      if (!data) return null;
      const text = typeof data === 'string' ? data : data.toString('utf8');
      return JSON.parse(text);
    } catch (error) {
      console.error('Error getting cached analytics:', error);
      return null;
    }
  }

  static async invalidateAnalytics(qrCodeId: string): Promise<void> {
    try {
      const key = `${this.ANALYTICS_PREFIX}${qrCodeId}`;
      await redisClient.del(key);
    } catch (error) {
      console.error('Error invalidating analytics cache:', error);
    }
  }

  static async incrementClickCount(qrCodeId: string): Promise<number> {
    try {
      const key = `${this.ANALYTICS_PREFIX}${qrCodeId}:clicks`;
      const count = await redisClient.incr(key);
      await redisClient.expire(key, this.DEFAULT_TTL);
      return Number(count);
    } catch (error) {
      console.error('Error incrementing click count:', error);
      return 0;
    }
  }

  static async getClickCount(qrCodeId: string): Promise<number> {
    try {
      const key = `${this.ANALYTICS_PREFIX}${qrCodeId}:clicks`;
      const count = await redisClient.get(key);
      if (!count) return 0;
      const text = typeof count === 'string' ? count : count.toString('utf8');
      return parseInt(text, 10);
    } catch (error) {
      console.error('Error getting click count:', error);
      return 0;
    }
  }

  static async setRateLimit(identifier: string, limit: number, windowMs: number): Promise<boolean> {
    try {
      const key = `rate_limit:${identifier}`;
      const current = await redisClient.incr(key);
      
      if (current === 1) {
        await redisClient.expire(key, Math.ceil(windowMs / 1000));
      }
      
      return Number(current) <= limit;
    } catch (error) {
      console.error('Error setting rate limit:', error);
      return true; // Allow request if Redis fails
    }
  }

  static async clearCache(): Promise<void> {
    try {
      const keys = await redisClient.keys('*');
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  static async getCacheStats(): Promise<any> {
    try {
      const info = await redisClient.info('memory');
      const keyspace = await redisClient.info('keyspace');
      
      return {
        memory: info,
        keyspace: keyspace,
      };
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return null;
    }
  }
}
