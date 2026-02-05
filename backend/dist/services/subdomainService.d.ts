export declare class SubdomainService {
    private readonly SUBDOMAIN_PREFIX;
    private readonly SUBDOMAIN_LENGTH;
    private readonly MAX_ATTEMPTS;
    private normalizeRequestedSubdomain;
    private isValidRequestedSubdomainFormat;
    private isReservedSubdomain;
    generateSubdomainFromUserId(userId: string): string;
    isSubdomainAvailable(subdomain: string): Promise<boolean>;
    assignRequestedSubdomainToUser(userId: string, requestedSubdomain: string): Promise<string>;
    assignSubdomainToUser(userId: string): Promise<string>;
    updateSubdomainHistory(userId: string): Promise<void>;
    getSubdomainHistory(userId: string): Promise<any[]>;
    getUserSubdomain(userId: string): Promise<string | null>;
    assignSubdomainOnRegistration(userId: string): Promise<string>;
    isValidSubdomainFormat(subdomain: string): boolean;
    assignSubdomainsToExistingUsers(): Promise<void>;
}
export default SubdomainService;
//# sourceMappingURL=subdomainService.d.ts.map