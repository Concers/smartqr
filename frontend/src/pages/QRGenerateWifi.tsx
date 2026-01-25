import { useEffect, useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { AdminLayout } from '../components/Layout/AdminLayout';
import { Input } from '../components/Common/Input';
import { Button } from '../components/Common/Button';
import { QRResult, QRResultData } from '../components/QRGenerator/QRResult';
import { useAuth } from '../hooks/useAuth';
import { qrService } from '../services/qrService';

type Security = 'WPA' | 'WEP' | 'nopass';

export default function QRGenerateWifiPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [ssid, setSsid] = useState('');
  const [password, setPassword] = useState('');
  const [security, setSecurity] = useState<Security>('WPA');
  const [hidden, setHidden] = useState(false);
  const [customCode, setCustomCode] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState<QRResultData | null>(null);

  useEffect(() => {
    if (!isAuthenticated) navigate('/login');
  }, [isAuthenticated, navigate]);

  const wifiPayload = useMemo(() => {
    const s = ssid.trim();
    if (!s) return '';
    const pass = security === 'nopass' ? '' : password;
    const h = hidden ? 'true' : 'false';
    return `WIFI:T:${security};S:${s};P:${pass};H:${h};;`;
  }, [ssid, password, security, hidden]);

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await qrService.generate(wifiPayload, customCode.trim() || undefined, expiresAt || undefined);
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
                <div className="text-xl font-bold text-slate-900">WiFi QR</div>
                <div className="text-sm text-slate-500 mt-1">Tarayınca cihazda “Ağa Katıl” seçeneği çıkması hedeflenir.</div>
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
              <Input label="WiFi Adı (SSID)" placeholder="Ağ adı" value={ssid} onChange={(e) => setSsid(e.target.value)} />
              <Input label="Şifre" placeholder="Şifre" value={password} onChange={(e) => setPassword(e.target.value)} />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Güvenlik</div>
                  <select
                    value={security}
                    onChange={(e) => setSecurity(e.target.value as Security)}
                    className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20"
                  >
                    <option value="WPA">WPA/WPA2</option>
                    <option value="WEP">WEP</option>
                    <option value="nopass">Şifresiz</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input type="checkbox" checked={hidden} onChange={(e) => setHidden(e.target.checked)} className="h-4 w-4" />
                  <div className="text-sm text-slate-700">Gizli ağ</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Custom Code (opsiyonel)" placeholder="ornek-kod" value={customCode} onChange={(e) => setCustomCode(e.target.value)} />
                <Input label="Bitiş Tarihi (opsiyonel)" type="datetime-local" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
              </div>

              <div className="rounded-md bg-slate-50 p-3 text-xs text-slate-600">
                <div className="font-semibold text-slate-700">Payload</div>
                <div className="mt-1 break-all">{wifiPayload || 'SSID girince oluşur'}</div>
              </div>

              {error ? (
                <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>
              ) : null}

              <Button
                fullWidth
                disabled={!wifiPayload || mutation.isPending}
                onClick={() => {
                  setError('');
                  setResult(null);
                  if (!wifiPayload) {
                    setError('SSID zorunlu');
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
