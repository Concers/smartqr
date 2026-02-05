export declare class CacheService {
    private static readonly QR_PREFIX;
    private static readonly DESTINATION_PREFIX;
    private static readonly ANALYTICS_PREFIX;
    private static readonly DEFAULT_TTL;
    static cacheDestination(shortCode: string, destinationUrl: string, ttl?: number): Promise<void>;
    static getCachedDestination(shortCode: string): Promise<string | null>;
    static invalidateDestination(shortCode: string): Promise<void>;
    static cacheQRCode(qrCodeId: string, data: any, ttl?: number): Promise<void>;
    static getCachedQRCode(qrCodeId: string): Promise<any | null>;
    static invalidateQRCode(qrCodeId: string): Promise<void>;
    static cacheAnalytics(qrCodeId: string, data: any, ttl?: number): Promise<void>;
    static getCachedAnalytics(qrCodeId: string): Promise<any | null>;
    static invalidateAnalytics(qrCodeId: string): Promise<void>;
    static incrementClickCount(qrCodeId: string): Promise<number>;
    static getClickCount(qrCodeId: string): Promise<number>;
    static setRateLimit(identifier: string, limit: number, windowMs: number): Promise<boolean>;
    static clearCache(): Promise<void>;
    static getCacheStats(): Promise<any>;
}
//# sourceMappingURL=cacheService.d.ts.map