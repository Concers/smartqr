import { User } from '@prisma/client';
export declare const generateQRUrl: (shortCode: string, user: User | null, lockedSubdomain?: string | null) => string;
export declare const generateCustomQRUrl: (shortCode: string, customDomain: string) => string;
export declare const generateSubdomainQRUrl: (shortCode: string, subdomain: string) => string;
export declare const extractSubdomain: (hostname: string) => string | null;
export declare const isCustomSubdomainRequest: (hostname: string) => boolean;
export declare const generateQRPreviewUrl: (shortCode: string, user: User | null, lockedSubdomain?: string | null) => string;
export declare const isValidCustomDomain: (domain: string) => boolean;
export declare const isValidSubdomain: (subdomain: string) => boolean;
//# sourceMappingURL=urlGenerator.d.ts.map