import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { Input } from '../components/Common/Input';
import { Button } from '../components/Common/Button';
import { authService } from '../services/authService';
import { useAuth } from '../hooks/useAuth';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!email.trim()) newErrors.email = 'E-posta gereklidir';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Geçerli e-posta adresi girin';

    if (!password.trim()) newErrors.password = 'Şifre gereklidir';
    else if (password.length < 6) newErrors.password = 'Şifre en az 6 karakter olmalıdır';

    if (!name.trim()) newErrors.name = 'Ad gereklidir';

    if (!confirmPassword.trim()) newErrors.confirmPassword = 'Şifre onayı gereklidir';
    else if (password !== confirmPassword) newErrors.confirmPassword = 'Şifreler eşleşmiyor';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const mutation = useMutation({
    mutationFn: async () => authService.register(email, password, name),
    onSuccess: (res) => {
      const token = res.data?.data?.token;
      const user = res.data?.data?.user;
      if (token && user) {
        login(token, user);
        navigate('/qr/generate');
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Kayıt başarısız';
      setErrors({ general: message });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      mutation.mutate();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sol Taraf - SmartQR Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="grid grid-cols-8 grid-rows-8 h-full">
            {Array.from({ length: 64 }).map((_, i) => (
              <div key={i} className="border border-white/20" />
            ))}
          </div>
        </div>
        
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          {/* Logo ve Başlık */}
          <div className="mb-12">
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-16 h-16 bg-yellow-400 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-10 h-10 text-slate-900" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 11h8V3H3v8zm2-6h4v4H5V5zm8-2v8h8V3h-8zm6 6h-4V5h4v4zM3 21h8v-8H3v8zm2-6h4v4H5v-4zm8 2h2v2h-2v-2zm2-2h2v2h-2v-2zm2 2h2v2h-2v-2zm2-2h2v2h-2v-2z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight">SmartQR</h1>
                <p className="text-yellow-400 text-sm font-medium">Admin Panel</p>
              </div>
            </div>
            
            <h2 className="text-5xl font-bold mb-6 leading-tight">
              Hesabınızı Oluşturun
              <br />
              <span className="text-yellow-400">ve Hemen Başlayın</span>
            </h2>
            <p className="text-slate-300 text-xl leading-relaxed max-w-lg">
              Dinamik QR kodları, gerçek zamanlı analitikler ve profesyonel yönetim paneli ile kampanyalarınızı güçlendirin.
            </p>
          </div>

          {/* Özellikler */}
          <div className="space-y-6">
            <div className="flex items-start space-x-4 group">
              <div className="w-12 h-12 bg-yellow-400/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-yellow-400/30 transition-colors">
                <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Gerçek Zamanlı Analitikler</h3>
                <p className="text-slate-400 text-sm">Tıklama, cihaz ve tarayıcı istatistiklerini takip edin</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 group">
              <div className="w-12 h-12 bg-yellow-400/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-yellow-400/30 transition-colors">
                <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Kurumsal Güvenlik</h3>
                <p className="text-slate-400 text-sm">JWT tabanlı kimlik doğrulama ve güvenli erişim</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 group">
              <div className="w-12 h-12 bg-yellow-400/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-yellow-400/30 transition-colors">
                <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Detaylı Raporlama</h3>
                <p className="text-slate-400 text-sm">Performans metrikleri ve trend analizleri</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">10K+</div>
              <div className="text-slate-400 text-sm">QR Kodu</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">99.9%</div>
              <div className="text-slate-400 text-sm">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">24/7</div>
              <div className="text-slate-400 text-sm">Destek</div>
            </div>
          </div>
        </div>

        {/* Dekoratif Elementler */}
        <div className="absolute top-10 right-10 w-40 h-40 bg-yellow-400/5 backdrop-blur-sm rounded-3xl transform rotate-12 border border-yellow-400/10" />
        <div className="absolute bottom-20 left-10 w-32 h-32 bg-yellow-400/5 backdrop-blur-sm rounded-2xl transform -rotate-6 border border-yellow-400/10" />
        <div className="absolute top-1/3 right-1/4 w-20 h-20 bg-yellow-400/5 backdrop-blur-sm rounded-xl transform rotate-45 border border-yellow-400/10" />
      </div>

      {/* Sağ Taraf - Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 py-12 bg-white">
        <div className="w-full max-w-lg">
          {/* Header - Enhanced Visibility */}
          <div className="text-center mb-10 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-14 h-14 bg-yellow-400 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-slate-900" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 11h8V3H3v8zm2-6h4v4H5V5zm8-2v8h8V3h-8zm6 6h-4V5h4v4zM3 21h8v-8H3v8zm2-6h4v4H5v-4zm8 2h2v2h-2v-2zm2-2h2v2h-2v-2zm2 2h2v2h-2v-2zm2-2h2v2h-2v-2z"/>
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-slate-900">SmartQR</h1>
            </div>
            <h2 className="text-4xl font-bold text-slate-900 mb-3">Hesap Oluştur</h2>
            <p className="text-lg text-slate-600">Birkaç adımda hesabınızı oluşturun</p>
          </div>

          {/* Register Form */}
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Üye Ol</h3>
              <p className="text-slate-600">Admin panel erişimi için kayıt olun</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Ad Soyad</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Adınız Soyadınız"
                    required
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 text-base"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">E-posta Adresi</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ornek@email.com"
                    required
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 text-base"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Şifre</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 text-base"
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Şifre Onayı</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 text-base"
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>

              {errors.general && (
                <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {errors.general}
                </div>
              )}

              <button
                type="submit"
                disabled={mutation.isPending || !email || !password || !name || !confirmPassword}
                className="w-full py-4 text-lg font-semibold bg-yellow-400 text-slate-900 rounded-lg hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
              >
                {mutation.isPending ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-slate-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Kaydediliyor...
                  </span>
                ) : (
                  'Üye Ol'
                )}
              </button>

              <div className="text-center pt-4 border-t border-slate-200">
                <span className="text-sm text-slate-600">Zaten hesabınız var mı?</span>
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="ml-1 text-sm text-yellow-600 hover:text-yellow-700 font-medium transition-colors"
                >
                  Giriş Yap
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
