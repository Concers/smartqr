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
      { key: 'website', title: 'İnternet sitesi', subtitle: 'Bir web sitesi URL’sine bağlantı', Icon: Globe },
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
      // Show real error details in console for debugging
      console.error('QR generate error:', {
        message: error?.message,
        status: error?.response?.status,
        data: error?.response?.data,
      });
    },
  });

  return (
    <div className="space-y-6">
      <Stepper currentStep={step} />

      <div className="text-center">
        <div className="text-xl font-semibold text-slate-900">
          Herhangi bir durum için saniyeler içinde <span className="text-emerald-600">kolayca bir QR Kodu</span> oluşturun!
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr,360px]">
        <div className="space-y-4">
          {step === 1 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="mb-3 text-sm font-semibold text-slate-900">Bir QR türü seçin</div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {types.map((t) => (
                  <QRTypeCard
                    key={t.key}
                    type={t}
                    selected={selectedType === t.key}
                    onSelect={(key) => setSelectedType(key)}
                  />
                ))}
              </div>

              <div className="mt-4 flex justify-end">
                <Button
                  onClick={() => setStep(2)}
                  disabled={!selectedType}
                >
                  Devam
                </Button>
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-4">
              <QRGeneratorForm
                loading={mutation.isPending}
                onSubmit={(values) => {
                  setResult(null);
                  mutation.mutate(values);
                }}
              />

              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setStep(1)}>
                  Geri
                </Button>
                <Button variant="secondary" onClick={() => setStep(3)}>
                  Tasarıma geç
                </Button>
              </div>

              {mutation.isError ? (
                <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                  <div className="font-medium">
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
          ) : null}

          {step === 3 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="mb-3 text-sm font-semibold text-slate-900">QR kodunu tasarlayın</div>
              <div className="text-sm text-slate-600">
                Bu adım şimdilik placeholder. Bir sonraki aşamada renk/logo/çerçeve gibi ayarları ekleyeceğiz.
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="secondary" onClick={() => setStep(2)}>
                  Geri
                </Button>
                <Button onClick={() => setStep(2)}>İçeriğe dön</Button>
              </div>
            </div>
          ) : null}

          {step === 4 && result ? <QRResult data={result} /> : null}
        </div>

        <PhonePreview step={step} selectedTypeTitle={selectedTypeTitle} result={result} />
      </div>
    </div>
  );
}
