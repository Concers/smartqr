import { Request, Response } from 'express';
export declare class QRController {
    static createQRCode(req: Request, res: Response): Promise<void>;
    static resolveShortCode(req: Request, res: Response): Promise<void>;
    static getQRCodes(req: Request, res: Response): Promise<void>;
    static getQRCodeById(req: Request, res: Response): Promise<void>;
    static updateDestination(req: Request, res: Response): Promise<void>;
    static deleteQRCode(req: Request, res: Response): Promise<void>;
    static toggleQRCodeStatus(req: Request, res: Response): Promise<void>;
    static redirectQRCode(req: Request, res: Response): Promise<void>;
    static getQRCodeAnalytics(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=qrController.d.ts.map