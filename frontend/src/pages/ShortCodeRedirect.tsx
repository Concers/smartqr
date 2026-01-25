import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Button } from '../components/Common/Button';

type ResolveStatus = 'loading' | 'active' | 'inactive' | 'not_found' | 'error';

export default function ShortCodeRedirectPage() {
  const { shortCode } = useParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState<ResolveStatus>('loading');

  const targetUrl = useMemo(() => {
    if (!shortCode) return null;
    return `${window.location.origin}/${shortCode}`;
  }, [shortCode]);

  const [secondsLeft, setSecondsLeft] = useState(3);

  useEffect(() => {
    const run = async () => {
      if (!shortCode) {
        setStatus('not_found');
        return;
      }

      try {
        setStatus('loading');
        const res = await fetch(`${window.location.origin}/api/qr/resolve/${encodeURIComponent(shortCode)}`);
        const json = await res.json();
        const st = json?.data?.status as ResolveStatus | undefined;

        if (st === 'active') setStatus('active');
        else if (st === 'inactive') setStatus('inactive');
        else if (st === 'not_found') setStatus('not_found');
        else setStatus('error');
      } catch {
        setStatus('error');
      }
    };

    run();
  }, [shortCode]);

  useEffect(() => {
    if (status !== 'active') return;
    if (!targetUrl) return;

    setSecondsLeft(3);
    const timer = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          window.clearInterval(timer);
          window.location.href = targetUrl;
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [status, targetUrl]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm text-center">
        {status === 'active' ? (
          <>
            <div className="text-lg font-semibold text-slate-900">Kısa link açılıyor</div>
            <div className="mt-2 text-sm text-slate-600">
              {secondsLeft} saniye içinde yönlendirileceksiniz.
            </div>

            <div className="mt-5 flex justify-center gap-2">
              <Button
                onClick={() => {
                  if (targetUrl) window.location.href = targetUrl;
                }}
                disabled={!targetUrl}
                className="px-6"
              >
                Siteye Git
              </Button>
            </div>
          </>
        ) : null}

        {status === 'inactive' ? (
          <>
            <div className="text-lg font-semibold text-slate-900">QR kod aktif değil</div>
            <div className="mt-2 text-sm text-slate-600">
              Bu QR kod devre dışı bırakılmış olabilir veya süresi dolmuş olabilir.
            </div>
            <div className="mt-5 flex justify-center gap-2">
              <Button variant="outline" className="px-6" onClick={() => navigate('/')}>Anasayfa</Button>
              <Button className="px-6" onClick={() => navigate('/login')}>Giriş Yap</Button>
            </div>
          </>
        ) : null}

        {status === 'not_found' ? (
          <>
            <div className="text-lg font-semibold text-slate-900">QR kod bulunamadı</div>
            <div className="mt-2 text-sm text-slate-600">
              Bu kısa kod geçersiz olabilir.
            </div>
            <div className="mt-5 flex justify-center gap-2">
              <Button variant="outline" className="px-6" onClick={() => navigate('/')}>Anasayfa</Button>
            </div>
          </>
        ) : null}

        {status === 'loading' ? (
          <>
            <div className="text-lg font-semibold text-slate-900">Kontrol ediliyor…</div>
            <div className="mt-2 text-sm text-slate-600">Lütfen bekleyin.</div>
          </>
        ) : null}

        {status === 'error' ? (
          <>
            <div className="text-lg font-semibold text-slate-900">Bir hata oluştu</div>
            <div className="mt-2 text-sm text-slate-600">Lütfen daha sonra tekrar deneyin.</div>
            <div className="mt-5 flex justify-center gap-2">
              <Button variant="outline" className="px-6" onClick={() => navigate('/')}>Anasayfa</Button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
