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
    <div className="min-h-screen bg-cream">
      <Header />
      
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-yellow rounded-2xl flex items-center justify-center shadow-[4px_4px_0_0_#1F2937] transition-transform hover:translate-y-1">
              <svg className="w-9 h-9 text-dark" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 11h8V3H3v8zm2-6h4v4H5V5zm8-2v8h8V3h-8zm6 6h-4V5h4v4zM3 21h8v-8H3v8zm2-6h4v4H5v-4zm8 2h2v2h-2v-2zm2-2h2v2h-2v-2zm2 2h2v2h-2v-2zm2-2h2v2h-2v-2z" />
              </svg>
            </div>
            <div className="text-left">
              <h1 className="text-4xl font-bold text-dark">QR Kod Oluştur</h1>
              <p className="text-coral text-lg font-bold mt-1">Akıllı QR Kodları</p>
            </div>
          </div>
          <div className="text-2xl font-bold text-dark mb-3">
            Herhangi bir durum için saniyeler içinde <span className="text-green">kolayca bir QR Kodu</span> oluşturun!
          </div>
        </div>

        <Stepper currentStep={step} />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr,400px]">
          <div className="space-y-6">
            {step === 1 ? (
              <Card className="border-2 border-dark/10 shadow-[4px_4px_0_0_#1F2937]">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-dark">Bir QR türü seçin</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {types.map((t) => (
                      <QRTypeCard
                        key={t.key}
                        type={t}
                        selected={selectedType === t.key}
                        onSelect={(key) => setSelectedType(key)}
                      />
                    ))}
                  </div>

                  <div className="mt-6 flex justify-end">
                    <Button
                      onClick={() => setStep(2)}
                      disabled={!selectedType}
                      className="bg-green text-white hover:bg-green/90 transition-colors shadow-[2px_2px_0_0_#1F2937] active:translate-y-0.5"
                    >
                      Devam
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {step === 2 ? (
              <Card className="border-2 border-dark/10 shadow-[4px_4px_0_0_#1F2937]">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-dark">QR Kod İçeriği</CardTitle>
                </CardHeader>
                <CardContent>
                  <QRGeneratorForm
                    loading={mutation.isPending}
                    onSubmit={(values) => {
                      setResult(null);
                      mutation.mutate(values);
                    }}
                  />

                  <div className="flex gap-3 mt-6">
                    <Button 
                      variant="outline" 
                      onClick={() => setStep(1)}
                      className="border-2 border-dark hover:bg-dark hover:text-cream transition-colors"
                    >
                      Geri
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setStep(3)}
                      className="border-2 border-dark hover:bg-dark hover:text-cream transition-colors"
                    >
                      Tasarıma geç
                    </Button>
                  </div>

                  {mutation.isError ? (
                    <div className="rounded-md border border-coral/20 bg-coral/10 p-4 text-sm text-coral mt-4">
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
                </CardContent>
              </Card>
            ) : null}

            {step === 3 ? (
              <Card className="border-2 border-dark/10 shadow-[4px_4px_0_0_#1F2937]">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-dark">QR kodunu tasarlayın</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-dark/70">
                    Bu adım şimdilik placeholder. Bir sonraki aşamada renk/logo/çerçeve gibi ayarları ekleyeceğiz.
                  </div>
                  <div className="flex gap-3 mt-6">
                    <Button 
                      variant="outline" 
                      onClick={() => setStep(2)}
                      className="border-2 border-dark hover:bg-dark hover:text-cream transition-colors"
                    >
                      Geri
                    </Button>
                    <Button 
                      onClick={() => setStep(2)}
                      className="bg-yellow text-dark hover:bg-yellow/90 transition-colors shadow-[2px_2px_0_0_#1F2937] active:translate-y-0.5"
                    >
                      İçeriğe dön
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {step === 4 && result ? (
              <Card className="border-2 border-dark/10 shadow-[4px_4px_0_0_#1F2937]">
                <QRResult data={result} />
              </Card>
            ) : null}
          </div>

          <PhonePreview step={step} selectedTypeTitle={selectedTypeTitle} result={result} />
        </div>
      </div>
      </div>
    </div>
  );
}
