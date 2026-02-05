import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { AdminLayout } from '../components/Layout/AdminLayout';
import { Input } from '../components/Common/Input';
import { Button } from '../components/Common/Button';
import { QRResult, QRResultData } from '../components/QRGenerator/QRResult';
import { useAuth } from '../hooks/useAuth';
import { qrService } from '../services/qrService';

export default function QRGeneratePdfPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState<QRResultData | null>(null);

  useEffect(() => {
    if (!isAuthenticated) navigate('/login');
  }, [isAuthenticated, navigate]);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const res = await qrService.uploadPdf(file);
      return res.data;
    },
    onSuccess: (payload: any) => {
      const url = payload?.data?.url;
      if (typeof url === 'string' && url) setPdfUrl(url);
      else setError('PDF yükleme başarısız');
    },
    onError: (e: any) => {
      setError(e?.response?.data?.error || e?.message || 'PDF yükleme hatası');
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await qrService.generate(pdfUrl, customCode.trim() || undefined, expiresAt || undefined);
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
                <div className="text-xl font-bold text-slate-900">PDF QR</div>
                <div className="text-sm text-slate-500 mt-1">PDF dosyası yükleyip QR oluştur.</div>
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
                <div className="text-sm font-semibold text-slate-900 mb-2">PDF Yükle</div>
                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={(e) => {
                    const f = e.target.files?.[0] || null;
                    setError('');
                    setResult(null);
                    setPdfUrl('');
                    setPdfFile(null);
                    if (!f) return;
                    if (f.size > 3 * 1024 * 1024) {
                      setError('PDF en fazla 3MB olabilir');
                      return;
                    }
                    setPdfFile(f);
                  }}
                  className="block w-full text-sm text-slate-700 file:mr-4 file:rounded-lg file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-slate-800"
                />
                <div className="mt-3 flex gap-2">
                  <Button
                    disabled={!pdfFile || uploadMutation.isPending}
                    onClick={() => {
                      if (!pdfFile) return;
                      setError('');
                      uploadMutation.mutate(pdfFile);
                    }}
                  >
                    {uploadMutation.isPending ? 'Yükleniyor...' : 'PDF Yükle'}
                  </Button>
                  {pdfUrl ? (
                    <div className="flex-1 text-xs text-emerald-700 border border-emerald-200 bg-emerald-50 rounded-lg px-3 py-2 break-all">
                      {pdfUrl}
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Custom Code (opsiyonel)"
                  placeholder="ornek-kod"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value)}
                />
                <Input
                  label="Bitiş Tarihi (opsiyonel)"
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                />
              </div>

              {error ? (
                <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>
              ) : null}

              <Button
                fullWidth
                disabled={!pdfUrl || uploadMutation.isPending || createMutation.isPending}
                onClick={() => {
                  if (!pdfUrl) return;
                  setError('');
                  setResult(null);
                  createMutation.mutate();
                }}
              >
                {createMutation.isPending ? 'Oluşturuluyor...' : 'QR Oluştur'}
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
