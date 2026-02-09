import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

export class SubdomainService {
  private readonly SUBDOMAIN_PREFIX = 'user-';
  private readonly SUBDOMAIN_LENGTH = 10;
  private readonly MAX_ATTEMPTS = 100;

  private normalizeRequestedSubdomain(input: string): string {
    return (input || '').trim().toLowerCase();
  }

  private isValidRequestedSubdomainFormat(subdomain: string): boolean {
    // Allow: a-z 0-9 and hyphen, must start/end with alnum, length 3-30
    if (!subdomain) return false;
    if (subdomain.length < 3 || subdomain.length > 30) return false;
    if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(subdomain)) return false;
    if (subdomain.includes('--')) return false;
    return true;
  }

  private isReservedSubdomain(subdomain: string): boolean {
    const reserved = new Set(['www', 'netqr', 'admin', 'api']);
    return reserved.has(subdomain);
  }

  /**
   * Kullanıcı ID'sine göre subdomain generate eder
   * Format: user ID'nin ilk 8 karakteri (unique olduğu için collision olmaz)
   */
  generateSubdomainFromUserId(userId: string): string {
    // CUID formatı: cml28gmi70000la3ed8d9e2sd
    // İlk 8-12 karakteri kullan (unique ve readable)
    const shortId = userId.slice(0, 8).toLowerCase();
    return shortId;
  }

  /**
   * Subdomain'in kullanılabilir olup olmadığını kontrol eder
   */
  async isSubdomainAvailable(subdomain: string): Promise<boolean> {
    try {
      const existingUser = await prisma.user.findUnique({
        where: { subdomain }
      });
      return !existingUser;
    } catch (error) {
      console.error('Error checking subdomain availability:', error);
      throw new Error('Failed to check subdomain availability');
    }
  }

  /**
   * Admin-approved flow: assign a requested custom subdomain (e.g. "mybrand") to user.
   * Keeps previous subdomain in history.
   */
  async assignRequestedSubdomainToUser(userId: string, requestedSubdomain: string): Promise<string> {
    const subdomain = this.normalizeRequestedSubdomain(requestedSubdomain);

    if (!this.isValidRequestedSubdomainFormat(subdomain)) {
      throw new Error('Invalid subdomain format');
    }

    if (this.isReservedSubdomain(subdomain)) {
      throw new Error('Subdomain is reserved');
    }

    const available = await this.isSubdomainAvailable(subdomain);
    if (!available) {
      throw new Error('Subdomain is already in use');
    }

    // Keep previous subdomain in history then assign
    await this.updateSubdomainHistory(userId);
    await prisma.user.update({
      where: { id: userId },
      data: { subdomain },
    });

    console.log(`✅ Requested subdomain assigned: ${subdomain} for user: ${userId}`);
    return subdomain;
  }

  /**
   * Kullanıcıya ID-based subdomain atar (otomatik, kayıt sırasında)
   */
  async assignSubdomainToUser(userId: string): Promise<string> {
    try {
      const subdomain = this.generateSubdomainFromUserId(userId);
      
      // Subdomain'i ata (history'e eklemeye gerek yok, ilk subdomain)
      await prisma.user.update({
        where: { id: userId },
        data: { subdomain }
      });
      
      console.log(`✅ ID-based subdomain assigned: ${subdomain} for user: ${userId}`);
      return subdomain;
    } catch (error) {
      console.error('Failed to assign subdomain:', error);
      throw new Error('Unable to assign subdomain');
    }
  }

  /**
   * Subdomain değiştirme history'sini günceller
   */
  async updateSubdomainHistory(userId: string): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { subdomain: true, subdomainHistory: true }
      });

      if (user?.subdomain) {
        const history = user.subdomainHistory as any[] || [];
        history.push({
          subdomain: user.subdomain,
          changed_at: new Date().toISOString()
        });

        await prisma.user.update({
          where: { id: userId },
          data: { subdomainHistory: history }
        });
        
        console.log(`📝 Subdomain history updated for user: ${userId}`);
      }
    } catch (error) {
      console.error('Error updating subdomain history:', error);
      throw new Error('Failed to update subdomain history');
    }
  }

  /**
   * Kullanıcının subdomain history'sini getirir
   */
  async getSubdomainHistory(userId: string): Promise<any[]> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { subdomainHistory: true }
      });

      return (user?.subdomainHistory as any[]) || [];
    } catch (error) {
      console.error('Error getting subdomain history:', error);
      return [];
    }
  }

  /**
   * Kullanıcının mevcut subdomain'ini getirir
   */
  async getUserSubdomain(userId: string): Promise<string | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { subdomain: true }
      });

      return user?.subdomain || null;
    } catch (error) {
      console.error('Error getting user subdomain:', error);
      return null;
    }
  }

  /**
   * Yeni kullanıcı kaydında subdomain atar
   */
  async assignSubdomainOnRegistration(userId: string): Promise<string> {
    try {
      console.log(`🔧 Assigning subdomain for new user: ${userId}`);
      const subdomain = await this.assignSubdomainToUser(userId);
      return subdomain;
    } catch (error) {
      console.error('Error assigning subdomain on registration:', error);
      throw new Error('Failed to assign subdomain during registration');
    }
  }

  /**
   * Subdomain formatını validate eder
   */
  isValidSubdomainFormat(subdomain: string): boolean {
    const pattern = /^user-[a-z0-9]{10}$/;
    return pattern.test(subdomain);
  }

  /**
   * Mevcut kullanıcılar için subdomain atama (migration helper)
   */
  async assignSubdomainsToExistingUsers(): Promise<void> {
    try {
      const usersWithoutSubdomain = await prisma.user.findMany({
        where: { subdomain: null },
        select: { id: true, email: true }
      });

      console.log(`🔄 Found ${usersWithoutSubdomain.length} users without subdomain`);

      for (const user of usersWithoutSubdomain) {
        try {
          await this.assignSubdomainToUser(user.id);
          console.log(`✅ Assigned subdomain to user: ${user.email}`);
        } catch (error) {
          console.error(`❌ Failed to assign subdomain to user: ${user.email}`, error);
        }
      }

      console.log('🎉 Subdomain assignment completed');
    } catch (error) {
      console.error('Error in bulk subdomain assignment:', error);
    }
  }
}

export default SubdomainService;
