import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import dns from 'dns';

const prisma = new PrismaClient();

export class CustomDomainService {
  private readonly DNS_VERIFICATION_PREFIX = 'netqr-verification=';

  /**
   * Custom domain isteği oluşturur
   */
  async requestCustomDomain(userId: string, domain: string): Promise<any> {
    try {
      // Domain formatını kontrol et
      if (!this.isValidDomain(domain)) {
        throw new Error('Invalid domain format');
      }

      // Aynı domain için mevcut istek kontrolü
      const existingDomain = await prisma.customDomain.findFirst({
        where: {
          domain: domain.toLowerCase(),
          status: { in: ['pending', 'approved'] }
        }
      });

      if (existingDomain) {
        throw new Error('Domain already exists or pending approval');
      }

      // DNS doğrulama token'ı oluştur
      const verificationToken = this.generateVerificationToken();

      const customDomain = await prisma.customDomain.create({
        data: {
          userId,
          domain: domain.toLowerCase(),
          verificationToken,
          status: 'pending'
        }
      });

      console.log(`🔍 Custom domain requested: ${domain} for user: ${userId}`);
      
      return {
        id: customDomain.id,
        domain: customDomain.domain,
        verificationToken,
        verificationInstructions: {
          type: 'TXT',
          name: domain,
          value: `${this.DNS_VERIFICATION_PREFIX}${verificationToken}`,
          ttl: 300
        },
        message: 'Domain request submitted. Please add the DNS TXT record for verification.'
      };

    } catch (error) {
      console.error('Error requesting custom domain:', error);
      throw error;
    }
  }

  /**
   * DNS sahipliğini doğrular
   */
  async verifyDNSOwnership(domain: string, token?: string): Promise<boolean> {
    try {
      const customDomain = await prisma.customDomain.findUnique({
        where: { domain: domain.toLowerCase() }
      });

      if (!customDomain) {
        throw new Error('Domain not found');
      }

      const verificationToken = token || customDomain.verificationToken;

      // TXT record kontrolü
      const txtRecords = await this.resolveTxtRecords(domain);
      const hasValidRecord = txtRecords.some(record => 
        record.includes(`${this.DNS_VERIFICATION_PREFIX}${verificationToken}`)
      );

      if (hasValidRecord) {
        await prisma.customDomain.update({
          where: { id: customDomain.id },
          data: { dnsVerified: true }
        });

        console.log(`✅ DNS verification successful for: ${domain}`);
        return true;
      }

      console.log(`❌ DNS verification failed for: ${domain}`);
      return false;

    } catch (error) {
      console.error('Error verifying DNS ownership:', error);
      return false;
    }
  }

  /**
   * TXT record'larını çözer
   */
  private async resolveTxtRecords(domain: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      dns.resolveTxt(domain, (err, records) => {
        if (err) {
          reject(err);
        } else {
          // Flatten nested arrays
          resolve(records.flat());
        }
      });
    });
  }

  /**
   * Admin tarafından domain onayı
   */
  async approveDomain(domainId: string, adminId: string): Promise<void> {
    try {
      const domain = await prisma.customDomain.findUnique({
        where: { id: domainId },
        include: { user: true }
      });

      if (!domain) {
        throw new Error('Domain not found');
      }

      if (domain.status !== 'pending') {
        throw new Error('Domain is not pending approval');
      }

      if (!domain.dnsVerified) {
        throw new Error('Domain DNS verification is required');
      }

      // User'ın custom domain'ini güncelle
      await prisma.user.update({
        where: { id: domain.userId },
        data: {
          approvedCustomDomain: domain.domain,
          customDomainEnabled: true
        }
      });

      // Domain'i onayla
      await prisma.customDomain.update({
        where: { id: domainId },
        data: {
          status: 'approved',
          approvedAt: new Date()
        }
      });

      console.log(`✅ Custom domain approved: ${domain.domain} for user: ${domain.user.email}`);

    } catch (error) {
      console.error('Error approving domain:', error);
      throw error;
    }
  }

  /**
   * Admin tarafından domain reddi
   */
  async rejectDomain(domainId: string, reason: string): Promise<void> {
    try {
      const domain = await prisma.customDomain.findUnique({
        where: { id: domainId },
        include: { user: true }
      });

      if (!domain) {
        throw new Error('Domain not found');
      }

      await prisma.customDomain.update({
        where: { id: domainId },
        data: {
          status: 'rejected',
          rejectedAt: new Date(),
          adminNotes: reason
        }
      });

      console.log(`❌ Custom domain rejected: ${domain.domain} - Reason: ${reason}`);

    } catch (error) {
      console.error('Error rejecting domain:', error);
      throw error;
    }
  }

  /**
   * Kullanıcının custom domain isteklerini getirir
   */
  async getUserCustomDomains(userId: string): Promise<any[]> {
    try {
      return await prisma.customDomain.findMany({
        where: { userId },
        orderBy: { requestedAt: 'desc' }
      });
    } catch (error) {
      console.error('Error getting user custom domains:', error);
      return [];
    }
  }

  /**
   * Tüm custom domain isteklerini getirir (Admin için)
   */
  async getAllCustomDomains(status?: string, page = 1, limit = 20): Promise<any> {
    try {
      const where = status ? { status } : {};
      
      const [domains, total] = await Promise.all([
        prisma.customDomain.findMany({
          where,
          include: {
            user: {
              select: { email: true, subdomain: true, createdAt: true }
            }
          },
          orderBy: { requestedAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit
        }),
        prisma.customDomain.count({ where })
      ]);

      return {
        domains,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error getting all custom domains:', error);
      throw error;
    }
  }

  /**
   * Domain formatını validate eder
   */
  private isValidDomain(domain: string): boolean {
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?(\.[a-zA-Z]{2,})+$/;
    return domainRegex.test(domain);
  }

  /**
   * DNS doğrulama token'ı oluşturur
   */
  private generateVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * SSL konfigürasyonu (gelecekte implement edilecek)
   */
  async configureSSL(domain: string): Promise<boolean> {
    // TODO: Implement SSL certificate configuration
    // This will integrate with Let's Encrypt or similar service
    console.log(`🔒 SSL configuration requested for: ${domain}`);
    return false;
  }

  /**
   * Domain'in kullanılabilir olup olmadığını kontrol eder
   */
  async isDomainAvailable(domain: string): Promise<boolean> {
    try {
      const existingDomain = await prisma.customDomain.findUnique({
        where: { domain: domain.toLowerCase() }
      });
      return !existingDomain;
    } catch (error) {
      console.error('Error checking domain availability:', error);
      return false;
    }
  }
}

export default CustomDomainService;
