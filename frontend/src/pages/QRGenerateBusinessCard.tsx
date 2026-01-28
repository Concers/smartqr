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

export default function QRGenerateBusinessCardPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [address, setAddress] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState<QRResultData | null>(null);

  useEffect(() => {
    if (!isAuthenticated) navigate('/login');
  }, [isAuthenticated, navigate]);

  const buildBusinessCardDataUri = () => {
    const html = `<!doctype html>
<html lang="tr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>İş Kartı</title>
  <style>
    body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;background:#0f172a;margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px}
    .card{width:100%;max-width:420px;background:#ffffff;border-radius:18px;box-shadow:0 20px 60px rgba(0,0,0,.25);overflow:hidden}
    .hdr{padding:20px;background:linear-gradient(135deg,#0f172a,#1e293b);color:#fff;text-align:center}
    .name{margin:0;font-size:20px;font-weight:800}
    .title{margin:4px 0 0;font-size:14px;opacity:.9}
    .company{margin:4px 0 0;font-size:12px;opacity:.75}
    .info{padding:20px}
    .item{display:flex;align-items:center;margin-bottom:16px;color:#0f172a}
    .item:last-child{margin-bottom:0}
    .label{font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:2px}
    .value{font-size:14px;font-weight:500}
    .link{color:#3b82f6;text-decoration:none}
    .link:hover{text-decoration:underline}
    .actions{padding:0 20px 20px;display:grid;grid-template-columns:1fr 1fr;gap:10px}
    .btn{display:flex;align-items:center;justify-content:center;padding:10px;border-radius:8px;text-decoration:none;font-weight:600;font-size:12px;border:1px solid #e2e8f0;background:#fff;color:#0f172a}
    .btn:hover{background:#f8fafc}
    .btn.primary{background:#3b82f6;color:#fff;border-color:#3b82f6}
    .btn.primary:hover{background:#2563eb}
  </style>
</head>
<body>
  <div class="card">
    <div class="hdr">
      <h1 class="name">${name || 'İsim Soyisim'}</h1>
      <div class="title">${title || 'Unvan'}</div>
      <div class="company">${company || 'Şirket'}</div>
    </div>
    <div class="info">
      ${email ? `
      <div class="item">
        <div>
          <div class="label">E-posta</div>
          <div class="value"><a href="mailto:${email}" class="link">${email}</a></div>
        </div>
      </div>` : ''}
      ${phone ? `
      <div class="item">
        <div>
          <div class="label">Telefon</div>
          <div class="value"><a href="tel:${phone}" class="link">${phone}</a></div>
        </div>
      </div>` : ''}
      ${website ? `
      <div class="item">
        <div>
          <div class="label">Web Sitesi</div>
          <div class="value"><a href="${website}" target="_blank" class="link">${website}</a></div>
        </div>
      </div>` : ''}
      ${address ? `
      <div class="item">
        <div>
          <div class="label">Adres</div>
          <div class="value">${address}</div>
        </div>
      </div>` : ''}
      ${linkedin ? `
      <div class="item">
        <div>
          <div class="label">LinkedIn</div>
          <div class="value"><a href="${linkedin}" target="_blank" class="link">${linkedin}</a></div>
        </div>
      </div>` : ''}
    </div>
    ${phone || email ? `
    <div class="actions">
      ${phone ? `<a href="tel:${phone}" class="btn primary">Ara</a>` : ''}
      ${email ? `<a href="mailto:${email}" class="btn">E-posta Gönder</a>` : ''}
    </div>` : ''}
  </div>
</body>
</html>`;
    return `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
  };

  const destinationUrl = useMemo(() => {
    if (!name && !email && !phone && !website) return '';
    return buildBusinessCardDataUri();
  }, [name, email, phone, website, title, company, address, linkedin]);

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
                <div className="text-xl font-bold text-slate-900">İş Kartı</div>
                <div className="text-sm text-slate-500 mt-1">Profesyonel iş kartı QR kodu oluşturun.</div>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="İsim Soyisim*" placeholder="Ahmet Yılmaz" value={name} onChange={(e) => setName(e.target.value)} />
                <Input label="Unvan" placeholder="Yazılım Geliştirici" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>

              <Input label="Şirket" placeholder="ABC Teknoloji A.Ş." value={company} onChange={(e) => setCompany(e.target.value)} />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="E-posta" placeholder="ornek@firma.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                <Input label="Telefon" placeholder="+90 555 123 45 67" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>

              <Input label="Web Sitesi" placeholder="https://www.firma.com" value={website} onChange={(e) => setWebsite(e.target.value)} />
              
              <Input label="Adres" placeholder="Mahalle Sokak No:1, İstanbul" value={address} onChange={(e) => setAddress(e.target.value)} />
              
              <Input label="LinkedIn" placeholder="https://linkedin.com/in/kullanici" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} />

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
