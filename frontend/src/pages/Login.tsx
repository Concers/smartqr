import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { Input } from '../components/Common/Input';
import { Button } from '../components/Common/Button';
import { authService } from '../services/authService';
import { useAuth } from '../hooks/useAuth';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const mutation = useMutation({
    mutationFn: async () => authService.login(email, password),
    onSuccess: (res) => {
      const token = res.data?.data?.token;
      const user = res.data?.data?.user;
      if (token && user) {
        login(token, user);
        navigate('/qr/generate');
      }
    },
    onError: (error: any) => {
      console.error('Login error:', error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-slate-50 flex">
      {/* Sol Taraf - SmartQR Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-900 relative overflow-hidden">
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
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 11h8V3H3v8zm2-6h4v4H5V5zm8-2v8h8V3h-8zm6 6h-4V5h4v4zM3 21h8v-8H3v8zm2-6h4v4H5v-4zm8 2h2v2h-2v-2zm2-2h2v2h-2v-2zm2 2h2v2h-2v-2zm2-2h2v2h-2v-2z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight">Smart QR Manager</h1>
                <p className="text-emerald-200 text-sm font-medium">Profesyonel QR Kod Yönetimi</p>
              </div>
            </div>
            
            <h2 className="text-5xl font-bold mb-6 leading-tight">
              Dinamik QR Kodlarıyla
              <br />
              <span className="text-emerald-300">Dijital Dönüşüm</span>
            </h2>
            <p className="text-emerald-100 text-xl leading-relaxed max-w-lg">
              Akıllı QR kodları oluşturun, gerçek zamanlı performans takibi yapın ve 
              pazarlama kampanyalarınızı veri odaklı optimize edin.
            </p>
          </div>

          {/* Özellikler */}
          <div className="space-y-6">
            <div className="flex items-start space-x-4 group">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-white/30 transition-colors">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Gerçek Zamanlı Analitikler</h3>
                <p className="text-emerald-200 text-sm">Tıklama, cihaz ve coğrafi verileri anlık takip edin</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4 group">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-white/30 transition-colors">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Kurumsal Güvenlik</h3>
                <p className="text-emerald-200 text-sm">JWT tabanlı kimlik doğrulama ve SSL şifreleme</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4 group">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-white/30 transition-colors">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Detaylı Raporlama</h3>
                <p className="text-emerald-200 text-sm">Performans metrikleri ve trend analizleri</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">10K+</div>
              <div className="text-emerald-200 text-sm">QR Kodu</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">99.9%</div>
              <div className="text-emerald-200 text-sm">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">24/7</div>
              <div className="text-emerald-200 text-sm">Destek</div>
            </div>
          </div>
        </div>

        {/* Dekoratif Elementler */}
        <div className="absolute top-10 right-10 w-40 h-40 bg-white/5 backdrop-blur-sm rounded-3xl transform rotate-12 border border-white/10" />
        <div className="absolute bottom-20 left-10 w-32 h-32 bg-white/5 backdrop-blur-sm rounded-2xl transform -rotate-6 border border-white/10" />
        <div className="absolute top-1/3 right-1/4 w-20 h-20 bg-white/5 backdrop-blur-sm rounded-xl transform rotate-45 border border-white/10" />
      </div>

      {/* Sağ Taraf - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 11h8V3H3v8zm2-6h4v4H5V5zm8-2v8h8V3h-8zm6 6h-4V5h4v4zM3 21h8v-8H3v8zm2-6h4v4H5v-4zm8 2h2v2h-2v-2zm2-2h2v2h-2v-2zm2 2h2v2h-2v-2zm2-2h2v2h-2v-2z"/>
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-slate-900">Smart QR Manager</h1>
            </div>
            <h2 className="text-4xl font-bold text-slate-900 mb-3">Tekrar Hoş Geldiniz</h2>
            <p className="text-lg text-slate-600">QR kodlarınızı yönetmek için hesabınıza giriş yapın</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-5">
              <Input
                label="E-posta Adresi"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@email.com"
                required
                className="py-3 text-base"
              />
              <Input
                label="Şifre"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="py-3 text-base"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 focus:ring-2"
                />
                <span className="ml-2 text-sm text-slate-600">Beni hatırla</span>
              </label>
              <a href="#" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors">
                Şifrenizi mi unuttunuz?
              </a>
            </div>

            <Button
              type="submit"
              fullWidth
              disabled={mutation.isPending || !email || !password}
              className="py-4 text-lg font-semibold bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-lg"
            >
              {mutation.isPending ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Giriş yapılıyor...
                </span>
              ) : (
                'Giriş Yap'
              )}
            </Button>

            <div className="text-center pt-4 border-t border-slate-200">
              <span className="text-sm text-slate-600">Hesabınız yok mu?</span>
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="ml-1 text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
              >
                Ücretsiz kaydolun
              </button>
            </div>
          </form>

          {/* Demo Hesabı */}
          <div className="mt-10 p-6 bg-gradient-to-r from-emerald-50 to-slate-50 rounded-2xl border border-emerald-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Smart QR Manager Demo Hesabı</h3>
                <p className="text-sm text-slate-600">Sistemi test etmek için kullanabilirsiniz</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">E-posta:</span>
                <code className="bg-white px-3 py-1 rounded text-sm text-slate-900 font-mono">test@smartqr.com</code>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Şifre:</span>
                <code className="bg-white px-3 py-1 rounded text-sm text-slate-900 font-mono">123456</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
