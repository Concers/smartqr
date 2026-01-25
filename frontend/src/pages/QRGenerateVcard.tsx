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

export default function QRGenerateVcardPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

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

  const [result, setResult] = useState<QRResultData | null>(null);

  useEffect(() => {
    if (!isAuthenticated) navigate('/login');
  }, [isAuthenticated, navigate]);

  const vcardError = useMemo(() => {
    const hasName = !!(vcard.firstName.trim() || vcard.lastName.trim());
    const hasContact = !!(vcard.email.trim() || vcard.mobile.trim() || vcard.phone.trim());
    if (!hasName) return 'İsim alanı zorunlu (Ad veya Soyad)';
    if (!hasContact) return 'İletişim alanı zorunlu (E‑posta veya Telefon)';
    return undefined;
  }, [vcard]);

  const buildVCardDataUri = () => {
    const first = vcard.firstName.trim();
    const last = vcard.lastName.trim();

    const lines: string[] = ['BEGIN:VCARD', 'VERSION:3.0'];
    lines.push(`N:${last};${first};;;`);

    const fnValue = `${first}${first && last ? ' ' : ''}${last}`.trim();
    if (fnValue) lines.push(`FN:${fnValue}`);
    if (vcard.company.trim()) lines.push(`ORG:${vcard.company.trim()}`);
    if (vcard.job.trim()) lines.push(`TITLE:${vcard.job.trim()}`);
    if (vcard.mobile.trim()) lines.push(`TEL;TYPE=CELL:${vcard.mobile.trim()}`);
    if (vcard.phone.trim()) lines.push(`TEL;TYPE=WORK:${vcard.phone.trim()}`);
    if (vcard.fax.trim()) lines.push(`TEL;TYPE=FAX:${vcard.fax.trim()}`);
    if (vcard.email.trim()) lines.push(`EMAIL:${vcard.email.trim()}`);

    const street = vcard.street.trim();
    const city = vcard.city.trim();
    const state = vcard.state.trim();
    const zip = vcard.zip.trim();
    const country = vcard.country.trim();
    if (street || city || state || zip || country) {
      lines.push(`ADR;TYPE=WORK:;;${street};${city};${state};${zip};${country}`);
    }

    if (vcard.website.trim()) lines.push(`URL:${vcard.website.trim()}`);

    lines.push('END:VCARD');
    const text = lines.join('\n');
    return `data:text/vcard;charset=utf-8,${encodeURIComponent(text)}`;
  };

  const mutation = useMutation({
    mutationFn: async () => {
      const dest = buildVCardDataUri();
      const res = await qrService.generate(dest, vcard.customCode.trim() || undefined, vcard.expiresAt || undefined);
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
  });

  return (
    <AdminLayout>
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
        <div className="max-w-3xl mx-auto px-6 py-10">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-xl font-bold text-slate-900">vCard QR</div>
                <div className="text-sm text-slate-500 mt-1">Kartvizit bilgilerini girin.</div>
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
                <Input label="Ad" value={vcard.firstName} onChange={(e) => setVcard((s) => ({ ...s, firstName: e.target.value }))} />
                <Input label="Soyad" value={vcard.lastName} onChange={(e) => setVcard((s) => ({ ...s, lastName: e.target.value }))} />
              </div>

              <Input label="Mobil" value={vcard.mobile} onChange={(e) => setVcard((s) => ({ ...s, mobile: e.target.value }))} />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Telefon" value={vcard.phone} onChange={(e) => setVcard((s) => ({ ...s, phone: e.target.value }))} />
                <Input label="Fax" value={vcard.fax} onChange={(e) => setVcard((s) => ({ ...s, fax: e.target.value }))} />
              </div>

              <Input label="E‑posta" value={vcard.email} onChange={(e) => setVcard((s) => ({ ...s, email: e.target.value }))} />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Şirket" value={vcard.company} onChange={(e) => setVcard((s) => ({ ...s, company: e.target.value }))} />
                <Input label="Ünvan" value={vcard.job} onChange={(e) => setVcard((s) => ({ ...s, job: e.target.value }))} />
              </div>

              <Input label="Adres" value={vcard.street} onChange={(e) => setVcard((s) => ({ ...s, street: e.target.value }))} />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Şehir" value={vcard.city} onChange={(e) => setVcard((s) => ({ ...s, city: e.target.value }))} />
                <Input label="Posta Kodu" value={vcard.zip} onChange={(e) => setVcard((s) => ({ ...s, zip: e.target.value }))} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Eyalet" value={vcard.state} onChange={(e) => setVcard((s) => ({ ...s, state: e.target.value }))} />
                <Input label="Ülke" value={vcard.country} onChange={(e) => setVcard((s) => ({ ...s, country: e.target.value }))} />
              </div>

              <Input label="Website" value={vcard.website} onChange={(e) => setVcard((s) => ({ ...s, website: e.target.value }))} />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Custom Code (opsiyonel)" value={vcard.customCode} onChange={(e) => setVcard((s) => ({ ...s, customCode: e.target.value }))} />
                <Input label="Bitiş Tarihi (opsiyonel)" type="datetime-local" value={vcard.expiresAt} onChange={(e) => setVcard((s) => ({ ...s, expiresAt: e.target.value }))} />
              </div>

              {vcardError ? (
                <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">{vcardError}</div>
              ) : null}

              <Button fullWidth disabled={!!vcardError || mutation.isPending} onClick={() => { setResult(null); mutation.mutate(); }}>
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
