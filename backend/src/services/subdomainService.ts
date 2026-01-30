import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

export class SubdomainService {
  private readonly SUBDOMAIN_PREFIX = 'user-';
  private readonly SUBDOMAIN_LENGTH = 10;
  private readonly MAX_ATTEMPTS = 100;

  /**
   * Rastgele subdomain generate eder
   * Format: user-{10 karakter random}
   */
  generateRandomSubdomain(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let randomString = '';
    
    for (let i = 0; i < this.SUBDOMAIN_LENGTH; i++) {
      randomString += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return `${this.SUBDOMAIN_PREFIX}${randomString}`;
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
   * Kullanıcıya benzersiz subdomain atar
   */
  async assignSubdomainToUser(userId: string): Promise<string> {
    let attempts = 0;
    
    while (attempts < this.MAX_ATTEMPTS) {
      const subdomain = this.generateRandomSubdomain();
      
      try {
        const available = await this.isSubdomainAvailable(subdomain);
        
        if (available) {
          // Önceki subdomain'i history'e ekle
          await this.updateSubdomainHistory(userId);
          
          // Yeni subdomain'i ata
          await prisma.user.update({
            where: { id: userId },
            data: { subdomain }
          });
          
          console.log(`✅ Subdomain assigned: ${subdomain} for user: ${userId}`);
          return subdomain;
        }
        
        attempts++;
      } catch (error) {
        console.error(`Attempt ${attempts} failed:`, error);
        attempts++;
      }
    }
    
    throw new Error(`Unable to generate unique subdomain after ${this.MAX_ATTEMPTS} attempts`);
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
