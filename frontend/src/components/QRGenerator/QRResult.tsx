import { Copy } from 'lucide-react';
import { Button } from '../Common/Button';

export type QRResultData = {
  shortCode: string;
  qrCodeUrl: string;
  qrCodeImageUrl?: string;
  destinationUrl: string;
};

export function QRResult({ data }: { data: QRResultData }) {
  const truncate40 = (u: string) => {
    const s = (u || '').trim();
    if (!s) return '';
    if (s.length <= 40) return s;
    return `${s.slice(0, 28)}…${s.slice(-11)}`;
  };

  const getDestinationLabel = (url: string) => {
    const u = (url || '').trim();
    const lower = u.toLowerCase();
    if (lower.startsWith('data:text/html')) return 'Sosyal Medya Landing (HTML)';
    if (lower.startsWith('data:text/vcard')) return 'vCard (VCF)';
    if (!u) return '';
    if (u.length <= 40) return u;
    return `${u.slice(0, 28)}…${u.slice(-11)}`;
  };

  const download = async () => {
    if (!data.qrCodeImageUrl) return;
    const res = await fetch(data.qrCodeImageUrl);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.shortCode}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const copy = async (text: string) => {
<<<<<<< HEAD
    await navigator.clipboard.writeText(text);
=======
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      // Fallback for older browsers or non-secure contexts
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
>>>>>>> origin/feature/business-card-preview
  };

  const share = async () => {
    if ((navigator as any).share) {
      await (navigator as any).share({
<<<<<<< HEAD
        title: 'SmartQR',
=======
        title: 'netqr.io',
>>>>>>> origin/feature/business-card-preview
        text: 'QR Link',
        url: data.qrCodeUrl,
      });
    } else {
      await copy(data.qrCodeUrl);
    }
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-4 text-sm font-semibold text-slate-900">QR Hazır</div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-[240px,1fr]">
        <div className="flex items-center justify-center rounded-md border bg-slate-50 p-3">
          {data.qrCodeImageUrl ? (
            <img src={data.qrCodeImageUrl} alt="QR" className="h-52 w-52" />
          ) : (
            <div className="text-sm text-slate-500">QR görseli yok</div>
          )}
        </div>

        <div className="space-y-3">
          <div>
            <div className="text-xs font-semibold text-slate-500">Short Code</div>
            <div className="text-sm font-medium text-slate-900">{data.shortCode}</div>
          </div>

          <div>
            <div className="text-xs font-semibold text-slate-500">QR URL</div>
            <div className="flex items-start gap-2">
              <div className="min-w-0 text-sm text-slate-900 truncate" title={data.qrCodeUrl}>
                {truncate40(data.qrCodeUrl)}
              </div>
              <button
                type="button"
                className="shrink-0 inline-flex items-center justify-center h-8 w-8 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                onClick={() => copy(data.qrCodeUrl)}
                title="QR linkini kopyala"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-slate-500">Destination</div>
            <div className="flex items-start gap-2">
              <div
                className="min-w-0 text-sm text-slate-700 truncate"
                title={data.destinationUrl}
              >
                {getDestinationLabel(data.destinationUrl)}
              </div>
              <button
                type="button"
                className="shrink-0 inline-flex items-center justify-center h-8 w-8 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                onClick={() => copy(data.destinationUrl)}
                title="Hedefi kopyala"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <Button variant="secondary" onClick={() => copy(data.qrCodeUrl)}>
              Link Kopyala
            </Button>
            <Button variant="secondary" onClick={share}>
              Paylaş
            </Button>
            <Button onClick={download} disabled={!data.qrCodeImageUrl}>
              PNG İndir
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
