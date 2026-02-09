import { useState } from 'react';
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Database, 
  CreditCard, 
  Key,
  Mail,
  Phone,
  MapPin,
  Building,
  FileText,
  Download,
  Trash2,
  Save,
  Eye,
  EyeOff,
  Moon,
  Sun,
  Monitor,
  Smartphone
} from 'lucide-react';
import { AdminLayout } from '../components/Layout/AdminLayout';
import { useAuth } from '../hooks/useAuth';

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'security' | 'appearance' | 'system' | 'billing'>('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  // Mock settings data
  const [profileSettings, setProfileSettings] = useState({
    name: user?.name || 'Admin User',
    email: user?.email || 'admin@smartqr.com',
    phone: '+90 555 123 4567',
    company: 'netqr.io Technologies',
    position: 'System Administrator',
    location: 'İstanbul, Türkiye',
    bio: 'Profesyonel QR kod yönetimi ve analitik çözümleri.'
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    qrCreated: true,
    qrScanned: true,
    billingAlerts: true,
    securityAlerts: true,
    weeklyReports: true,
    marketingEmails: false
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: '30',
    loginAlerts: true,
    apiAccess: false,
    ipWhitelist: false,
    passwordStrength: 'strong'
  });

  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: 'light',
    language: 'tr',
    timezone: 'Europe/Istanbul',
    dateFormat: 'DD.MM.YYYY',
    compactMode: false,
    showAnimations: true
  });

  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    debugMode: false,
    logLevel: 'info',
    backupFrequency: 'daily',
    maxFileSize: '10',
    apiRateLimit: '1000'
  });

  const [billingSettings, setBillingSettings] = useState({
    plan: 'Profesyonel',
    billingCycle: 'monthly',
    autoRenew: true,
    paymentMethod: 'Kredi Kartı',
    billingEmail: 'billing@smartqr.com',
    taxInfo: '1234567890'
  });

  const handleSave = (section: string) => {
    console.log(`Saving ${section} settings...`);
    // Add save functionality here
  };

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Ayarlar</h1>
          <p className="text-slate-500 mt-2">Hesap ayarlarınızı ve sistem tercihlerinizi yönetin.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <nav className="space-y-1">
                {[
                  { key: 'profile', label: 'Profil', icon: User },
                  { key: 'notifications', label: 'Bildirimler', icon: Bell },
                  { key: 'security', label: 'Güvenlik', icon: Shield },
                  { key: 'appearance', label: 'Görünüm', icon: Palette },
                  { key: 'system', label: 'Sistem', icon: Database },
                  { key: 'billing', label: 'Faturalandırma', icon: CreditCard }
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key as any)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === tab.key
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl border border-slate-200">
              {/* Profile Settings */}
              {activeTab === 'profile' && (
                <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-slate-900">Profil Bilgileri</h2>
                    <button 
                      onClick={() => handleSave('profile')}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      Kaydet
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Ad Soyad</label>
                      <input
                        type="text"
                        value={profileSettings.name}
                        onChange={(e) => setProfileSettings({...profileSettings, name: e.target.value})}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">E-posta</label>
                      <input
                        type="email"
                        value={profileSettings.email}
                        onChange={(e) => setProfileSettings({...profileSettings, email: e.target.value})}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Telefon</label>
                      <input
                        type="tel"
                        value={profileSettings.phone}
                        onChange={(e) => setProfileSettings({...profileSettings, phone: e.target.value})}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Şirket</label>
                      <input
                        type="text"
                        value={profileSettings.company}
                        onChange={(e) => setProfileSettings({...profileSettings, company: e.target.value})}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Pozisyon</label>
                      <input
                        type="text"
                        value={profileSettings.position}
                        onChange={(e) => setProfileSettings({...profileSettings, position: e.target.value})}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Konum</label>
                      <input
                        type="text"
                        value={profileSettings.location}
                        onChange={(e) => setProfileSettings({...profileSettings, location: e.target.value})}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Hakkında</label>
                    <textarea
                      value={profileSettings.bio}
                      onChange={(e) => setProfileSettings({...profileSettings, bio: e.target.value})}
                      rows={3}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400"
                    />
                  </div>
                </div>
              )}

              {/* Notification Settings */}
              {activeTab === 'notifications' && (
                <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-slate-900">Bildirim Ayarları</h2>
                    <button 
                      onClick={() => handleSave('notifications')}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      Kaydet
                    </button>
                  </div>

                  <div className="space-y-4">
                    {[
                      { key: 'emailNotifications', label: 'E-posta Bildirimleri', desc: 'Önemli güncellemeler için e-posta al' },
                      { key: 'pushNotifications', label: 'Push Bildirimleri', desc: 'Tarayıcı bildirimlerini etkinleştir' },
                      { key: 'qrCreated', label: 'QR Oluşturuldu', desc: 'Yeni QR kodları oluşturulduğunda bildir' },
                      { key: 'qrScanned', label: 'QR Tarandı', desc: 'QR kodlarınız tarandığında bildir' },
                      { key: 'billingAlerts', label: 'Fatura Uyarıları', desc: 'Fatura ödemeleri hakkında bildir' },
                      { key: 'securityAlerts', label: 'Güvenlik Uyarıları', desc: 'Güvenlik olayları hakkında bildir' },
                      { key: 'weeklyReports', label: 'Haftalık Raporlar', desc: 'Haftalık performans raporları al' },
                      { key: 'marketingEmails', label: 'Pazarlama E-postaları', desc: 'Ürün güncellemeleri ve teklifler' }
                    ].map((setting) => (
                      <div key={setting.key} className="flex items-center justify-between py-3">
                        <div>
                          <div className="font-medium text-slate-900">{setting.label}</div>
                          <div className="text-sm text-slate-500">{setting.desc}</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notificationSettings[setting.key as keyof typeof notificationSettings]}
                            onChange={(e) => setNotificationSettings({
                              ...notificationSettings,
                              [setting.key]: e.target.checked
                            })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Security Settings */}
              {activeTab === 'security' && (
                <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-slate-900">Güvenlik Ayarları</h2>
                    <button 
                      onClick={() => handleSave('security')}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      Kaydet
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="font-medium text-slate-900 mb-4">Parola Değiştir</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Mevcut Parola</label>
                          <div className="relative">
                            <input
                              type={showCurrentPassword ? "text" : "password"}
                              className="w-full px-4 py-2 pr-10 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400"
                            />
                            <button
                              type="button"
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                              {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Yeni Parola</label>
                          <div className="relative">
                            <input
                              type={showPassword ? "text" : "password"}
                              className="w-full px-4 py-2 pr-10 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Parola Tekrar</label>
                          <input
                            type="password"
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium text-slate-900 mb-4">Güvenlik Seçenekleri</h3>
                      <div className="space-y-4">
                        {[
                          { key: 'twoFactorAuth', label: 'İki Faktörlü Kimlik Doğrulama', desc: 'Hesabınıza ekstra güvenlik katmanı ekleyin' },
                          { key: 'loginAlerts', label: 'Giriş Uyarıları', desc: 'Yeni cihazlardan giriş yapıldığında bildir' },
                          { key: 'apiAccess', label: 'API Erişimi', desc: 'API anahtarları ile programatik erişim' },
                          { key: 'ipWhitelist', label: 'IP Beyaz Liste', desc: 'Sadece izinli IP adreslerinden erişim' }
                        ].map((setting) => (
                          <div key={setting.key} className="flex items-center justify-between py-3">
                            <div>
                              <div className="font-medium text-slate-900">{setting.label}</div>
                              <div className="text-sm text-slate-500">{setting.desc}</div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={!!securitySettings[setting.key as keyof typeof securitySettings]}
                                onChange={(e) => setSecuritySettings({
                                  ...securitySettings,
                                  [setting.key]: e.target.checked
                                })}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Appearance Settings */}
              {activeTab === 'appearance' && (
                <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-slate-900">Görünüm Ayarları</h2>
                    <button 
                      onClick={() => handleSave('appearance')}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      Kaydet
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="font-medium text-slate-900 mb-4">Tema</h3>
                      <div className="grid grid-cols-3 gap-4">
                        {[
                          { key: 'light', label: 'Açık', icon: Sun },
                          { key: 'dark', label: 'Koyu', icon: Moon },
                          { key: 'auto', label: 'Otomatik', icon: Monitor }
                        ].map((theme) => {
                          const Icon = theme.icon;
                          return (
                            <button
                              key={theme.key}
                              onClick={() => setAppearanceSettings({...appearanceSettings, theme: theme.key})}
                              className={`p-4 rounded-lg border-2 transition-colors ${
                                appearanceSettings.theme === theme.key
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              <Icon className="w-6 h-6 mx-auto mb-2" />
                              <div className="text-sm font-medium">{theme.label}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Dil</label>
                        <select
                          value={appearanceSettings.language}
                          onChange={(e) => setAppearanceSettings({...appearanceSettings, language: e.target.value})}
                          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400"
                        >
                          <option value="tr">Türkçe</option>
                          <option value="en">English</option>
                          <option value="de">Deutsch</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Saat Dilimi</label>
                        <select
                          value={appearanceSettings.timezone}
                          onChange={(e) => setAppearanceSettings({...appearanceSettings, timezone: e.target.value})}
                          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400"
                        >
                          <option value="Europe/Istanbul">İstanbul</option>
                          <option value="Europe/London">Londra</option>
                          <option value="America/New_York">New York</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Tarih Formatı</label>
                        <select
                          value={appearanceSettings.dateFormat}
                          onChange={(e) => setAppearanceSettings({...appearanceSettings, dateFormat: e.target.value})}
                          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400"
                        >
                          <option value="DD.MM.YYYY">GG.AA.YYYY</option>
                          <option value="MM/DD/YYYY">AA/GG/YYYY</option>
                          <option value="YYYY-MM-DD">YYYY-AA-GG</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {[
                        { key: 'compactMode', label: 'Kompakt Görünüm', desc: 'Daha yoğun içerik gösterimi' },
                        { key: 'showAnimations', label: 'Animasyonlar', desc: 'Geçiş animasyonlarını etkinleştir' }
                      ].map((setting) => (
                        <div key={setting.key} className="flex items-center justify-between py-3">
                          <div>
                            <div className="font-medium text-slate-900">{setting.label}</div>
                            <div className="text-sm text-slate-500">{setting.desc}</div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={!!appearanceSettings[setting.key as keyof typeof appearanceSettings]}
                              onChange={(e) => setAppearanceSettings({
                                ...appearanceSettings,
                                [setting.key]: e.target.checked
                              })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* System Settings */}
              {activeTab === 'system' && (
                <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-slate-900">Sistem Ayarları</h2>
                    <button 
                      onClick={() => handleSave('system')}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      Kaydet
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Log Seviyesi</label>
                        <select
                          value={systemSettings.logLevel}
                          onChange={(e) => setSystemSettings({...systemSettings, logLevel: e.target.value})}
                          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400"
                        >
                          <option value="debug">Debug</option>
                          <option value="info">Info</option>
                          <option value="warning">Warning</option>
                          <option value="error">Error</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Yedekleme Sıklığı</label>
                        <select
                          value={systemSettings.backupFrequency}
                          onChange={(e) => setSystemSettings({...systemSettings, backupFrequency: e.target.value})}
                          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400"
                        >
                          <option value="hourly">Saatlik</option>
                          <option value="daily">Günlük</option>
                          <option value="weekly">Haftalık</option>
                          <option value="monthly">Aylık</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Maksimum Dosya Boyutu (MB)</label>
                        <input
                          type="number"
                          value={systemSettings.maxFileSize}
                          onChange={(e) => setSystemSettings({...systemSettings, maxFileSize: e.target.value})}
                          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">API Rate Limit (saat)</label>
                        <input
                          type="number"
                          value={systemSettings.apiRateLimit}
                          onChange={(e) => setSystemSettings({...systemSettings, apiRateLimit: e.target.value})}
                          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      {[
                        { key: 'maintenanceMode', label: 'Bakım Modu', desc: 'Sistemi bakım için geçici olarak devre dışı bırak' },
                        { key: 'debugMode', label: 'Debug Modu', desc: 'Geliştirici için hata ayıklama bilgilerini göster' }
                      ].map((setting) => (
                        <div key={setting.key} className="flex items-center justify-between py-3">
                          <div>
                            <div className="font-medium text-slate-900">{setting.label}</div>
                            <div className="text-sm text-slate-500">{setting.desc}</div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={!!systemSettings[setting.key as keyof typeof systemSettings]}
                              onChange={(e) => setSystemSettings({
                                ...systemSettings,
                                [setting.key]: e.target.checked
                              })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Billing Settings */}
              {activeTab === 'billing' && (
                <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-slate-900">Faturalandırma Ayarları</h2>
                    <button 
                      onClick={() => handleSave('billing')}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      Kaydet
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">{billingSettings.plan} Paket</h3>
                          <p className="text-slate-600">Mevcut aboneliğiniz</p>
                        </div>
                        <div className="text-2xl font-bold text-blue-600">
                          ₺149<span className="text-sm text-slate-600">/ay</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <span>Yenilenme: 15 Şubat 2026</span>
                        <span>•</span>
                        <span>Otomatik yenileme: {billingSettings.autoRenew ? 'Aktif' : 'Pasif'}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Fatura Döngüsü</label>
                        <select
                          value={billingSettings.billingCycle}
                          onChange={(e) => setBillingSettings({...billingSettings, billingCycle: e.target.value})}
                          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400"
                        >
                          <option value="monthly">Aylık</option>
                          <option value="yearly">Yıllık (%20 indirim)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Ödeme Yöntemi</label>
                        <select
                          value={billingSettings.paymentMethod}
                          onChange={(e) => setBillingSettings({...billingSettings, paymentMethod: e.target.value})}
                          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400"
                        >
                          <option value="Kredi Kartı">Kredi Kartı</option>
                          <option value="Banka Havalesi">Banka Havalesi</option>
                          <option value="PayPal">PayPal</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Fatura E-postası</label>
                        <input
                          type="email"
                          value={billingSettings.billingEmail}
                          onChange={(e) => setBillingSettings({...billingSettings, billingEmail: e.target.value})}
                          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Vergi Numarası</label>
                        <input
                          type="text"
                          value={billingSettings.taxInfo}
                          onChange={(e) => setBillingSettings({...billingSettings, taxInfo: e.target.value})}
                          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-3">
                        <div>
                          <div className="font-medium text-slate-900">Otomatik Yenileme</div>
                          <div className="text-sm text-slate-500">Aboneliğiniz otomatik olarak yenilensin</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={billingSettings.autoRenew}
                            onChange={(e) => setBillingSettings({...billingSettings, autoRenew: e.target.checked})}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
                        Faturaları İndir
                      </button>
                      <button className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                        İptal Et
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
