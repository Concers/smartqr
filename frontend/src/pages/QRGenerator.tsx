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
} from 'lucide-react';

import { Button } from '../components/Common/Button';
import { Header } from '../components/Common/Header';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { QRGeneratorForm, QRGeneratorFormValues } from '../components/QRGenerator/QRGeneratorForm';
import { QRResult, QRResultData } from '../components/QRGenerator/QRResult';
import { PhonePreview } from '../components/QRGenerator/PhonePreview';
import { QRType, QRTypeCard } from '../components/QRGenerator/QRTypeCard';
import { Stepper } from '../components/QRGenerator/Stepper';
import { useAuth } from '../hooks/useAuth';
import { qrService } from '../services/qrService';

export default function QRGeneratorPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<string | null>('website');
  const [result, setResult] = useState<QRResultData | null>(null);

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
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-yellow-200">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 py-4">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-400 p-2 rounded-lg">
              <QrCode className="w-6 h-6 text-slate-900" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">QR Kod Oluştur</h1>
              <p className="text-xs text-slate-500 font-medium">Akıllı QR Çözümleri</p>
            </div>
          </div>
          {/* Stepper */}
          <div className="hidden md:flex items-center gap-2 text-sm">
             <span className={`${step === 1 ? 'bg-yellow-100 text-yellow-800' : 'text-slate-400'} px-3 py-1 rounded-full font-medium`}>Tür Seç</span>
             <ChevronRight className="w-4 h-4 text-slate-300" />
             <span className={`${step === 2 ? 'bg-yellow-100 text-yellow-800' : 'text-slate-400'} px-3 py-1 rounded-full font-medium`}>İçerik</span>
             <ChevronRight className="w-4 h-4 text-slate-300" />
             <span className={`${step === 3 ? 'bg-yellow-100 text-yellow-800' : 'text-slate-400'} px-3 py-1 rounded-full font-medium`}>Tasarla</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* SOL PANEL: Form Alanı */}
        <div className="lg:col-span-7 space-y-8">
          {step === 1 ? (
            <>
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-slate-800">Bir QR türü seçin</h2>
                <p className="text-slate-500">QR kodunuzun türünü seçin ve içerik oluşturmaya başlayın.</p>
              </div>

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
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-slate-800">İçeriğinizi Ekleyin</h2>
                <p className="text-slate-500">QR kodunuzun yönlendireceği hedefi ve detayları belirleyin.</p>
              </div>

              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6">
                <QRGeneratorForm
                  loading={mutation.isPending}
                  onSubmit={(values) => {
                    setResult(null);
                    mutation.mutate(values);
                  }}
                />

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
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-slate-800">QR kodunu tasarlayın</h2>
                <p className="text-slate-500">QR kodunuzun görünümünü özelleştirin.</p>
              </div>

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
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-slate-800">QR Kodunuz Hazır!</h2>
                <p className="text-slate-500">QR kodunuz başarıyla oluşturuldu.</p>
              </div>

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
    </div>
  );
}
