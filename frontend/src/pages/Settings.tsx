import { useState } from 'react';
import { User, Shield, Bell, Palette, Save, Eye, EyeOff, Moon, Sun, Monitor, Smartphone } from 'lucide-react';
import { AdminLayout } from '../components/Layout/AdminLayout';
import { useAuth } from '../hooks/useAuth';

// Base class for settings management
abstract class SettingsManager<T> {
  protected data: T;
  protected initialData: T;

  constructor(initialData: T) {
    this.data = { ...initialData };
    this.initialData = { ...initialData };
  }

  abstract updateField<K extends keyof T>(field: K, value: T[K]): void;
  
  hasChanges(): boolean {
    return JSON.stringify(this.data) !== JSON.stringify(this.initialData);
  }

  reset(): void {
    this.data = { ...this.initialData };
  }

  getData(): T {
    return { ...this.data };
  }

  save(): void {
    this.initialData = { ...this.data };
    console.log(`Saving settings:`, this.data);
  }
}

// Profile settings manager
class ProfileSettingsManager extends SettingsManager<{
  name: string;
  email: string;
  phone: string;
  company: string;
  position: string;
  location: string;
  bio: string;
}> {
  updateField<K extends keyof ProfileSettingsManager['data']>(field: K, value: ProfileSettingsManager['data'][K]): void {
    this.data[field] = value;
  }
}

// Notification settings manager
class NotificationSettingsManager extends SettingsManager<{
  emailNotifications: boolean;
  pushNotifications: boolean;
  qrCreated: boolean;
  qrScanned: boolean;
  loginAlerts: boolean;
  apiAccess: boolean;
  ipWhitelist: boolean;
  passwordStrength: string;
}> {
  updateField<K extends keyof NotificationSettingsManager['data']>(field: K, value: NotificationSettingsManager['data'][K]): void {
    this.data[field] = value;
  }
}

// Security settings manager
class SecuritySettingsManager extends SettingsManager<{
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  twoFactorEnabled: boolean;
  loginAttempts: number;
  sessionTimeout: number;
  allowedDevices: string[];
}> {
  updateField<K extends keyof SecuritySettingsManager['data']>(field: K, value: SecuritySettingsManager['data'][K]): void {
    this.data[field] = value;
  }
}

// Appearance settings manager
class AppearanceSettingsManager extends SettingsManager<{
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  dateFormat: string;
  compactMode: boolean;
  showAnimations: boolean;
}> {
  updateField<K extends keyof AppearanceSettingsManager['data']>(field: K, value: AppearanceSettingsManager['data'][K]): void {
    this.data[field] = value;
  }
}

// Settings tab configuration
interface SettingsTab {
  id: 'profile' | 'notifications' | 'security' | 'appearance';
  label: string;
  icon: React.ComponentType<any>;
  description: string;
}

const SETTINGS_TABS: SettingsTab[] = [
  {
    id: 'profile',
    label: 'Profil',
    icon: User,
    description: 'Kişisel bilgilerinizi yönetin'
  },
  {
    id: 'notifications',
    label: 'Bildirimler',
    icon: Bell,
    description: 'Bildirim tercihlerinizi ayarlayın'
  },
  {
    id: 'security',
    label: 'Güvenlik',
    icon: Shield,
    description: 'Hesap güvenliğinizi yapılandırın'
  },
  {
    id: 'appearance',
    label: 'Görünüm',
    icon: Palette,
    description: 'Arayüz görünümünü özelleştirin'
  }
];

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab['id']>('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  // Initialize settings managers
  const [profileManager] = useState(() => new ProfileSettingsManager({
    name: user?.name || 'Admin User',
    email: user?.email || 'admin@smartqr.com',
    phone: '+90 555 123 4567',
    company: 'netqr.io Technologies',
    position: 'System Administrator',
    location: 'İstanbul, Türkiye',
    bio: 'Profesyonel QR kod yönetimi ve analitik çözümleri.'
  }));

  const [notificationManager] = useState(() => new NotificationSettingsManager({
    emailNotifications: true,
    pushNotifications: true,
    qrCreated: true,
    qrScanned: true,
    loginAlerts: true,
    apiAccess: false,
    ipWhitelist: false,
    passwordStrength: 'strong'
  }));

  const [securityManager] = useState(() => new SecuritySettingsManager({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false,
    loginAttempts: 5,
    sessionTimeout: 30,
    allowedDevices: ['Chrome', 'Firefox', 'Safari']
  }));

  const [appearanceManager] = useState(() => new AppearanceSettingsManager({
    theme: 'light',
    language: 'tr',
    timezone: 'Europe/Istanbul',
    dateFormat: 'DD.MM.YYYY',
    compactMode: false,
    showAnimations: true
  }));

  // Get current manager based on active tab
  const getCurrentManager = () => {
    switch (activeTab) {
      case 'profile': return profileManager;
      case 'notifications': return notificationManager;
      case 'security': return securityManager;
      case 'appearance': return appearanceManager;
      default: return profileManager;
    }
  };

  const handleSave = () => {
    const manager = getCurrentManager();
    if (manager.hasChanges()) {
      manager.save();
      alert('Ayarlar başarıyla kaydedildi!');
    }
  };

  const handleReset = () => {
    const manager = getCurrentManager();
    manager.reset();
  };

  const renderProfileTab = () => {
    const data = profileManager.getData();
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Ad Soyad</label>
            <input
              type="text"
              value={data.name}
              onChange={(e) => profileManager.updateField('name', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">E-posta</label>
            <input
              type="email"
              value={data.email}
              onChange={(e) => profileManager.updateField('email', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Telefon</label>
            <input
              type="tel"
              value={data.phone}
              onChange={(e) => profileManager.updateField('phone', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Şirket</label>
            <input
              type="text"
              value={data.company}
              onChange={(e) => profileManager.updateField('company', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Pozisyon</label>
            <input
              type="text"
              value={data.position}
              onChange={(e) => profileManager.updateField('position', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Konum</label>
            <input
              type="text"
              value={data.location}
              onChange={(e) => profileManager.updateField('location', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Hakkımda</label>
          <textarea
            value={data.bio}
            onChange={(e) => profileManager.updateField('bio', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    );
  };

  const renderNotificationsTab = () => {
    const data = notificationManager.getData();
    
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-slate-900">Bildirim Tercihleri</h3>
          <div className="space-y-3">
            {[
              { key: 'emailNotifications', label: 'E-posta Bildirimleri' },
              { key: 'pushNotifications', label: 'Push Bildirimleri' },
              { key: 'qrCreated', label: 'QR Kod Oluşturulduğunda' },
              { key: 'qrScanned', label: 'QR Kod Tarandığında' },
              { key: 'loginAlerts', label: 'Giriş Uyarıları' },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center">
                <input
                  type="checkbox"
                  checked={data[key as keyof typeof data] as boolean}
                  onChange={(e) => notificationManager.updateField(key as keyof typeof data, e.target.checked)}
                  className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                />
                <span className="text-sm text-slate-700">{label}</span>
              </label>
            ))}
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-slate-900">Güvenlik Ayarları</h3>
          <div className="space-y-3">
            {[
              { key: 'apiAccess', label: 'API Erişimi' },
              { key: 'ipWhitelist', label: 'IP Beyaz Liste' },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center">
                <input
                  type="checkbox"
                  checked={data[key as keyof typeof data] as boolean}
                  onChange={(e) => notificationManager.updateField(key as keyof typeof data, e.target.checked)}
                  className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                />
                <span className="text-sm text-slate-700">{label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderSecurityTab = () => {
    const data = securityManager.getData();
    
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-slate-900">Şifre Değiştir</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Mevcut Şifre</label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={data.currentPassword}
                  onChange={(e) => securityManager.updateField('currentPassword', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Yeni Şifre</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={data.newPassword}
                  onChange={(e) => securityManager.updateField('newPassword', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Şifre Tekrar</label>
              <input
                type="password"
                value={data.confirmPassword}
                onChange={(e) => securityManager.updateField('confirmPassword', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-slate-900">Güvenlik Seçenekleri</h3>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={data.twoFactorEnabled}
                onChange={(e) => securityManager.updateField('twoFactorEnabled', e.target.checked)}
                className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
              />
              <span className="text-sm text-slate-700">İki Faktörlü Kimlik Doğrulama</span>
            </label>
          </div>
        </div>
      </div>
    );
  };

  const renderAppearanceTab = () => {
    const data = appearanceManager.getData();
    
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-slate-900">Tema</h3>
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: 'light', label: 'Açık', icon: Sun },
              { value: 'dark', label: 'Koyu', icon: Moon },
              { value: 'auto', label: 'Otomatik', icon: Monitor },
            ].map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => appearanceManager.updateField('theme', value as typeof data.theme)}
                className={`p-4 border rounded-lg flex flex-col items-center space-y-2 transition-colors ${
                  data.theme === value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <Icon className="h-6 w-6" />
                <span className="text-sm font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-slate-900">Yerelleştirme</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Dil</label>
              <select
                value={data.language}
                onChange={(e) => appearanceManager.updateField('language', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="tr">Türkçe</option>
                <option value="en">English</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Saat Dilimi</label>
              <select
                value={data.timezone}
                onChange={(e) => appearanceManager.updateField('timezone', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Europe/Istanbul">İstanbul</option>
                <option value="UTC">UTC</option>
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-slate-900">Görünüm</h3>
          <div className="space-y-3">
            {[
              { key: 'compactMode', label: 'Sıkışık Mod' },
              { key: 'showAnimations', label: 'Animasyonları Göster' },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center">
                <input
                  type="checkbox"
                  checked={data[key as keyof typeof data] as boolean}
                  onChange={(e) => appearanceManager.updateField(key as keyof typeof data, e.target.checked)}
                  className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                />
                <span className="text-sm text-slate-700">{label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile': return renderProfileTab();
      case 'notifications': return renderNotificationsTab();
      case 'security': return renderSecurityTab();
      case 'appearance': return renderAppearanceTab();
      default: return renderProfileTab();
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Ayarlar</h1>
          <p className="text-slate-500 mt-2">Hesap ayarlarınızı yönetin ve özelleştirin</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <nav className="space-y-1">
              {SETTINGS_TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <div>
                      <div className="font-medium">{tab.label}</div>
                      <div className="text-xs text-slate-500">{tab.description}</div>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                      {SETTINGS_TABS.find(tab => tab.id === activeTab)?.label}
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                      {SETTINGS_TABS.find(tab => tab.id === activeTab)?.description}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleReset}
                      className="px-4 py-2 text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      Sıfırla
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={!getCurrentManager().hasChanges()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      Kaydet
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-6">
                {renderTabContent()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
