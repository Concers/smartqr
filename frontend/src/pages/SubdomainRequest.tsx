import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Clock, Globe, RefreshCw, XCircle } from 'lucide-react';

import { AdminLayout } from '../components/Layout/AdminLayout';
import { subdomainRequestService, SubdomainRequestItem } from '../services/subdomainRequestService';

export default function SubdomainRequestPage() {
  const queryClient = useQueryClient();

  const [requestedSubdomain, setRequestedSubdomain] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const normalize = (input: string) => (input || '').trim().toLowerCase();

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['mySubdomainRequests'],
    queryFn: () => subdomainRequestService.myRequests().then((r) => r.data),
    staleTime: 0,
  });

  const requests: SubdomainRequestItem[] = useMemo(() => {
    return (data?.data?.requests || data?.requests || []) as SubdomainRequestItem[];
  }, [data]);

  const createMutation = useMutation({
    mutationFn: (sub: string) => subdomainRequestService.create(sub),
    onSuccess: () => {
      setRequestedSubdomain('');
      setErrorMessage(null);
      queryClient.invalidateQueries({ queryKey: ['mySubdomainRequests'] });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || 'Subdomain talebi gönderilemedi';
      setErrorMessage(String(msg));
    },
  });

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-yellow-400 text-slate-900 flex items-center justify-center">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">Subdomain Talebi</div>
              <div className="text-sm text-slate-600">İstediğin subdomain'i gönder, admin onaylasın</div>
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
          <div className="text-sm font-semibold text-slate-900">Yeni Talep</div>
          <div className="mt-1 text-xs text-slate-600">Örnek: <span className="font-mono">mybrand</span> → URL: <span className="font-mono">mybrand.netqr.io</span></div>

          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex-1">
              <div className="flex">
                <input
                  value={requestedSubdomain}
                  onChange={(e) => setRequestedSubdomain(e.target.value)}
                  placeholder="mybrand"
                  className="w-full rounded-l-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-900/10"
                />
                <div className="inline-flex items-center rounded-r-lg border border-l-0 border-slate-200 bg-slate-50 px-3 text-sm text-slate-600">
                  .netqr.io
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                const normalized = normalize(requestedSubdomain);
                setRequestedSubdomain(normalized);
                setErrorMessage(null);
                createMutation.mutate(normalized);
              }}
              disabled={!requestedSubdomain || createMutation.isPending}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
            >
              Talep Gönder
            </button>
          </div>

          {errorMessage ? (
            <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
              {errorMessage}
              <div className="mt-1 text-xs text-rose-700/80">
                Kurallar: 3-30 karakter, sadece <span className="font-mono">a-z</span>, <span className="font-mono">0-9</span>, <span className="font-mono">-</span>. Başta/sonda '-' olamaz.
              </div>
            </div>
          ) : null}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 p-4 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-900">Taleplerim</div>
              <div className="text-xs text-slate-600">Onaylanınca subdomain'in güncellenir</div>
            </div>
            <div className="text-sm text-slate-500">{isLoading ? 'Yükleniyor...' : `${requests.length} kayıt`}</div>
          </div>

          <div className="divide-y divide-slate-200">
            {requests.map((r) => (
              <div key={r.id} className="p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="text-base font-semibold text-slate-900">{r.requestedSubdomain}.netqr.io</div>
                      {r.status === 'pending' ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                          <Clock className="h-3.5 w-3.5" /> Bekliyor
                        </span>
                      ) : r.status === 'approved' ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Onaylandı
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700">
                          <XCircle className="h-3.5 w-3.5" /> Reddedildi
                        </span>
                      )}
                    </div>
                    {r.adminNotes ? (
                      <div className="mt-1 text-xs text-rose-700">Admin notu: {r.adminNotes}</div>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}

            {!isLoading && requests.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-600">Henüz subdomain talebin yok.</div>
            ) : null}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
