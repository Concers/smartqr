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
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 text-center">
          <div className="text-lg font-semibold text-slate-900">SmartQR Giriş</div>
          <div className="text-sm text-slate-600">QR kodları oluşturmak için giriş yapın</div>
        </div>

        <div className="space-y-3">
          <Input
            label="E-posta"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="Şifre"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="mt-4">
          <Button
            fullWidth
            disabled={mutation.isPending || !email || !password}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? 'Giriş...' : 'Giriş Yap'}
          </Button>
        </div>

        {mutation.isError ? (
          <div className="mt-3 rounded-md border border-rose-200 bg-rose-50 p-2 text-xs text-rose-700">
            Giriş başarısız
          </div>
        ) : null}
      </div>
    </div>
  );
}
