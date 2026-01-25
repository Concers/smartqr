import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { AdminLayout } from '../components/Layout/AdminLayout';
import { QRGeneratorForm, QRGeneratorFormValues } from '../components/QRGenerator/QRGeneratorForm';
import { QRResult, QRResultData } from '../components/QRGenerator/QRResult';
import { useAuth } from '../hooks/useAuth';
import { qrService } from '../services/qrService';

export default function QRGenerateWebsitePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [result, setResult] = useState<QRResultData | null>(null);

  useEffect(() => {
    if (!isAuthenticated) navigate('/login');
  }, [isAuthenticated, navigate]);

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
    },
  });

  return (
    <AdminLayout>
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
        <div className="max-w-3xl mx-auto px-6 py-10">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-xl font-bold text-slate-900">Website QR</div>
                <div className="text-sm text-slate-500 mt-1">Bir web sitesi URL'sine yönlendir.</div>
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

            <div className="mt-6">
              <QRGeneratorForm
                loading={mutation.isPending}
                onSubmit={(values) => {
                  setResult(null);
                  mutation.mutate(values);
                }}
              />
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
