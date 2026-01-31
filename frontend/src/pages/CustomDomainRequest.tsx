import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Globe, RefreshCw, Copy, CheckCircle2, XCircle } from 'lucide-react';

import { AdminLayout } from '../components/Layout/AdminLayout';
import { customDomainService, CustomDomainItem, VerificationInstructions } from '../services/customDomainService';

export default function CustomDomainRequestPage() {
  const queryClient = useQueryClient();

  const [domain, setDomain] = useState('');
  const [lastInstructions, setLastInstructions] = useState<VerificationInstructions | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const normalizeDomain = (input: string) => {
    let d = (input || '').trim().toLowerCase();
    d = d.replace(/^https?:\/\//, '');
    d = d.split('/')[0];
    d = d.split('?')[0];
    d = d.split('#')[0];
    d = d.replace(/\.$/, '');
    return d;
  };

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['myCustomDomains'],
    queryFn: () => customDomainService.myDomains().then((r) => r.data),
    staleTime: 0,
  });

  const domains: CustomDomainItem[] = useMemo(() => {
    return (data?.data?.domains || data?.domains || []) as CustomDomainItem[];
  }, [data]);

  const requestMutation = useMutation({
    mutationFn: (d: string) => customDomainService.request(d),
    onSuccess: (res) => {
      const instructions = res?.data?.data?.verificationInstructions as VerificationInstructions | undefined;
      if (instructions) setLastInstructions(instructions);
      setDomain('');
      setErrorMessage(null);
      queryClient.invalidateQueries({ queryKey: ['myCustomDomains'] });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || 'Domain isteği gönderilemedi';
      setErrorMessage(String(msg));
    },
  });

  const verifyMutation = useMutation({
    mutationFn: (d: string) => customDomainService.verifyDns(d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myCustomDomains'] });
    },
  });

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text);
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-yellow-400 text-slate-900 flex items-center justify-center">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">Custom Domain</div>
              <div className="text-sm text-slate-600">Domain talebi oluştur, DNS doğrula, admin onayını bekle</div>
            </div>
          </div>

          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            Yenile
          </button>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-sm font-semibold text-slate-900">Yeni Domain Talebi</div>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="ornek.com"
              className="w-full flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-900/10"
            />
            <button
              onClick={() => {
                const normalized = normalizeDomain(domain);
                setDomain(normalized);
                setErrorMessage(null);
                requestMutation.mutate(normalized);
              }}
              disabled={!domain || requestMutation.isPending}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
            >
              Talep Gönder
            </button>
          </div>

          {errorMessage ? (
            <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
              {errorMessage}
              <div className="mt-1 text-xs text-rose-700/80">
                Geçerli örnekler:
                {' '}<span className="font-mono">example.com</span>,
                {' '}<span className="font-mono">sub.example.com</span>
                {' '}(**port veya path olmadan**)
              </div>
            </div>
          ) : null}

          {lastInstructions ? (
            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="text-xs font-semibold text-slate-600">DNS Doğrulama (TXT Record)</div>
              <div className="mt-2 grid gap-2 sm:grid-cols-3">
                <div>
                  <div className="text-[11px] font-medium text-slate-500">Type</div>
                  <div className="text-sm font-semibold text-slate-900">TXT</div>
                </div>
                <div>
                  <div className="text-[11px] font-medium text-slate-500">Name</div>
                  <div className="text-sm font-mono text-slate-900 break-all">{lastInstructions.name}</div>
                </div>
                <div>
                  <div className="text-[11px] font-medium text-slate-500">Value</div>
                  <div className="flex items-start gap-2">
                    <div className="text-sm font-mono text-slate-900 break-all">{lastInstructions.value}</div>
                    <button
                      onClick={() => copy(lastInstructions.value)}
                      className="rounded-md border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50"
                      title="Kopyala"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="mt-2 text-xs text-slate-600">
                TXT kaydını ekledikten sonra DNS yayılması 5-30 dk sürebilir.
              </div>
            </div>
          ) : null}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 p-4 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-900">Taleplerim</div>
              <div className="text-xs text-slate-600">Pending talepler admin onayı bekler</div>
            </div>
            <div className="text-sm text-slate-500">{isLoading ? 'Yükleniyor...' : `${domains.length} kayıt`}</div>
          </div>

          <div className="divide-y divide-slate-200">
            {domains.map((d) => (
              <div key={d.id} className="p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="truncate text-base font-semibold text-slate-900">{d.domain}</div>
                      {d.dnsVerified ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                          <CheckCircle2 className="h-3.5 w-3.5" /> DNS OK
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                          <XCircle className="h-3.5 w-3.5" /> DNS Bekliyor
                        </span>
                      )}
                    </div>
                    <div className="mt-1 text-xs text-slate-600">Status: {d.status}</div>
                    {d.adminNotes ? (
                      <div className="mt-1 text-xs text-rose-700">Admin notu: {d.adminNotes}</div>
                    ) : null}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => verifyMutation.mutate(d.domain)}
                      disabled={verifyMutation.isPending}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                    >
                      DNS Kontrol Et
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {!isLoading && domains.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-600">Henüz domain talebin yok.</div>
            ) : null}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
