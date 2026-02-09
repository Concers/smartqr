import { AnalyticsQuery, AnalyticsData } from '@/types';
export declare class AnalyticsService {
    static trackClick(qrCodeId: string, req: any): Promise<void>;
    static getAnalytics(qrCodeId: string, query: AnalyticsQuery): Promise<AnalyticsData>;
    private static getTotalClicks;
    private static getUniqueVisitors;
    private static getTopCountries;
    private static getDeviceBreakdown;
    static getOverallStats(userId?: string, qrId?: string): Promise<any>;
    static getDailyStats(userId?: string, qrId?: string): Promise<any>;
    static getHourlyStats(userId?: string, qrId?: string): Promise<any>;
    static getRecentClicks(userId?: string, qrId?: string, limit?: number): Promise<any>;
    private static extractDeviceType;
    private static extractBrowser;
    static getGeoStats(userId?: string, qrId?: string): Promise<any>;
    static getDeviceStats(userId?: string, qrId?: string): Promise<any>;
    static getBrowserStats(userId?: string, qrId?: string): Promise<any>;
    private static getBrowserBreakdown;
    static getRecentActivity(userId?: string, limit?: number): Promise<any>;
    static exportAnalytics(qrCodeId: string, format?: 'csv' | 'json'): Promise<string>;
}
//# sourceMappingURL=analyticsService.d.ts.map