export declare class QRGenerator {
    static generateQRCode(url: string, options?: {
        size?: number;
        margin?: number;
        color?: {
            dark?: string;
            light?: string;
        };
        errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
    }): Promise<Buffer>;
    static generateQRCodePngBuffer(url: string, options?: {
        size?: number;
        margin?: number;
        color?: {
            dark?: string;
            light?: string;
        };
        errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
    }): Promise<Buffer>;
    static generateQRCodeBase64(url: string, options?: {
        size?: number;
        margin?: number;
        color?: {
            dark?: string;
            light?: string;
        };
        errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
    }): Promise<string>;
    static generateQRCodeWithLogo(url: string, logoPath?: string, options?: {
        size?: number;
        margin?: number;
        color?: {
            dark?: string;
            light?: string;
        };
        logoSize?: number;
    }): Promise<Buffer>;
    static validateUrl(url: string): boolean;
    static buildShortUrl(shortCode: string): string;
    static buildShortUrlForUser(shortCode: string, username?: string): string;
}
//# sourceMappingURL=qrGenerator.d.ts.map