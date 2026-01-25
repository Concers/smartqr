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

export default function QRGeneratorPage() {
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

  const handleLogout = () => {
    logout();
    navigate('/'); // Redirect to landing page instead of login
  };

  const types: QRType[] = useMemo(
    () => [
      { key: 'website', title: 'İnternet sitesi', subtitle: 'Bir web sitesi URL\'sine bağlantı', Icon: Globe },
      { key: 'pdf', title: 'PDF', subtitle: 'PDF göster', Icon: FileText },
      { key: 'links', title: 'Bağlantıların Listesi', subtitle: 'Birden fazla bağlantı paylaşın', Icon: LinkIcon },
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
                      {step === 4 && result && `Hedef: ${result.destinationUrl}`}
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
