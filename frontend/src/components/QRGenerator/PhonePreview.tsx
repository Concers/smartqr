import { QRResultData } from './QRResult';

export function PhonePreview({
  step,
  selectedTypeTitle,
  result,
}: {
  step: number;
  selectedTypeTitle?: string;
  result?: QRResultData | null;
}) {
  const headline = step === 1 ? 'Sol taraftan bir QR kodu türü seçin' : step === 2 ? 'İçeriği ekleyin' : step === 3 ? 'Tasarımı seçin' : 'QR kodunuz hazır';

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mx-auto w-full max-w-[260px] rounded-[32px] border border-slate-200 bg-slate-50 p-4">
        <div className="mx-auto mb-4 h-4 w-24 rounded-full bg-slate-200" />

        <div className="flex items-center justify-center">
          <div className="flex h-44 w-44 items-center justify-center rounded-2xl bg-white shadow-sm">
            {result?.qrCodeImageUrl ? (
              <img src={result.qrCodeImageUrl} alt="QR" className="h-40 w-40" />
            ) : (
              <div className="text-center text-xs text-slate-500">
                {selectedTypeTitle ? (
                  <div className="font-semibold text-slate-700">{selectedTypeTitle}</div>
                ) : null}
                <div className="mt-2">{headline}</div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 text-center text-xs font-semibold text-slate-700">{headline}</div>
      </div>
    </div>
  );
}
