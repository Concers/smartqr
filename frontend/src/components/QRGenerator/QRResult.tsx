import { Button } from '../Common/Button';

export type QRResultData = {
  shortCode: string;
  qrCodeUrl: string;
  qrCodeImageUrl?: string;
  destinationUrl: string;
};

export function QRResult({ data }: { data: QRResultData }) {
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
    await navigator.clipboard.writeText(text);
  };

  const share = async () => {
    if ((navigator as any).share) {
      await (navigator as any).share({
        title: 'SmartQR',
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
            <div className="break-all text-sm text-slate-900">{data.qrCodeUrl}</div>
          </div>

          <div>
            <div className="text-xs font-semibold text-slate-500">Destination</div>
            <div className="break-all text-sm text-slate-700">{data.destinationUrl}</div>
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
