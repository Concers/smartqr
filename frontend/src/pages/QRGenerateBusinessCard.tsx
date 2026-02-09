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
import BusinessCardPhone from '../components/BusinessCard/BusinessCardPhone';

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

  const formatPhone = (value: string): string => {
    const digits = value.replace(/\D/g, '');
    if (digits.length === 0) return '';
    let formatted = '+';
    if (digits.length <= 2) return `+${digits}`;
    formatted += digits.slice(0, 2) + ' ';
    if (digits.length <= 5) return formatted + digits.slice(2);
    formatted += digits.slice(2, 5) + ' ';
    if (digits.length <= 8) return formatted + digits.slice(5);
    formatted += digits.slice(5, 8) + ' ';
    if (digits.length <= 10) return formatted + digits.slice(8);
    formatted += digits.slice(8, 10) + ' ';
    formatted += digits.slice(10, 12);
    return formatted.trim();
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value));
  };

  const stripProtocol = (url: string): string => {
    return url.replace(/^https?:\/\//i, '');
  };

  useEffect(() => {
    if (!isAuthenticated) navigate('/login');
  }, [isAuthenticated, navigate]);

  const buildBusinessCardDataUri = () => {
    const initial = (name || '?').charAt(0).toUpperCase();
    const iconPhone = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`;
    const iconMail = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>`;
    const iconGlobe = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>`;
    const iconPin = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`;
    const iconLinkedin = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>`;
    const iconUserPlus = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>`;

    const quickBtns = [
      phone ? `<a href="tel:${phone}" class="qb">${iconPhone}</a>` : '',
      email ? `<a href="mailto:${email}" class="qb">${iconMail}</a>` : '',
      website ? `<a href="https://${website}" target="_blank" rel="noopener" class="qb">${iconGlobe}</a>` : '',
      linkedin ? `<a href="https://${linkedin}" target="_blank" rel="noopener" class="qb">${iconLinkedin}</a>` : '',
    ].filter(Boolean).join('');

    const infoRows = [
      email ? `<a href="mailto:${email}" class="row"><div class="ri">${iconMail}</div><div class="rc"><p class="rl">E-posta</p><p class="rv">${email}</p></div></a>` : '',
      phone ? `<a href="tel:${phone}" class="row"><div class="ri">${iconPhone}</div><div class="rc"><p class="rl">Telefon</p><p class="rv">${phone}</p></div></a>` : '',
      address ? `<a href="https://maps.google.com/?q=${encodeURIComponent(address)}" target="_blank" rel="noopener" class="row"><div class="ri">${iconPin}</div><div class="rc"><p class="rl">Konum</p><p class="rv">${address}</p></div></a>` : '',
      website ? `<a href="https://${website}" target="_blank" rel="noopener" class="row"><div class="ri">${iconGlobe}</div><div class="rc"><p class="rl">Web Sitesi</p><p class="rv">${website}</p></div></a>` : '',
      linkedin ? `<a href="https://${linkedin}" target="_blank" rel="noopener" class="row"><div class="ri">${iconLinkedin}</div><div class="rc"><p class="rl">LinkedIn</p><p class="rv">${linkedin}</p></div></a>` : '',
    ].filter(Boolean).join('');

    const html = `<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${name || 'İş Kartı'}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;background:linear-gradient(to bottom,#fff,#fafafa,#f5f5f7);min-height:100vh;display:flex;flex-direction:column;align-items:center;padding:0}
.bg1{position:fixed;top:0;left:0;right:0;height:160px;background:linear-gradient(to bottom,rgba(219,234,254,.6),rgba(199,210,254,.3),transparent);pointer-events:none}
.bg2{position:fixed;top:64px;left:50%;transform:translateX(-50%);width:160px;height:160px;background:linear-gradient(to bottom right,rgba(191,219,254,.4),rgba(199,210,254,.3));border-radius:50%;filter:blur(48px);pointer-events:none}
.wrap{position:relative;z-index:10;width:100%;max-width:400px;display:flex;flex-direction:column;padding:56px 20px 24px;min-height:100vh}
.avatar{width:80px;height:80px;border-radius:50%;background:linear-gradient(to bottom right,#dbeafe,#c7d2fe);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;box-shadow:0 15px 30px -8px rgba(99,102,241,.35);font-size:32px;font-weight:700;color:#2563eb}
.nm{font-size:20px;font-weight:600;color:#0f172a;text-align:center;margin-bottom:2px;letter-spacing:-.02em}
.tt{font-size:13px;font-weight:500;color:rgba(37,99,235,.9);text-align:center;margin-bottom:2px}
.co{font-size:11px;color:#94a3b8;text-align:center;letter-spacing:.04em}
.qbs{display:flex;justify-content:center;gap:12px;margin:20px 0}
.qb{width:40px;height:40px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;text-decoration:none;color:#64748b;box-shadow:0 4px 15px -4px rgba(0,0,0,.12);transition:transform .3s,color .3s}
.qb:hover{transform:translateY(-2px);color:#2563eb}
.card{flex:1;border-radius:16px;background:#fff;padding:16px;box-shadow:0 10px 30px -10px rgba(0,0,0,.1)}
.rows{display:flex;flex-direction:column;gap:4px}
.row{display:flex;align-items:center;gap:12px;padding:10px;border-radius:12px;text-decoration:none;color:inherit;transition:background .3s}
.row:hover{background:linear-gradient(to right,rgba(219,234,254,.8),rgba(224,231,255,.5))}
.ri{width:32px;height:32px;border-radius:12px;background:linear-gradient(to bottom right,#eff6ff,rgba(199,210,254,.8));display:flex;align-items:center;justify-content:center;color:#2563eb;flex-shrink:0}
.rc{flex:1;min-width:0}
.rl{font-size:9px;color:#94a3b8;text-transform:uppercase;letter-spacing:.1em;margin-bottom:2px}
.rv{font-size:12px;color:#0f172a;font-weight:500;word-break:break-word}
.cta{margin-top:16px}
.vcf-link{display:flex;width:100%;padding:12px;border:none;border-radius:12px;background:linear-gradient(to right,#2563eb,#4f46e5);color:#fff;font-size:14px;font-weight:600;cursor:pointer;align-items:center;justify-content:center;gap:8px;box-shadow:0 10px 25px -8px rgba(99,102,241,.5);transition:transform .3s;text-decoration:none}
.vcf-link:hover{transform:translateY(-1px)}
.footer{text-align:center;margin-top:20px;padding:8px 0}
.footer a{font-size:10px;color:#94a3b8;text-decoration:none;letter-spacing:.04em}
.footer a:hover{color:#64748b}
</style>
</head>
<body>
<div class="bg1"></div>
<div class="bg2"></div>
<div class="wrap">
  <div class="avatar">${initial}</div>
  <h1 class="nm">${name || 'İsim Soyisim'}</h1>
  <p class="tt">${title || 'Unvan'}</p>
  <p class="co">${company || 'Şirket'}</p>
  ${quickBtns ? `<div class="qbs">${quickBtns}</div>` : ''}
  <div class="card">
    <div class="rows">${infoRows}</div>
  </div>
  <div class="cta">
    <a href="${(() => {
      const p = new URLSearchParams();
      if (name) p.set('name', name);
      if (title) p.set('title', title);
      if (company) p.set('company', company);
      if (email) p.set('email', email);
      if (phone) p.set('phone', phone);
      if (address) p.set('address', address);
      if (website) p.set('website', website);
      if (linkedin) p.set('linkedin', linkedin);
      return `https://netqr.io/api/vcard?${p.toString()}`;
    })()}" class="vcf-link">${iconUserPlus} Rehbere Ekle</a>
  </div>
  <div class="footer"><a href="https://netqr.io">netqr.io</a></div>
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

  const cardData = useMemo(() => ({
    name, title, company, email, phone, website, address, linkedin,
  }), [name, title, company, email, phone, website, address, linkedin]);

  return (
    <AdminLayout>
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="flex items-center justify-between mb-6">
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

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Sol: Form */}
            <div className="lg:col-span-3">
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label="İsim Soyisim*" placeholder="Ahmet Yılmaz" value={name} onChange={(e) => setName(e.target.value)} />
                    <Input label="Unvan" placeholder="Yazılım Geliştirici" value={title} onChange={(e) => setTitle(e.target.value)} />
                  </div>

                  <Input label="Şirket" placeholder="ABC Teknoloji A.Ş." value={company} onChange={(e) => setCompany(e.target.value)} />
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label="E-posta" placeholder="ornek@firma.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                    <Input label="Telefon" placeholder="+90 555 123 45 67" value={phone} onChange={handlePhoneChange} inputMode="tel" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">Web Sitesi</label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-slate-50 text-slate-500 text-sm">https://</span>
                      <input
                        className="flex h-10 w-full rounded-r-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        placeholder="www.firma.com"
                        value={stripProtocol(website)}
                        onChange={(e) => setWebsite(stripProtocol(e.target.value))}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">Adres</label>
                    <textarea
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[80px] resize-y"
                      placeholder="Mahalle Sokak No:1, İlçe, İstanbul"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">LinkedIn</label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-slate-50 text-slate-500 text-sm">https://</span>
                      <input
                        className="flex h-10 w-full rounded-r-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        placeholder="linkedin.com/in/kullanici"
                        value={stripProtocol(linkedin)}
                        onChange={(e) => setLinkedin(stripProtocol(e.target.value))}
                      />
                    </div>
                  </div>

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

            {/* Sağ: Canlı Önizleme */}
            <div className="lg:col-span-2">
              <div className="sticky top-24">
                <p className="text-sm font-medium text-slate-500 mb-4 text-center">Canlı Önizleme</p>
                <div className="flex justify-center">
                  <BusinessCardPhone data={cardData} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
