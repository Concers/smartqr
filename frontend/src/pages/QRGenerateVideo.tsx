import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { AdminLayout } from '../components/Layout/AdminLayout';
import { Input } from '../components/Common/Input';
import { Button } from '../components/Common/Button';
import { QRResult, QRResultData } from '../components/QRGenerator/QRResult';
import { useAuth } from '../hooks/useAuth';
import { qrService } from '../services/qrService';

export default function QRGenerateVideoPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [url, setUrl] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState<QRResultData | null>(null);

  useEffect(() => {
    if (!isAuthenticated) navigate('/login');
  }, [isAuthenticated, navigate]);

  const isAllowedVideoUrl = (raw: string) => {
    try {
      const u = new URL(raw);
      const host = u.hostname.toLowerCase();
      if (host === 'youtu.be') return true;
      if (host.endsWith('youtube.com')) return true;
      if (host === 'vimeo.com') return true;
      if (host.endsWith('player.vimeo.com')) return true;
      return false;
    } catch {
      return false;
    }
  };

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await qrService.generate(url.trim(), customCode.trim() || undefined, expiresAt || undefined);
      return res.data;
    },
    onSuccess: (payload: any) => {
      const d = payload?.data;
      if (!d) return;
      setResult({
        shortCode: d.shortCode,
        qrCodeUrl: d.qrCodeUrl,
        qrCodeImageUrl: d.qrCodeImageUrl,
        destinationUrl: d.destinationUrl,
      });
    },
    onError: (e: any) => {
      setError(e?.response?.data?.error || e?.message || 'QR oluşturma hatası');
    },
  });

  return (
    <AdminLayout>
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
        <div className="max-w-3xl mx-auto px-6 py-10">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-xl font-bold text-slate-900">Video QR</div>
                <div className="text-sm text-slate-500 mt-1">YouTube / Vimeo linki girin. Tarayınca video iframe içinde açılır.</div>
              </div>
              <button
                type="button"
                onClick={() => navigate('/qr/generate')}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Geri
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <Input label="Video Link" placeholder="https://www.youtube.com/watch?v=..." value={url} onChange={(e) => setUrl(e.target.value)} />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Custom Code (opsiyonel)" placeholder="ornek-kod" value={customCode} onChange={(e) => setCustomCode(e.target.value)} />
                <Input label="Bitiş Tarihi (opsiyonel)" type="datetime-local" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
              </div>

              {error ? (
                <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>
              ) : null}

              <Button
                fullWidth
                disabled={mutation.isPending}
                onClick={() => {
                  const u = url.trim();
                  setError('');
                  setResult(null);
                  if (!u) {
                    setError('Video linki zorunlu');
                    return;
                  }
                  if (!/^https?:\/\//i.test(u)) {
                    setError('Geçerli bir link girin (http/https)');
                    return;
                  }
                  if (!isAllowedVideoUrl(u)) {
                    setError('Sadece YouTube veya Vimeo linkleri destekleniyor');
                    return;
                  }
                  mutation.mutate();
                }}
              >
                {mutation.isPending ? 'Oluşturuluyor...' : 'QR Oluştur'}
              </Button>
            </div>

            {result ? (
              <div className="mt-6">
                <QRResult data={result} />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
