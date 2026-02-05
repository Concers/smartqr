import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function RateLimitPage() {
  const [searchParams] = useSearchParams();
  const retryAfter = parseInt(searchParams.get('retryAfter') || '900');
  const [timeLeft, setTimeLeft] = useState(retryAfter);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [retryAfter]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
            <svg className="h-8 w-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-lg font-semibold text-slate-900">Rate Limit Aşıldı</div>
          <div className="text-sm text-slate-600">
            Çok fazla istek gönderdiniz. Lütfen bekleyin.
          </div>
        </div>

        <div className="mb-6 text-center">
          <div className="text-3xl font-mono font-bold text-amber-600">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
          <div className="text-xs text-slate-500 mt-1">Kalan süre</div>
        </div>

        <div className="space-y-3">
          <div className="rounded-lg bg-slate-50 p-3">
            <div className="text-xs font-medium text-slate-700 mb-1">Ne oldu?</div>
            <div className="text-xs text-slate-600">
              Analytics verilerini çekerken çok fazla istek gönderildi. Sistem, kötüye kullanımı önlemek için geçici olarak engelledi.
            </div>
          </div>

          <div className="rounded-lg bg-slate-50 p-3">
            <div className="text-xs font-medium text-slate-700 mb-1">Çözüm</div>
            <div className="text-xs text-slate-600">
              Süre dolunca sayfayı yenileyin veya bekleyin. Gelecekte bu hatayı önlemek için daha az sık istek gönderin.
            </div>
          </div>
        </div>

        {timeLeft === 0 ? (
          <button
            onClick={() => window.location.href = '/analytics'}
            className="mt-4 w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            Analytics Sayfasına Geri Dön
          </button>
        ) : null}
      </div>
    </div>
  );
}
