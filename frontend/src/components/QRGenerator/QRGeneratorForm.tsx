import { useMemo, useState } from 'react';
import { Calendar, Clock, X } from 'lucide-react';
import { Input } from '../Common/Input';
import { Button } from '../Common/Button';
import { isValidUrl } from '../../utils/validators';

export type QRGeneratorFormValues = {
  destinationUrl: string;
  customCode?: string;
  expiresAt?: string;
};

export function QRGeneratorForm({
  onSubmit,
  loading,
}: {
  onSubmit: (values: QRGeneratorFormValues) => void;
  loading?: boolean;
}) {
  const [destinationUrl, setDestinationUrl] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [expiresDate, setExpiresDate] = useState('');
  const [expiresTime, setExpiresTime] = useState('');
  const [touched, setTouched] = useState<{ url: boolean }>({ url: false });

  const setRelativeDate = (daysFromToday: number) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + daysFromToday);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    setExpiresDate(`${yyyy}-${mm}-${dd}`);
    if (!expiresTime) setExpiresTime('23:59');
  };

  const urlError = useMemo(() => {
    if (!touched.url) return undefined;
    if (!destinationUrl.trim()) return 'URL zorunlu';
    if (!isValidUrl(destinationUrl.trim())) return 'Geçerli bir URL gir';
    return undefined;
  }, [destinationUrl, touched.url]);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-4 text-sm font-semibold text-slate-900">Yeni QR Oluştur</div>

      <div className="grid grid-cols-1 gap-4">
        <Input
          label="Hedef URL"
          placeholder="https://example.com"
          value={destinationUrl}
          onChange={(e) => setDestinationUrl(e.target.value)}
          onBlur={() => setTouched({ url: true })}
          error={urlError}
        />

        <Input
          label="Custom Code (opsiyonel)"
          placeholder="ornek-kod"
          value={customCode}
          onChange={(e) => setCustomCode(e.target.value)}
        />

        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-semibold text-slate-900">Bitiş Tarihi</div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setRelativeDate(0)}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Bugün
              </button>
              <button
                type="button"
                onClick={() => setRelativeDate(1)}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Yarın
              </button>
              <button
                type="button"
                onClick={() => {
                  setExpiresDate('');
                  setExpiresTime('');
                }}
                className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              >
                <X className="h-3.5 w-3.5" />
                Temizle
              </button>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="relative">
              <Calendar className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="date"
                value={expiresDate}
                onChange={(e) => setExpiresDate(e.target.value)}
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 pl-9 text-sm text-slate-900 outline-none transition-shadow focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20"
              />
            </div>

            <div className="relative">
              <Clock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="time"
                value={expiresTime}
                onChange={(e) => setExpiresTime(e.target.value)}
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 pl-9 text-sm text-slate-900 outline-none transition-shadow focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20"
              />
            </div>
          </div>

          <div className="mt-2 text-xs text-slate-500">
            Opsiyonel. Seçmezseniz QR kodu süresiz olur.
          </div>
        </div>

        <div className="pt-2">
          <Button
            fullWidth
            disabled={!!urlError || !destinationUrl.trim() || loading}
            onClick={() =>
              onSubmit({
                destinationUrl: destinationUrl.trim(),
                customCode: customCode.trim() || undefined,
                expiresAt: expiresDate
                  ? `${expiresDate}T${expiresTime || '00:00'}`
                  : undefined,
              })
            }
          >
            {loading ? 'Oluşturuluyor...' : 'QR Oluştur'}
          </Button>
        </div>

        <div className="rounded-md bg-slate-50 p-3 text-xs text-slate-600">
          <div className="font-semibold text-slate-700">Ön İzleme</div>
          <div className="mt-1">
            {isValidUrl(destinationUrl.trim()) ? destinationUrl.trim() : 'Geçerli URL girince burada görünecek'}
          </div>
        </div>
      </div>
    </div>
  );
}
