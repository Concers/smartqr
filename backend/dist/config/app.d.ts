export declare const config: {
    port: string | number;
    nodeEnv: string;
    database: {
        url: string;
    };
    redis: {
        url: string;
    };
    jwt: {
        secret: string;
        expiresIn: string;
    };
    app: {
        url: string;
        frontendUrl: string;
    };
    qr: {
        baseUrl: string;
        rootDomain: string;
        protocol: string;
        customDomainEnabled: boolean;
        domainAliases: string[];
    };
    rateLimit: {
        windowMs: number;
        maxRequests: number;
    };
    cors: {
        origin: string;
    };
    analytics: {
        enabled: boolean;
        geolocationApiKey: string;
    };
    security: {
        bcryptRounds: number;
        sessionSecret: string;
    };
    upload: {
        maxFileSize: number;
        uploadPath: string;
    };
    email: {
        host: string;
        port: number;
        user: string;
        pass: string;
        fromEmail: string;
    };
};
//# sourceMappingURL=app.d.ts.map