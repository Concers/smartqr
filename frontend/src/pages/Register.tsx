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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-slate-50 flex">
      {/* Sol Taraf - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="grid grid-cols-8 grid-rows-8 h-full">
            {Array.from({ length: 64 }).map((_, i) => (
              <div key={i} className="border border-white/20" />
            ))}
          </div>
        </div>

        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="mb-12">
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 11h8V3H3v8zm2-6h4v4H5V5zm8-2v8h8V3h-8zm6 6h-4V5h4v4zM3 21h8v-8H3v8zm2-6h4v4H5v-4zm8 2h2v2h-2v-2zm2-2h2v2h-2v-2zm2 2h2v2h-2v-2zm2-2h2v2h-2v-2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight">Smart QR Manager</h1>
                <p className="text-emerald-200 text-sm font-medium">Profesyonel QR Kod Yönetimi</p>
              </div>
            </div>

            <h2 className="text-5xl font-bold mb-6 leading-tight">
              Hesabınızı Oluşturun
              <br />
              <span className="text-emerald-300">ve Hemen Başlayın</span>
            </h2>
            <p className="text-emerald-100 text-xl leading-relaxed max-w-lg">
              Dinamik QR kodları, gerçek zamanlı analitikler ve profesyonel yönetim paneli ile kampanyalarınızı güçlendirin.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start space-x-4 group">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-white/30 transition-colors">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Gerçek Zamanlı Analitikler</h3>
                <p className="text-emerald-200 text-sm">Tıklama, cihaz ve tarayıcı istatistiklerini takip edin</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 group">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-white/30 transition-colors">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Kurumsal Güvenlik</h3>
                <p className="text-emerald-200 text-sm">JWT tabanlı kimlik doğrulama ve güvenli erişim</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 group">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-white/30 transition-colors">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Detaylı Raporlama</h3>
                <p className="text-emerald-200 text-sm">Performans metrikleri ve trend analizleri</p>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute top-10 right-10 w-40 h-40 bg-white/5 backdrop-blur-sm rounded-3xl transform rotate-12 border border-white/10" />
        <div className="absolute bottom-20 left-10 w-32 h-32 bg-white/5 backdrop-blur-sm rounded-2xl transform -rotate-6 border border-white/10" />
        <div className="absolute top-1/3 right-1/4 w-20 h-20 bg-white/5 backdrop-blur-sm rounded-xl transform rotate-45 border border-white/10" />
      </div>

      {/* Sağ Taraf - Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 11h8V3H3v8zm2-6h4v4H5V5zm8-2v8h8V3h-8zm6 6h-4V5h4v4zM3 21h8v-8H3v8zm2-6h4v4H5v-4zm8 2h2v2h-2v-2zm2-2h2v2h-2v-2zm2 2h2v2h-2v-2zm2-2h2v2h-2v-2z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-slate-900">Smart QR Manager</h1>
            </div>
            <h2 className="text-4xl font-bold text-slate-900 mb-3">Hesap Oluştur</h2>
            <p className="text-lg text-slate-600">Birkaç adımda hesabınızı oluşturun</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-5">
              <Input
                label="Ad Soyad"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Adınız Soyadınız"
                required
                error={errors.name}
                className="py-3 text-base"
              />
              <Input
                label="E-posta Adresi"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@email.com"
                required
                error={errors.email}
                className="py-3 text-base"
              />
              <Input
                label="Şifre"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                error={errors.password}
                className="py-3 text-base"
              />
              <Input
                label="Şifre Onayı"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                error={errors.confirmPassword}
                className="py-3 text-base"
              />
            </div>

            {errors.general && (
              <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                {errors.general}
              </div>
            )}

            <Button
              type="submit"
              fullWidth
              disabled={mutation.isPending || !email || !password || !name || !confirmPassword}
              className="py-4 text-lg font-semibold bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-lg"
            >
              {mutation.isPending ? 'Kaydediliyor...' : 'Üye Ol'}
            </Button>

            <div className="text-center pt-4 border-t border-slate-200">
              <span className="text-sm text-slate-600">Zaten hesabınız var mı?</span>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="ml-1 text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
              >
                Giriş Yap
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
