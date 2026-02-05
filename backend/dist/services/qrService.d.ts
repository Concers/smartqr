export declare class QRService {
    static createQRCode(data: any, userId?: string): Promise<any>;
    static getQRCodesByUser(userId: string, page?: number, limit?: number, search?: string): Promise<any>;
    static getQRCodeById(id: string, userId?: string): Promise<any | null>;
    static updateDestination(qrCodeId: string, data: any, userId?: string): Promise<void>;
    static deleteQRCode(id: string, userId?: string): Promise<void>;
    static toggleQRCodeStatus(id: string, userId?: string): Promise<boolean>;
    static getDestinationByShortCode(shortCode: string, host?: string): Promise<string | null>;
    static resolveShortCode(shortCode: string): Promise<{
        status: 'active';
        destinationUrl: string;
    } | {
        status: 'inactive' | 'not_found';
    }>;
}
//# sourceMappingURL=qrService.d.ts.map