export interface CreateQRCodeRequest {
    destinationUrl: string;
    customCode?: string;
    expiresAt?: string;
}
export interface QRCodeResponse {
    id: string;
    shortCode: string;
    qrCodeUrl: string;
    qrCodeImage: string;
    qrCodeImageUrl?: string;
    destinationUrl: string;
    createdAt: string;
    expiresAt?: string;
    isActive: boolean;
}
export interface UpdateDestinationRequest {
    destinationUrl: string;
    activeFrom?: string;
    expiresAt?: string;
}
export interface UserRegistrationRequest {
    email: string;
    password: string;
    name?: string;
}
export interface UserLoginRequest {
    email: string;
    password: string;
}
export interface AuthResponse {
    user: {
        id: string;
        email: string;
        name?: string;
    };
    token: string;
}
export interface AnalyticsData {
    totalClicks: number;
    uniqueVisitors: number;
    topCountries: Array<{
        country: string;
        count: number;
    }>;
    devices: Array<{
        type: string;
        count: number;
    }>;
    dailyStats: Array<{
        date: string;
        clicks: number;
    }>;
}
export interface RequestWithUser extends Express.Request {
    user?: {
        id: string;
        email: string;
        name?: string;
    };
}
export interface AnalyticsQuery {
    from?: string;
    to?: string;
    limit?: number;
    offset?: number;
}
//# sourceMappingURL=index.d.ts.map