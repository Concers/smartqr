import { useMemo, useState } from 'react';
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
  const [expiresAt, setExpiresAt] = useState('');
  const [touched, setTouched] = useState<{ url: boolean }>({ url: false });

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

        <Input
          label="Bitiş Tarihi (opsiyonel)"
          type="datetime-local"
          value={expiresAt}
          onChange={(e) => setExpiresAt(e.target.value)}
        />

        <div className="pt-2">
          <Button
            fullWidth
            disabled={!!urlError || !destinationUrl.trim() || loading}
            onClick={() =>
              onSubmit({
                destinationUrl: destinationUrl.trim(),
                customCode: customCode.trim() || undefined,
                expiresAt: expiresAt || undefined,
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
