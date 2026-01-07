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
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 text-center">
          <div className="text-lg font-semibold text-slate-900">SmartQR Kayıt</div>
          <div className="text-sm text-slate-600">Hesabınızı oluşturun</div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            label="Ad"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
          />
          <Input
            label="E-posta"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
          />
          <Input
            label="Şifre"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
          />
          <Input
            label="Şifre Onayı"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={errors.confirmPassword}
          />

          {errors.general && (
            <div className="rounded-md border border-rose-200 bg-rose-50 p-2 text-xs text-rose-700">
              {errors.general}
            </div>
          )}

          <Button
            type="submit"
            fullWidth
            disabled={mutation.isPending || !email || !password || !name || !confirmPassword}
          >
            {mutation.isPending ? 'Kaydediliyor...' : 'Kayıt Ol'}
          </Button>

          <div className="text-center">
            <span className="text-sm text-slate-600">Zaten hesabınız var mı?</span>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="ml-1 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Giriş Yap
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
