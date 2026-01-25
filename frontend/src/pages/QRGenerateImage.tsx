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

type Mode = 'upload' | 'url';

export default function QRGenerateImagePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [mode, setMode] = useState<Mode>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [url, setUrl] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState<QRResultData | null>(null);

  useEffect(() => {
    if (!isAuthenticated) navigate('/login');
  }, [isAuthenticated, navigate]);

  const compressImage = async (inFile: File) => {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('File read error'));
      reader.readAsDataURL(inFile);
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

  const uploadMutation = useMutation({
    mutationFn: async (inFile: File) => {
      const compressed = await compressImage(inFile);
      if (compressed.size > 3 * 1024 * 1024) throw new Error('Sıkıştırma sonrası dosya hâlâ 3MB üstünde');
      const res = await qrService.uploadImage(compressed);
      return res.data;
    },
    onSuccess: (payload: any) => {
      const u = payload?.data?.url;
      if (typeof u === 'string' && u) setUploadedUrl(u);
      else setError('Görsel yükleme başarısız');
    },
    onError: (e: any) => {
      setError(e?.response?.data?.error || e?.message || 'Görsel yükleme hatası');
    },
  });

  const createMutation = useMutation({
    mutationFn: async (destinationUrl: string) => {
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

  const destinationUrl = mode === 'upload' ? uploadedUrl : url.trim();

  return (
    <AdminLayout>
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
        <div className="max-w-3xl mx-auto px-6 py-10">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-xl font-bold text-slate-900">Görsel QR</div>
                <div className="text-sm text-slate-500 mt-1">Görsel yükleyin (sıkıştırılır) veya URL verin.</div>
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
                <div className="text-sm font-semibold text-slate-900">Kaynak</div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    className={`h-10 rounded-lg border text-sm font-semibold ${mode === 'upload' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
                    onClick={() => {
                      setMode('upload');
                      setError('');
                      setResult(null);
                      setUploadedUrl('');
                      setUrl('');
                    }}
                  >
                    Yükle
                  </button>
                  <button
                    type="button"
                    className={`h-10 rounded-lg border text-sm font-semibold ${mode === 'url' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
                    onClick={() => {
                      setMode('url');
                      setError('');
                      setResult(null);
                      setUploadedUrl('');
                      setFile(null);
                    }}
                  >
                    URL
                  </button>
                </div>

                {mode === 'upload' ? (
                  <div className="mt-4">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={(e) => {
                        const f = e.target.files?.[0] || null;
                        setError('');
                        setResult(null);
                        setUploadedUrl('');
                        setFile(null);
                        if (!f) return;
                        if (f.size > 3 * 1024 * 1024) {
                          setError('Görsel en fazla 3MB olabilir');
                          return;
                        }
                        setFile(f);
                      }}
                      className="block w-full text-sm text-slate-700 file:mr-4 file:rounded-lg file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-slate-800"
                    />
                    <div className="mt-3 flex gap-2">
                      <Button
                        disabled={!file || uploadMutation.isPending}
                        onClick={() => {
                          if (!file) return;
                          setError('');
                          uploadMutation.mutate(file);
                        }}
                      >
                        {uploadMutation.isPending ? 'Yükleniyor...' : 'Görsel Yükle'}
                      </Button>
                      {uploadedUrl ? (
                        <div className="flex-1 text-xs text-emerald-700 border border-emerald-200 bg-emerald-50 rounded-lg px-3 py-2 break-all">
                          {uploadedUrl}
                        </div>
                      ) : null}
                    </div>
                  </div>
                ) : (
                  <div className="mt-4">
                    <Input label="Görsel URL" placeholder="https://.../image.jpg" value={url} onChange={(e) => setUrl(e.target.value)} />
                  </div>
                )}
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
                disabled={!destinationUrl || uploadMutation.isPending || createMutation.isPending}
                onClick={() => {
                  const d = destinationUrl;
                  setError('');
                  setResult(null);
                  if (!d) return;
                  if (!/^https?:\/\//i.test(d)) {
                    setError('Geçerli bir URL olmalı (http/https)');
                    return;
                  }
                  createMutation.mutate(d);
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
