import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '@/config/app';

const prisma = new PrismaClient();

export interface SubUserPermissions {
  qr_create: boolean;
  qr_edit: boolean;
  qr_delete: boolean;
  qr_view: boolean;
  analytics_view: boolean;
  subuser_manage: boolean;
}

export interface CreateSubUserData {
  email: string;
  password: string;
  name?: string;
  permissions: Partial<SubUserPermissions>;
  parentUserId: string;
}

export interface UpdateSubUserData {
  email?: string;
  name?: string;
  password?: string;
  isActive?: boolean;
  permissions?: Partial<SubUserPermissions>;
}

export class SubUserService {
  private readonly SALT_ROUNDS = 10;

  private getDefaultPermissions(): SubUserPermissions {
    return {
      qr_create: false,
      qr_edit: false,
      qr_delete: false,
      qr_view: true,
      analytics_view: false,
      subuser_manage: false,
    };
  }

  private hashPassword(password: string): string {
    return bcrypt.hashSync(password, this.SALT_ROUNDS);
  }

  private comparePassword(password: string, hash: string): boolean {
    return bcrypt.compareSync(password, hash);
  }

  private generateSubUserToken(subUser: any): string {
    const payload = {
      // Standardized fields
      userId: subUser.parentUserId,
      subUserId: subUser.id,

      // Useful identity
      email: subUser.email,
      type: 'subuser',
      permissions: subUser.permissions,

      // Legacy/backward compatibility
      id: subUser.id,
      parentUserId: subUser.parentUserId,
    };

    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    } as jwt.SignOptions);
  }

  /**
   * Create a new sub-user for a parent user
   */
  async createSubUser(data: CreateSubUserData): Promise<any> {
    try {
      // Check if email already exists for this parent
      const existingSubUser = await prisma.subUser.findUnique({
        where: {
          parentUserId_email: {
            parentUserId: data.parentUserId,
            email: data.email,
          },
        },
      });

      if (existingSubUser) {
        throw new Error('A sub-user with this email already exists');
      }

      // Merge with default permissions
      const permissions = {
        ...this.getDefaultPermissions(),
        ...data.permissions,
      };

      const hashedPassword = this.hashPassword(data.password);

      const subUser = await prisma.subUser.create({
        data: {
          email: data.email,
          password: hashedPassword,
          name: data.name,
          permissions,
          parentUserId: data.parentUserId,
          createdBy: data.parentUserId,
        },
        include: {
          parentUser: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });

      // Remove password from response
      const { password: _, ...subUserWithoutPassword } = subUser;

      console.log(`✅ Sub-user created: ${data.email} for parent: ${data.parentUserId}`);
      return subUserWithoutPassword;
    } catch (error) {
      console.error('Error creating sub-user:', error);
      throw error;
    }
  }

  /**
   * Get all sub-users for a parent user
   */
  async getSubUsersByParent(parentUserId: string): Promise<any[]> {
    try {
      const subUsers = await prisma.subUser.findMany({
        where: {
          parentUserId,
        },
        select: {
          id: true,
          email: true,
          name: true,
          isActive: true,
          permissions: true,
          createdAt: true,
          updatedAt: true,
          lastLoginAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return subUsers;
    } catch (error) {
      console.error('Error fetching sub-users:', error);
      throw error;
    }
  }

  /**
   * Get sub-user by ID (only if belongs to parent)
   */
  async getSubUserById(id: string, parentUserId: string): Promise<any | null> {
    try {
      const subUser = await prisma.subUser.findFirst({
        where: {
          id,
          parentUserId,
        },
        select: {
          id: true,
          email: true,
          name: true,
          isActive: true,
          permissions: true,
          createdAt: true,
          updatedAt: true,
          lastLoginAt: true,
        },
      });

      return subUser;
    } catch (error) {
      console.error('Error fetching sub-user:', error);
      throw error;
    }
  }

  /**
   * Update sub-user
   */
  async updateSubUser(id: string, data: UpdateSubUserData, parentUserId: string): Promise<any> {
    try {
      // Verify sub-user belongs to parent
      const existingSubUser = await prisma.subUser.findFirst({
        where: {
          id,
          parentUserId,
        },
      });

      if (!existingSubUser) {
        throw new Error('Sub-user not found or access denied');
      }

      const updateData: any = {
        ...data,
        updatedAt: new Date(),
        updatedBy: parentUserId,
      };

      // Handle permissions merge
      if (data.permissions) {
        updateData.permissions = {
          ...this.getDefaultPermissions(),
          ...(existingSubUser.permissions as any),
          ...data.permissions,
        };
      }

      // Hash new password if provided
      if (data.password) {
        updateData.password = this.hashPassword(data.password);
      }

      const subUser = await prisma.subUser.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          email: true,
          name: true,
          isActive: true,
          permissions: true,
          createdAt: true,
          updatedAt: true,
          lastLoginAt: true,
        },
      });

      console.log(`✅ Sub-user updated: ${id}`);
      return subUser;
    } catch (error) {
      console.error('Error updating sub-user:', error);
      throw error;
    }
  }

  /**
   * Delete sub-user
   */
  async deleteSubUser(id: string, parentUserId: string): Promise<void> {
    try {
      // Verify sub-user belongs to parent
      const existingSubUser = await prisma.subUser.findFirst({
        where: {
          id,
          parentUserId,
        },
      });

      if (!existingSubUser) {
        throw new Error('Sub-user not found or access denied');
      }

      await prisma.subUser.delete({
        where: { id },
      });

      console.log(`✅ Sub-user deleted: ${id}`);
    } catch (error) {
      console.error('Error deleting sub-user:', error);
      throw error;
    }
  }

  /**
   * Sub-user authentication
   */
  async authenticateSubUser(email: string, password: string): Promise<any> {
    try {
      const subUser = await prisma.subUser.findUnique({
        where: { email },
        include: {
          parentUser: {
            select: {
              id: true,
              email: true,
              name: true,
              subdomain: true,
            },
          },
        },
      });

      if (!subUser) {
        throw new Error('Invalid credentials');
      }

      if (!subUser.isActive) {
        throw new Error('Account is deactivated');
      }

      const isPasswordValid = this.comparePassword(password, subUser.password);
      if (!isPasswordValid) {
        throw new Error('Invalid credentials');
      }

      // Update last login
      await prisma.subUser.update({
        where: { id: subUser.id },
        data: { lastLoginAt: new Date() },
      });

      // Generate token
      const token = this.generateSubUserToken(subUser);

      // Remove password from response
      const { password: _, ...subUserWithoutPassword } = subUser;

      return {
        ...subUserWithoutPassword,
        token,
      };
    } catch (error) {
      console.error('Error authenticating sub-user:', error);
      throw error;
    }
  }

  /**
   * Check if sub-user has specific permission
   */
  hasPermission(subUser: any, permission: keyof SubUserPermissions): boolean {
    if (!subUser || !subUser.permissions) return false;
    return subUser.permissions[permission] === true;
  }

  /**
   * Get sub-user statistics for parent
   */
  async getSubUserStats(parentUserId: string): Promise<any> {
    try {
      const [total, active, inactive] = await Promise.all([
        prisma.subUser.count({ where: { parentUserId } }),
        prisma.subUser.count({ where: { parentUserId, isActive: true } }),
        prisma.subUser.count({ where: { parentUserId, isActive: false } }),
      ]);

      return {
        total,
        active,
        inactive,
      };
    } catch (error) {
      console.error('Error fetching sub-user stats:', error);
      throw error;
    }
  }
}
