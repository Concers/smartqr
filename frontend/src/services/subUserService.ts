import { api } from './api';

export interface SubUser {
  id: string;
  email: string;
  name?: string;
  isActive: boolean;
  permissions: SubUserPermissions;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

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
}

export interface UpdateSubUserData {
  email?: string;
  name?: string;
  password?: string;
  isActive?: boolean;
  permissions?: Partial<SubUserPermissions>;
}

export interface SubUserStats {
  total: number;
  active: number;
  inactive: number;
}

export interface SubUserAuthResult {
  id: string;
  email: string;
  name?: string;
  isActive: boolean;
  permissions: SubUserPermissions;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  parentUser: {
    id: string;
    email: string;
    name?: string;
    subdomain?: string;
  };
  token: string;
}

class SubUserService {
  // Parent user operations
  async createSubUser(data: CreateSubUserData): Promise<SubUser> {
    const response = await api.post('/sub-user', data);
    return response.data.subUser;
  }

  async getSubUsers(): Promise<{ subUsers: SubUser[]; stats: SubUserStats }> {
    const response = await api.get('/sub-user');
    return response.data;
  }

  async getSubUserById(id: string): Promise<SubUser> {
    const response = await api.get(`/sub-user/${id}`);
    return response.data.subUser;
  }

  async updateSubUser(id: string, data: UpdateSubUserData): Promise<SubUser> {
    const response = await api.put(`/sub-user/${id}`, data);
    return response.data.subUser;
  }

  async deleteSubUser(id: string): Promise<void> {
    await api.delete(`/sub-user/${id}`);
  }

  async getSubUserStats(): Promise<SubUserStats> {
    const response = await api.get('/sub-user/stats');
    return response.data.stats;
  }

  // Sub-user authentication
  async loginSubUser(email: string, password: string): Promise<SubUserAuthResult> {
    const response = await api.post('/sub-user/login', { email, password });
    return response.data.user;
  }

  // Permission helpers
  static getDefaultPermissions(): SubUserPermissions {
    return {
      qr_create: false,
      qr_edit: false,
      qr_delete: false,
      qr_view: true,
      analytics_view: false,
      subuser_manage: false,
    };
  }

  static getPermissionLabels(): Record<keyof SubUserPermissions, string> {
    return {
      qr_create: 'QR Oluştur',
      qr_edit: 'QR Düzenle',
      qr_delete: 'QR Sil',
      qr_view: 'QR Görüntüle',
      analytics_view: 'Analiz Görüntüle',
      subuser_manage: 'Alt Kullanıcı Yönetimi',
    };
  }

  static getPermissionDescriptions(): Record<keyof SubUserPermissions, string> {
    return {
      qr_create: 'Yeni QR kodları oluşturabilir',
      qr_edit: 'Mevcut QR kodlarını düzenleyebilir',
      qr_delete: 'QR kodlarını silebilir',
      qr_view: 'QR kodlarını görüntüleyebilir',
      analytics_view: 'QR kodu analizlerini görebilir',
      subuser_manage: 'Diğer alt kullanıcıları yönetebilir',
    };
  }
}

export default new SubUserService();
export { SubUserService };
