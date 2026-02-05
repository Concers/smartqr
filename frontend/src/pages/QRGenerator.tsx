import { useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  FileText,
  Globe,
  Image as ImageIcon,
  Link as LinkIcon,
  UserSquare2,
  Video,
  Wifi,
  ArrowLeft,
  Download,
  Calendar,
  Code,
  ChevronRight,
  QrCode,
  LogOut,
} from 'lucide-react';

import { Button } from '../components/Common/Button';
import { Input } from '../components/Common/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { QRGeneratorForm, QRGeneratorFormValues } from '../components/QRGenerator/QRGeneratorForm';
import { QRResult, QRResultData } from '../components/QRGenerator/QRResult';
import { PhonePreview } from '../components/QRGenerator/PhonePreview';
import { QRType, QRTypeCard } from '../components/QRGenerator/QRTypeCard';
import { Stepper } from '../components/QRGenerator/Stepper';
import { useAuth } from '../hooks/useAuth';
import { qrService } from '../services/qrService';
import { AdminLayout } from '../components/Layout/AdminLayout';

export default function QRGeneratorPage({ initialType }: { initialType?: string }) {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<string | null>('website');
  const [result, setResult] = useState<QRResultData | null>(null);

  useEffect(() => {
    if (!initialType) return;
    const t = String(initialType);
    const allowed = ['website', 'pdf', 'links', 'vcard', 'video', 'images', 'wifi'];
    if (allowed.includes(t)) {
      setSelectedType(t);
      setStep(2);
    }
  }, [initialType]);

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [pdfCustomCode, setPdfCustomCode] = useState<string>('');
  const [pdfExpiresAt, setPdfExpiresAt] = useState<string>('');
  const [pdfError, setPdfError] = useState<string>('');

  const [social, setSocial] = useState({
    mode: 'landing' as 'landing' | 'direct',
    directPlatform: 'instagram' as 'instagram' | 'facebook' | 'x',
    facebook: '',
    instagram: '',
    x: '',
    customCode: '',
    expiresAt: '',
  });

  const [video, setVideo] = useState({
    url: '',
    customCode: '',
    expiresAt: '',
  });
  const [videoError, setVideoError] = useState<string>('');

  const [image, setImage] = useState({
    mode: 'upload' as 'upload' | 'url',
    file: null as File | null,
    uploadedUrl: '',
    url: '',
    customCode: '',
    expiresAt: '',
  });
  const [imageError, setImageError] = useState<string>('');

  const imageUploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const res = await qrService.uploadImage(file);
      return res.data;
    },
    onSuccess: (payload: any) => {
      const url = payload?.data?.url;
      if (typeof url === 'string' && url) {
        setImage((s) => ({ ...s, uploadedUrl: url }));
      } else {
        setImageError('Görsel yükleme başarısız');
      }
    },
    onError: (error: any) => {
      setImageError(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          error?.message ||
          'Görsel yükleme hatası'
      );
    },
  });

  const [wifi, setWifi] = useState({
    ssid: '',
    password: '',
    security: 'WPA' as 'WPA' | 'WEP' | 'nopass',
    hidden: false,
    customCode: '',
    expiresAt: '',
  });

  const [vcard, setVcard] = useState({
    firstName: '',
    lastName: '',
    mobile: '',
    phone: '',
    fax: '',
    email: '',
    company: '',
    job: '',
    street: '',
    city: '',
    zip: '',
    state: '',
    country: '',
    website: '',
    customCode: '',
    expiresAt: '',
  });

  const pdfUploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const res = await qrService.uploadPdf(file);
      return res.data;
    },
    onSuccess: (payload: any) => {
      const url = payload?.data?.url;
      if (typeof url === 'string' && url) {
        setPdfUrl(url);
      } else {
        setPdfError('PDF yükleme başarısız');
      }
    },
    onError: (error: any) => {
      setPdfError(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          error?.message ||
          'PDF yükleme hatası'
      );
    },
  });

  const vcardError = useMemo(() => {
    if (selectedType !== 'vcard') return undefined;
    const hasName = !!(vcard.firstName.trim() || vcard.lastName.trim());
    const hasContact = !!(vcard.email.trim() || vcard.mobile.trim() || vcard.phone.trim());
    if (!hasName) return 'İsim alanı zorunlu (Ad veya Soyad)';
    if (!hasContact) return 'İletişim alanı zorunlu (E‑posta veya Telefon)';
    return undefined;
  }, [selectedType, vcard]);

  const buildVCardDataUri = () => {
    const first = vcard.firstName.trim();
    const last = vcard.lastName.trim();

    const lines: string[] = ['BEGIN:VCARD', 'VERSION:3.0'];

    const nValue = `${last};${first};;;`;
    lines.push(`N:${nValue}`);

    const fnValue = `${first}${first && last ? ' ' : ''}${last}`.trim();
    if (fnValue) lines.push(`FN:${fnValue}`);

    const company = vcard.company.trim();
    if (company) lines.push(`ORG:${company}`);

    const job = vcard.job.trim();
    if (job) lines.push(`TITLE:${job}`);

    const mobile = vcard.mobile.trim();
    if (mobile) lines.push(`TEL;TYPE=CELL:${mobile}`);

    const phone = vcard.phone.trim();
    if (phone) lines.push(`TEL;TYPE=WORK:${phone}`);

    const fax = vcard.fax.trim();
    if (fax) lines.push(`TEL;TYPE=FAX:${fax}`);

    const email = vcard.email.trim();
    if (email) lines.push(`EMAIL:${email}`);

    const street = vcard.street.trim();
    const city = vcard.city.trim();
    const state = vcard.state.trim();
    const zip = vcard.zip.trim();
    const country = vcard.country.trim();
    if (street || city || state || zip || country) {
      lines.push(`ADR;TYPE=WORK:;;${street};${city};${state};${zip};${country}`);
    }

    const website = vcard.website.trim();
    if (website) lines.push(`URL:${website}`);

    lines.push('END:VCARD');

    const vcardText = lines.join('\n');
    return `data:text/vcard;charset=utf-8,${encodeURIComponent(vcardText)}`;
  };

  const normalizeSocialUrl = (platform: 'facebook' | 'instagram' | 'x', raw: string) => {
    const v = (raw || '').trim();
    if (!v) return '';
    if (/^https?:\/\//i.test(v)) return v;

    const handle = v.replace(/^@/, '').trim();
    if (!handle) return '';

    if (platform === 'facebook') return `https://www.facebook.com/${handle}`;
    if (platform === 'instagram') return `https://www.instagram.com/${handle}`;
    return `https://x.com/${handle}`;
  };

  const buildSocialLandingDataUri = (links: { label: string; url: string }[]) => {
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

  const buildWifiPayload = (payload: { ssid: string; password: string; security: string; hidden: boolean }) => {
    const ssid = payload.ssid;
    const pass = payload.password;
    const security = payload.security;
    const hidden = payload.hidden ? 'true' : 'false';
    return `WIFI:T:${security};S:${ssid};P:${pass};H:${hidden};;`;
  };

  const compressImage = async (file: File) => {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('File read error'));
      reader.readAsDataURL(file);
    });

    const imgEl = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Image load error'));
      img.src = dataUrl;
    });

    const max = 1600;
    const w = imgEl.naturalWidth || imgEl.width;
    const h = imgEl.naturalHeight || imgEl.height;
    const scale = Math.min(1, max / Math.max(w, h));
    const outW = Math.max(1, Math.round(w * scale));
    const outH = Math.max(1, Math.round(h * scale));

    const canvas = document.createElement('canvas');
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas not supported');
    ctx.drawImage(imgEl, 0, 0, outW, outH);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => {
          if (!b) reject(new Error('Compress failed'));
          else resolve(b);
        },
        'image/jpeg',
        0.75
      );
    });

    return new File([blob], `image-${Date.now()}.jpg`, { type: 'image/jpeg' });
  };

  const isAllowedVideoUrl = (url: string) => {
    try {
      const u = new URL(url);
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

  const handleLogout = () => {
    logout();
    navigate('/'); // Redirect to landing page instead of login
  };

  const types: QRType[] = useMemo(
    () => [
      { key: 'website', title: 'İnternet sitesi', subtitle: 'Bir web sitesi URL\'sine bağlantı', Icon: Globe },
      { key: 'pdf', title: 'PDF', subtitle: 'PDF göster', Icon: FileText },
      { key: 'links', title: 'Sosyal Medya', subtitle: 'Sosyal medya hesaplarını paylaşın', Icon: LinkIcon },
      { key: 'vcard', title: 'vCard', subtitle: 'Elektronik kartvizit', Icon: UserSquare2 },
      { key: 'video', title: 'Video', subtitle: 'Bir video göster', Icon: Video },
      { key: 'images', title: 'Görseller', subtitle: 'Birden fazla görsel paylaşın', Icon: ImageIcon },
      { key: 'wifi', title: 'WiFi', subtitle: 'Bir Wi‑Fi ağına bağlanın', Icon: Wifi },
    ],
    []
  );

  const selectedTypeTitle = useMemo(
    () => types.find((t) => t.key === selectedType)?.title,
    [selectedType, types]
  );

  const mutation = useMutation({
    mutationFn: async (values: QRGeneratorFormValues) => {
      const res = await qrService.generate(values.destinationUrl, values.customCode, values.expiresAt);
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
      setStep(4);
    },
    onError: (error: any) => {
      console.error('QR generate error:', {
        message: error?.message,
        status: error?.response?.status,
        data: error?.response?.data,
      });
    },
  });

  const pdfIsBusy = pdfUploadMutation.isPending || mutation.isPending;

  const previewDestinationLabel = useMemo(() => {
    const u = (result?.destinationUrl || '').trim();
    if (!u) return '';
    const lower = u.toLowerCase();
    if (lower.startsWith('data:text/html')) return 'Sosyal Medya Landing (HTML)';
    if (lower.startsWith('data:text/vcard')) return 'vCard (VCF)';
    if (u.length <= 40) return u;
    return `${u.slice(0, 26)}…${u.slice(-10)}`;
  }, [result?.destinationUrl]);

  return (
    <AdminLayout>
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-yellow-200 relative">
        {/* Floating Logout Button (Backup) */}
        <button
          onClick={handleLogout}
          className="fixed top-4 right-4 z-50 p-3 bg-white border border-slate-200 rounded-lg shadow-lg hover:bg-slate-50 transition-colors lg:hidden"
          title="Çıkış Yap"
        >
          <LogOut className="w-5 h-5 text-slate-600" />
        </button>
        
        <main className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* SOL PANEL: Form Alanı */}
        <div className="lg:col-span-7 space-y-8">
          {step === 1 ? (
            <>
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {types.map((t) => (
                    <div
                      key={t.key}
                      onClick={() => setSelectedType(t.key)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedType === t.key
                          ? 'border-yellow-400 bg-yellow-50'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <t.Icon className="w-8 h-8 text-slate-700 mb-3" />
                      <h3 className="font-semibold text-slate-900">{t.title}</h3>
                      <p className="text-sm text-slate-500 mt-1">{t.subtitle}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setStep(2)}
                    disabled={!selectedType}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-slate-200 transition-transform active:scale-[0.98] flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Devam
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          ) : null}

          {step === 2 ? (
            <>
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6">
                {selectedType === 'vcard' ? (
                  <div className="space-y-5">
                    <div className="text-sm font-semibold text-slate-900">vCard QR Code</div>

                    <div className="grid grid-cols-1 gap-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                          label="Ad"
                          placeholder="First name"
                          value={vcard.firstName}
                          onChange={(e) => setVcard((s) => ({ ...s, firstName: e.target.value }))}
                        />
                        <Input
                          label="Soyad"
                          placeholder="Last name"
                          value={vcard.lastName}
                          onChange={(e) => setVcard((s) => ({ ...s, lastName: e.target.value }))}
                        />
                      </div>

                      <Input
                        label="Mobil"
                        placeholder="Mobile"
                        value={vcard.mobile}
                        onChange={(e) => setVcard((s) => ({ ...s, mobile: e.target.value }))}
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                          label="Telefon"
                          placeholder="Phone"
                          value={vcard.phone}
                          onChange={(e) => setVcard((s) => ({ ...s, phone: e.target.value }))}
                        />
                        <Input
                          label="Fax"
                          placeholder="Fax"
                          value={vcard.fax}
                          onChange={(e) => setVcard((s) => ({ ...s, fax: e.target.value }))}
                        />
                      </div>

                      <Input
                        label="E‑posta"
                        placeholder="your@email.com"
                        value={vcard.email}
                        onChange={(e) => setVcard((s) => ({ ...s, email: e.target.value }))}
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                          label="Şirket"
                          placeholder="Company"
                          value={vcard.company}
                          onChange={(e) => setVcard((s) => ({ ...s, company: e.target.value }))}
                        />
                        <Input
                          label="Ünvan"
                          placeholder="Your Job"
                          value={vcard.job}
                          onChange={(e) => setVcard((s) => ({ ...s, job: e.target.value }))}
                        />
                      </div>

                      <Input
                        label="Adres"
                        placeholder="Street"
                        value={vcard.street}
                        onChange={(e) => setVcard((s) => ({ ...s, street: e.target.value }))}
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                          label="Şehir"
                          placeholder="City"
                          value={vcard.city}
                          onChange={(e) => setVcard((s) => ({ ...s, city: e.target.value }))}
                        />
                        <Input
                          label="Posta Kodu"
                          placeholder="ZIP"
                          value={vcard.zip}
                          onChange={(e) => setVcard((s) => ({ ...s, zip: e.target.value }))}
                        />
                      </div>

                      <Input
                        label="Eyalet"
                        placeholder="State"
                        value={vcard.state}
                        onChange={(e) => setVcard((s) => ({ ...s, state: e.target.value }))}
                      />

                      <Input
                        label="Ülke"
                        placeholder="Country"
                        value={vcard.country}
                        onChange={(e) => setVcard((s) => ({ ...s, country: e.target.value }))}
                      />

                      <Input
                        label="Website"
                        placeholder="www.your-website.com"
                        value={vcard.website}
                        onChange={(e) => setVcard((s) => ({ ...s, website: e.target.value }))}
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                          label="Custom Code (opsiyonel)"
                          placeholder="ornek-kod"
                          value={vcard.customCode}
                          onChange={(e) => setVcard((s) => ({ ...s, customCode: e.target.value }))}
                        />
                        <Input
                          label="Bitiş Tarihi (opsiyonel)"
                          type="datetime-local"
                          value={vcard.expiresAt}
                          onChange={(e) => setVcard((s) => ({ ...s, expiresAt: e.target.value }))}
                        />
                      </div>
                    </div>

                    {vcardError ? (
                      <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                        {vcardError}
                      </div>
                    ) : null}

                    <div className="pt-2">
                      <Button
                        fullWidth
                        disabled={!!vcardError || mutation.isPending}
                        onClick={() => {
                          setResult(null);
                          mutation.mutate({
                            destinationUrl: buildVCardDataUri(),
                            customCode: vcard.customCode.trim() || undefined,
                            expiresAt: vcard.expiresAt || undefined,
                          } as QRGeneratorFormValues);
                        }}
                      >
                        {mutation.isPending ? 'Oluşturuluyor...' : 'QR Oluştur'}
                      </Button>
                    </div>
                  </div>
                ) : selectedType === 'pdf' ? (
                  <div className="space-y-5">
                    <div className="text-sm font-semibold text-slate-900">PDF QR Code</div>

                    <div className="grid grid-cols-1 gap-4">
                      <div className="rounded-lg border border-slate-200 bg-white p-4">
                        <div className="text-sm font-semibold text-slate-900 mb-2">PDF Yükle</div>
                        <input
                          type="file"
                          accept="application/pdf,.pdf"
                          onChange={(e) => {
                            const f = e.target.files?.[0] || null;
                            setPdfError('');
                            setPdfUrl('');
                            setPdfFile(null);
                            if (!f) return;
                            if (f.size > 3 * 1024 * 1024) {
                              setPdfError('PDF en fazla 3MB olabilir');
                              return;
                            }
                            setPdfFile(f);
                          }}
                          className="block w-full text-sm text-slate-700 file:mr-4 file:rounded-lg file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-slate-800"
                        />

                        <div className="mt-2 text-xs text-slate-500">Maksimum 3MB</div>

                        <div className="mt-3 flex gap-2">
                          <Button
                            disabled={!pdfFile || pdfUploadMutation.isPending}
                            onClick={() => {
                              if (!pdfFile) return;
                              setPdfError('');
                              pdfUploadMutation.mutate(pdfFile);
                            }}
                          >
                            {pdfUploadMutation.isPending ? 'Yükleniyor...' : 'PDF Yükle'}
                          </Button>
                          {pdfUrl ? (
                            <div className="flex-1 text-xs text-emerald-700 border border-emerald-200 bg-emerald-50 rounded-lg px-3 py-2 break-all">
                              {pdfUrl}
                            </div>
                          ) : null}
                        </div>
                      </div>

                      <Input
                        label="Custom Code (opsiyonel)"
                        placeholder="ornek-kod"
                        value={pdfCustomCode}
                        onChange={(e) => setPdfCustomCode(e.target.value)}
                      />

                      <Input
                        label="Bitiş Tarihi (opsiyonel)"
                        type="datetime-local"
                        value={pdfExpiresAt}
                        onChange={(e) => setPdfExpiresAt(e.target.value)}
                      />
                    </div>

                    {pdfError ? (
                      <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                        {pdfError}
                      </div>
                    ) : null}

                    <div className="pt-2">
                      <Button
                        fullWidth
                        disabled={!pdfUrl || pdfIsBusy}
                        onClick={() => {
                          setResult(null);
                          mutation.mutate({
                            destinationUrl: pdfUrl,
                            customCode: pdfCustomCode.trim() || undefined,
                            expiresAt: pdfExpiresAt || undefined,
                          } as QRGeneratorFormValues);
                        }}
                      >
                        {mutation.isPending ? 'Oluşturuluyor...' : 'QR Oluştur'}
                      </Button>
                    </div>
                  </div>
                ) : selectedType === 'links' ? (
                  <div className="space-y-5">
                    <div className="text-sm font-semibold text-slate-900">Sosyal Medya</div>

                    <div className="rounded-lg border border-slate-200 bg-white p-4">
                      <div className="text-sm font-semibold text-slate-900">Yönlendirme</div>
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <button
                          type="button"
                          className={`h-10 rounded-lg border text-sm font-semibold ${
                            social.mode === 'landing'
                              ? 'bg-slate-900 text-white border-slate-900'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                          onClick={() => setSocial((s) => ({ ...s, mode: 'landing' }))}
                        >
                          Landing
                        </button>
                        <button
                          type="button"
                          className={`h-10 rounded-lg border text-sm font-semibold ${
                            social.mode === 'direct'
                              ? 'bg-slate-900 text-white border-slate-900'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                          onClick={() => setSocial((s) => ({ ...s, mode: 'direct' }))}
                        >
                          Direkt
                        </button>
                      </div>

                      {social.mode === 'direct' ? (
                        <div className="mt-3">
                          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                            Direkt platform
                          </div>
                          <select
                            value={social.directPlatform}
                            onChange={(e) =>
                              setSocial((s) => ({ ...s, directPlatform: e.target.value as any }))
                            }
                            className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20"
                          >
                            <option value="instagram">Instagram</option>
                            <option value="facebook">Facebook</option>
                            <option value="x">X</option>
                          </select>
                        </div>
                      ) : null}
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <Input
                        label="Instagram"
                        placeholder="@kullaniciadi veya https://instagram.com/..."
                        value={social.instagram}
                        onChange={(e) => setSocial((s) => ({ ...s, instagram: e.target.value }))}
                      />
                      <Input
                        label="Facebook"
                        placeholder="kullaniciadi veya https://facebook.com/..."
                        value={social.facebook}
                        onChange={(e) => setSocial((s) => ({ ...s, facebook: e.target.value }))}
                      />
                      <Input
                        label="X"
                        placeholder="@kullaniciadi veya https://x.com/..."
                        value={social.x}
                        onChange={(e) => setSocial((s) => ({ ...s, x: e.target.value }))}
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                          label="Custom Code (opsiyonel)"
                          placeholder="ornek-kod"
                          value={social.customCode}
                          onChange={(e) => setSocial((s) => ({ ...s, customCode: e.target.value }))}
                        />
                        <Input
                          label="Bitiş Tarihi (opsiyonel)"
                          type="datetime-local"
                          value={social.expiresAt}
                          onChange={(e) => setSocial((s) => ({ ...s, expiresAt: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <Button
                        fullWidth
                        disabled={mutation.isPending}
                        onClick={() => {
                          const instagramUrl = normalizeSocialUrl('instagram', social.instagram);
                          const facebookUrl = normalizeSocialUrl('facebook', social.facebook);
                          const xUrl = normalizeSocialUrl('x', social.x);

                          const links = [
                            { label: 'Instagram', url: instagramUrl },
                            { label: 'Facebook', url: facebookUrl },
                            { label: 'X', url: xUrl },
                          ].filter((l) => l.url);

                          let destinationUrl = '';
                          if (social.mode === 'landing') {
                            if (links.length === 0) return;
                            destinationUrl = buildSocialLandingDataUri(links);
                          } else {
                            const chosen = social.directPlatform;
                            const directUrl =
                              chosen === 'instagram'
                                ? instagramUrl
                                : chosen === 'facebook'
                                  ? facebookUrl
                                  : xUrl;
                            if (!directUrl) return;
                            destinationUrl = directUrl;
                          }

                          setResult(null);
                          mutation.mutate({
                            destinationUrl,
                            customCode: social.customCode.trim() || undefined,
                            expiresAt: social.expiresAt || undefined,
                          } as QRGeneratorFormValues);
                        }}
                      >
                        {mutation.isPending ? 'Oluşturuluyor...' : 'QR Oluştur'}
                      </Button>
                    </div>

                    <div className="rounded-md bg-slate-50 p-3 text-xs text-slate-600">
                      <div className="font-semibold text-slate-700">Ön İzleme</div>
                      <div className="mt-1">
                        {social.mode === 'landing'
                          ? 'Landing sayfası oluşturulacak (butonlu)'
                          : `Direkt: ${social.directPlatform}`}
                      </div>
                    </div>
                  </div>
                ) : selectedType === 'video' ? (
                  <div className="space-y-5">
                    <div className="text-sm font-semibold text-slate-900">Video</div>

                    <div className="grid grid-cols-1 gap-4">
                      <Input
                        label="Video Link"
                        placeholder="YouTube veya Vimeo linki"
                        value={video.url}
                        onChange={(e) => {
                          setVideoError('');
                          setVideo((s) => ({ ...s, url: e.target.value }));
                        }}
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                          label="Custom Code (opsiyonel)"
                          placeholder="ornek-kod"
                          value={video.customCode}
                          onChange={(e) => setVideo((s) => ({ ...s, customCode: e.target.value }))}
                        />
                        <Input
                          label="Bitiş Tarihi (opsiyonel)"
                          type="datetime-local"
                          value={video.expiresAt}
                          onChange={(e) => setVideo((s) => ({ ...s, expiresAt: e.target.value }))}
                        />
                      </div>
                    </div>

                    {videoError ? (
                      <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                        {videoError}
                      </div>
                    ) : null}

                    <div className="pt-2">
                      <Button
                        fullWidth
                        disabled={mutation.isPending}
                        onClick={() => {
                          const u = video.url.trim();
                          if (!u) {
                            setVideoError('Video linki zorunlu');
                            return;
                          }
                          if (!/^https?:\/\//i.test(u)) {
                            setVideoError('Geçerli bir link girin (http/https)');
                            return;
                          }
                          if (!isAllowedVideoUrl(u)) {
                            setVideoError('Sadece YouTube veya Vimeo linkleri destekleniyor');
                            return;
                          }

                          setResult(null);
                          mutation.mutate({
                            destinationUrl: u,
                            customCode: video.customCode.trim() || undefined,
                            expiresAt: video.expiresAt || undefined,
                          } as QRGeneratorFormValues);
                        }}
                      >
                        {mutation.isPending ? 'Oluşturuluyor...' : 'QR Oluştur'}
                      </Button>
                    </div>
                  </div>
                ) : selectedType === 'images' ? (
                  <div className="space-y-5">
                    <div className="text-sm font-semibold text-slate-900">Görsel</div>

                    <div className="rounded-lg border border-slate-200 bg-white p-4">
                      <div className="text-sm font-semibold text-slate-900">Kaynak</div>
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <button
                          type="button"
                          className={`h-10 rounded-lg border text-sm font-semibold ${
                            image.mode === 'upload'
                              ? 'bg-slate-900 text-white border-slate-900'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                          onClick={() => {
                            setImageError('');
                            setImage((s) => ({ ...s, mode: 'upload', uploadedUrl: '', url: '' }));
                          }}
                        >
                          Yükle
                        </button>
                        <button
                          type="button"
                          className={`h-10 rounded-lg border text-sm font-semibold ${
                            image.mode === 'url'
                              ? 'bg-slate-900 text-white border-slate-900'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                          onClick={() => {
                            setImageError('');
                            setImage((s) => ({ ...s, mode: 'url', file: null, uploadedUrl: '' }));
                          }}
                        >
                          URL
                        </button>
                      </div>

                      {image.mode === 'upload' ? (
                        <div className="mt-4">
                          <div className="text-sm font-semibold text-slate-900 mb-2">Görsel Yükle</div>
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            onChange={(e) => {
                              const f = e.target.files?.[0] || null;
                              setImageError('');
                              setImage((s) => ({ ...s, file: null, uploadedUrl: '' }));
                              if (!f) return;
                              if (f.size > 3 * 1024 * 1024) {
                                setImageError('Görsel en fazla 3MB olabilir');
                                return;
                              }
                              setImage((s) => ({ ...s, file: f }));
                            }}
                            className="block w-full text-sm text-slate-700 file:mr-4 file:rounded-lg file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-slate-800"
                          />
                          <div className="mt-2 text-xs text-slate-500">Maksimum 3MB (yüklemeden önce sıkıştırılır)</div>

                          <div className="mt-3 flex gap-2">
                            <Button
                              disabled={!image.file || imageUploadMutation.isPending}
                              onClick={async () => {
                                if (!image.file) return;
                                setImageError('');
                                try {
                                  const compressed = await compressImage(image.file);
                                  if (compressed.size > 3 * 1024 * 1024) {
                                    setImageError('Sıkıştırma sonrası dosya hâlâ 3MB üstünde');
                                    return;
                                  }
                                  imageUploadMutation.mutate(compressed);
                                } catch (e: any) {
                                  setImageError(e?.message || 'Sıkıştırma hatası');
                                }
                              }}
                            >
                              {imageUploadMutation.isPending ? 'Yükleniyor...' : 'Görsel Yükle'}
                            </Button>
                            {image.uploadedUrl ? (
                              <div className="flex-1 text-xs text-emerald-700 border border-emerald-200 bg-emerald-50 rounded-lg px-3 py-2 break-all">
                                {image.uploadedUrl}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      ) : (
                        <div className="mt-4">
                          <Input
                            label="Görsel URL"
                            placeholder="https://.../image.jpg"
                            value={image.url}
                            onChange={(e) => {
                              setImageError('');
                              setImage((s) => ({ ...s, url: e.target.value }));
                            }}
                          />
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Custom Code (opsiyonel)"
                        placeholder="ornek-kod"
                        value={image.customCode}
                        onChange={(e) => setImage((s) => ({ ...s, customCode: e.target.value }))}
                      />
                      <Input
                        label="Bitiş Tarihi (opsiyonel)"
                        type="datetime-local"
                        value={image.expiresAt}
                        onChange={(e) => setImage((s) => ({ ...s, expiresAt: e.target.value }))}
                      />
                    </div>

                    {imageError ? (
                      <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                        {imageError}
                      </div>
                    ) : null}

                    <div className="pt-2">
                      <Button
                        fullWidth
                        disabled={mutation.isPending}
                        onClick={() => {
                          const destinationUrl =
                            image.mode === 'upload' ? image.uploadedUrl : image.url.trim();
                          if (!destinationUrl) {
                            setImageError('Görsel zorunlu');
                            return;
                          }
                          if (!/^https?:\/\//i.test(destinationUrl)) {
                            setImageError('Geçerli bir URL olmalı (http/https)');
                            return;
                          }

                          setResult(null);
                          mutation.mutate({
                            destinationUrl,
                            customCode: image.customCode.trim() || undefined,
                            expiresAt: image.expiresAt || undefined,
                          } as QRGeneratorFormValues);
                        }}
                      >
                        {mutation.isPending ? 'Oluşturuluyor...' : 'QR Oluştur'}
                      </Button>
                    </div>
                  </div>
                ) : selectedType === 'wifi' ? (
                  <div className="space-y-5">
                    <div className="text-sm font-semibold text-slate-900">WiFi</div>

                    <div className="grid grid-cols-1 gap-4">
                      <Input
                        label="WiFi Adı (SSID)"
                        placeholder="Ağ adı"
                        value={wifi.ssid}
                        onChange={(e) => setWifi((s) => ({ ...s, ssid: e.target.value }))}
                      />
                      <Input
                        label="Şifre"
                        placeholder="Şifre"
                        value={wifi.password}
                        onChange={(e) => setWifi((s) => ({ ...s, password: e.target.value }))}
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Güvenlik</div>
                          <select
                            value={wifi.security}
                            onChange={(e) => setWifi((s) => ({ ...s, security: e.target.value as any }))}
                            className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20"
                          >
                            <option value="WPA">WPA/WPA2</option>
                            <option value="WEP">WEP</option>
                            <option value="nopass">Şifresiz</option>
                          </select>
                        </div>
                        <div className="flex items-center gap-2 pt-6">
                          <input
                            type="checkbox"
                            checked={wifi.hidden}
                            onChange={(e) => setWifi((s) => ({ ...s, hidden: e.target.checked }))}
                            className="h-4 w-4"
                          />
                          <div className="text-sm text-slate-700">Gizli ağ</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                          label="Custom Code (opsiyonel)"
                          placeholder="ornek-kod"
                          value={wifi.customCode}
                          onChange={(e) => setWifi((s) => ({ ...s, customCode: e.target.value }))}
                        />
                        <Input
                          label="Bitiş Tarihi (opsiyonel)"
                          type="datetime-local"
                          value={wifi.expiresAt}
                          onChange={(e) => setWifi((s) => ({ ...s, expiresAt: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="rounded-md bg-slate-50 p-3 text-xs text-slate-600">
                      <div className="font-semibold text-slate-700">Not</div>
                      <div className="mt-1">
                        Tarayıcılar mevcut WiFi SSID/şifre bilgisini otomatik vermez. Manuel girmeniz gerekir.
                      </div>
                    </div>

                    <div className="pt-2">
                      <Button
                        fullWidth
                        disabled={mutation.isPending}
                        onClick={() => {
                          const ssid = wifi.ssid.trim();
                          if (!ssid) return;
                          const destinationUrl = buildWifiPayload({
                            ssid,
                            password: wifi.security === 'nopass' ? '' : wifi.password,
                            security: wifi.security,
                            hidden: wifi.hidden,
                          });

                          setResult(null);
                          mutation.mutate({
                            destinationUrl,
                            customCode: wifi.customCode.trim() || undefined,
                            expiresAt: wifi.expiresAt || undefined,
                          } as QRGeneratorFormValues);
                        }}
                      >
                        {mutation.isPending ? 'Oluşturuluyor...' : 'QR Oluştur'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <QRGeneratorForm
                    loading={mutation.isPending}
                    onSubmit={(values) => {
                      setResult(null);
                      mutation.mutate(values);
                    }}
                  />
                )}

                <div className="flex gap-3">
                  <button 
                    onClick={() => setStep(1)}
                    className="text-slate-500 font-medium hover:text-slate-800 flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" /> Geri Dön
                  </button>
                  <button 
                    onClick={() => setStep(3)}
                    className="text-slate-500 font-medium hover:text-slate-800 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    Tasarıma geç
                  </button>
                </div>

                {mutation.isError ? (
                  <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-600 mt-4">
                    <div className="font-bold">
                      {(
                        (mutation.error as any)?.response?.data?.message ||
                        (mutation.error as any)?.response?.data?.error ||
                        (mutation.error as any)?.message ||
                        'QR oluşturma hatası'
                      )}
                    </div>
                    {Array.isArray((mutation.error as any)?.response?.data?.details) ? (
                      <div className="mt-2 space-y-1 text-xs">
                        {(mutation.error as any).response.data.details.map((d: any, i: number) => (
                          <div key={i}>
                            <span className="font-semibold">{d.field}:</span> {d.message}
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </>
          ) : null}

          {step === 3 ? (
            <>
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <div className="text-slate-500">
                  Bu adım şimdilik placeholder. Bir sonraki aşamada renk/logo/çerçeve gibi ayarları ekleyeceğiz.
                </div>
                <div className="flex gap-3 mt-6">
                  <button 
                    onClick={() => setStep(2)}
                    className="text-slate-500 font-medium hover:text-slate-800 flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" /> Geri Dön
                  </button>
                  <button 
                    onClick={() => setStep(2)}
                    className="bg-yellow-400 text-slate-900 font-bold py-3 px-6 rounded-xl flex items-center gap-2"
                  >
                    İçeriğe dön
                  </button>
                </div>
              </div>
            </>
          ) : null}

          {step === 4 && result ? (
            <>
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <QRResult data={result} />
              </div>
            </>
          ) : null}
        </div>

        {/* SAĞ PANEL: Canlı Önizleme */}
        <div className="lg:col-span-5 relative">
          <div className="sticky top-8">
            <div className="bg-slate-900 rounded-[2.5rem] p-4 shadow-2xl shadow-slate-300 transform rotate-1 hover:rotate-0 transition-transform duration-500 border-4 border-slate-800">
              <div className="bg-white rounded-[2rem] overflow-hidden h-[600px] flex flex-col relative">
                
                {/* Mockup Top Bar */}
                <div className="h-6 w-full flex justify-center items-center mt-2">
                    <div className="h-1.5 w-16 bg-slate-200 rounded-full"></div>
                </div>

                {/* Preview Content */}
                <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-br from-slate-50 to-slate-100 text-center space-y-6">
                  
                  <div className="w-64 h-64 bg-white rounded-3xl shadow-xl flex items-center justify-center border border-slate-100 p-4">
                    {/* Placeholder for QR */}
                    {result?.qrCodeImageUrl ? (
                      <img src={result.qrCodeImageUrl} alt="QR" className="w-full h-full object-contain" />
                    ) : (
                      <div className="w-full h-full bg-slate-900 rounded-2xl flex items-center justify-center text-white/20">
                        <QrCode className="w-24 h-24 opacity-20" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-slate-800">Canlı Önizleme</h3>
                    <p className="text-slate-400 text-sm">
                      {step === 1 && "QR türü seçildiğinde önizleme burada görünecek."}
                      {step === 2 && "İçerik girildiğinde QR kodunuz burada belirecek."}
                      {step === 3 && "Tasarım ayarları burada görünecek."}
                      {step === 4 && result && `Hedef: ${previewDestinationLabel}`}
                    </p>
                  </div>
                </div>

                {/* Mockup Bottom Action */}
                {step === 4 && result ? (
                  <div className="p-6 bg-white border-t border-slate-100">
                    <button 
                      onClick={async () => {
                        if (!result.qrCodeImageUrl) return;
                        try {
                          const res = await fetch(result.qrCodeImageUrl);
                          const blob = await res.blob();
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `${result.shortCode}.png`;
                          document.body.appendChild(a);
                          a.click();
                          a.remove();
                          URL.revokeObjectURL(url);
                        } catch (error) {
                          console.error('Download error:', error);
                        }
                      }}
                      className="w-full bg-yellow-400 text-slate-900 font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-yellow-300 transition-colors"
                    >
                      <Download className="w-4 h-4" /> İndir (PNG)
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>

      </main>

      {/* Navigation */}
      <nav className="bg-white border-t border-slate-200 fixed bottom-0 left-0 right-0">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-2 text-sm">
               <span className={`${step === 1 ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' : 'text-slate-400'} px-4 py-2 rounded-lg font-medium transition-colors`}>Tür Seç</span>
               <ChevronRight className="w-4 h-4 text-slate-300" />
               <span className={`${step === 2 ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' : 'text-slate-400'} px-4 py-2 rounded-lg font-medium transition-colors`}>İçerik</span>
               <ChevronRight className="w-4 h-4 text-slate-300" />
               <span className={`${step === 3 ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' : 'text-slate-400'} px-4 py-2 rounded-lg font-medium transition-colors`}>Tasarla</span>
            </div>
          </div>
        </div>
      </nav>
      </div>
    </AdminLayout>
  );
}
