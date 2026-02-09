import { Request, Response } from 'express';
export declare class AnalyticsController {
    static getOverallStats(req: Request, res: Response): Promise<void>;
    static getDailyStats(req: Request, res: Response): Promise<void>;
    static getGeoStats(req: Request, res: Response): Promise<void>;
    static getDeviceStats(req: Request, res: Response): Promise<void>;
    static getBrowserStats(req: Request, res: Response): Promise<void>;
    static getHourlyStats(req: Request, res: Response): Promise<void>;
    static getRecentClicks(req: Request, res: Response): Promise<void>;
    static getQRCodeAnalytics(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=analyticsController.d.ts.map