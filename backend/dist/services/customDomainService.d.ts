export declare class CustomDomainService {
    private readonly DNS_VERIFICATION_PREFIX;
    requestCustomDomain(userId: string, domain: string): Promise<any>;
    verifyDNSOwnership(domain: string, token?: string): Promise<boolean>;
    private resolveTxtRecords;
    approveDomain(domainId: string, adminId: string): Promise<void>;
    rejectDomain(domainId: string, reason: string): Promise<void>;
    getUserCustomDomains(userId: string): Promise<any[]>;
    getAllCustomDomains(status?: string, page?: number, limit?: number): Promise<any>;
    private isValidDomain;
    private generateVerificationToken;
    configureSSL(domain: string): Promise<boolean>;
    isDomainAvailable(domain: string): Promise<boolean>;
}
export default CustomDomainService;
//# sourceMappingURL=customDomainService.d.ts.map