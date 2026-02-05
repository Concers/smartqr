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

type Mode = 'landing' | 'direct';
type Platform = 'instagram' | 'facebook' | 'x';

export default function QRGenerateSocialPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [mode, setMode] = useState<Mode>('landing');
  const [directPlatform, setDirectPlatform] = useState<Platform>('instagram');
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');
  const [x, setX] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState<QRResultData | null>(null);

  useEffect(() => {
    if (!isAuthenticated) navigate('/login');
  }, [isAuthenticated, navigate]);

  const normalize = (platform: Platform, raw: string) => {
    const v = (raw || '').trim();
    if (!v) return '';
    if (/^https?:\/\//i.test(v)) return v;
    const handle = v.replace(/^@/, '').trim();
    if (!handle) return '';
    if (platform === 'facebook') return `https://www.facebook.com/${handle}`;
    if (platform === 'instagram') return `https://www.instagram.com/${handle}`;
    return `https://x.com/${handle}`;
  };

  const buildLandingDataUri = (links: { label: string; url: string }[]) => {
    const safeLinks = links.filter((l) => l.url);
    const html = `<!doctype html>
<html lang="tr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Sosyal Medya</title>
  <style>
    body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;background:#0f172a;margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px}
    .card{width:100%;max-width:420px;background:#ffffff;border-radius:18px;box-shadow:0 20px 60px rgba(0,0,0,.25);overflow:hidden}
    .hdr{padding:18px 18px 10px;background:linear-gradient(135deg,#0f172a,#1e293b);color:#fff}
    .ttl{margin:0;font-size:18px;font-weight:800}
    .sub{margin:6px 0 0;font-size:12px;opacity:.85}
    .btns{padding:14px 18px 18px;display:grid;gap:10px}
    a{display:flex;align-items:center;justify-content:center;text-decoration:none;font-weight:700;border-radius:12px;padding:12px 14px;border:1px solid #e2e8f0;color:#0f172a;background:#fff}
    a:hover{background:#f8fafc}
  </style>
</head>
<body>
  <div class="card">
    <div class="hdr">
      <h1 class="ttl">Sosyal Medya</h1>
      <div class="sub">Bir platform seçin</div>
    </div>
    <div class="btns">
      ${safeLinks.map((l) => `<a href="${l.url}">${l.label}</a>`).join('')}
    </div>
  </div>
</body>
</html>`;
    return `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
  };

  const destinationUrl = useMemo(() => {
    const instagramUrl = normalize('instagram', instagram);
    const facebookUrl = normalize('facebook', facebook);
    const xUrl = normalize('x', x);

    const links = [
      { label: 'Instagram', url: instagramUrl },
      { label: 'Facebook', url: facebookUrl },
      { label: 'X', url: xUrl },
    ].filter((l) => l.url);

    if (mode === 'landing') {
      if (links.length === 0) return '';
      return buildLandingDataUri(links);
    }

    const directUrl =
      directPlatform === 'instagram'
        ? instagramUrl
        : directPlatform === 'facebook'
          ? facebookUrl
          : xUrl;

    return directUrl;
  }, [mode, directPlatform, instagram, facebook, x]);

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await qrService.generate(destinationUrl, customCode.trim() || undefined, expiresAt || undefined);
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
                <div className="text-xl font-bold text-slate-900">Sosyal Medya</div>
                <div className="text-sm text-slate-500 mt-1">Landing veya direkt yönlendirme seçebilirsiniz.</div>
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
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="text-sm font-semibold text-slate-900">Yönlendirme</div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    className={`h-10 rounded-lg border text-sm font-semibold ${mode === 'landing' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
                    onClick={() => setMode('landing')}
                  >
                    Landing
                  </button>
                  <button
                    type="button"
                    className={`h-10 rounded-lg border text-sm font-semibold ${mode === 'direct' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
                    onClick={() => setMode('direct')}
                  >
                    Direkt
                  </button>
                </div>

                {mode === 'direct' ? (
                  <div className="mt-3">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Direkt platform</div>
                    <select
                      value={directPlatform}
                      onChange={(e) => setDirectPlatform(e.target.value as Platform)}
                      className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20"
                    >
                      <option value="instagram">Instagram</option>
                      <option value="facebook">Facebook</option>
                      <option value="x">X</option>
                    </select>
                  </div>
                ) : null}
              </div>

              <Input label="Instagram" placeholder="@kullaniciadi veya https://instagram.com/..." value={instagram} onChange={(e) => setInstagram(e.target.value)} />
              <Input label="Facebook" placeholder="kullaniciadi veya https://facebook.com/..." value={facebook} onChange={(e) => setFacebook(e.target.value)} />
              <Input label="X" placeholder="@kullaniciadi veya https://x.com/..." value={x} onChange={(e) => setX(e.target.value)} />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Custom Code (opsiyonel)" placeholder="ornek-kod" value={customCode} onChange={(e) => setCustomCode(e.target.value)} />
                <Input label="Bitiş Tarihi (opsiyonel)" type="datetime-local" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
              </div>

              {error ? (
                <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>
              ) : null}

              <Button
                fullWidth
                disabled={!destinationUrl || mutation.isPending}
                onClick={() => {
                  setError('');
                  setResult(null);
                  if (!destinationUrl) return;
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
