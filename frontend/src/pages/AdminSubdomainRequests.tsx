import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Globe, RefreshCw, ShieldCheck, XCircle, PencilLine } from 'lucide-react';

import { AdminLayout } from '../components/Layout/AdminLayout';
import { useAuth } from '../hooks/useAuth';
import { subdomainRequestService, SubdomainRequestItem, SubdomainRequestStatus } from '../services/subdomainRequestService';

const ADMIN_EMAILS = ['admin@netqr.io', 'admin@admin.com'];

export default function AdminSubdomainRequestsPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [status, setStatus] = useState<SubdomainRequestStatus | 'all'>('pending');
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [rejectReason, setRejectReason] = useState<Record<string, string>>({});
  const [editValue, setEditValue] = useState<Record<string, string>>({});

  const isAdmin = !!user?.email && ADMIN_EMAILS.includes(user.email);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['adminSubdomainRequests', status, page, limit],
    queryFn: () => subdomainRequestService.adminList(status === 'all' ? undefined : status, page, limit).then((r) => r.data),
    enabled: isAdmin,
    staleTime: 0,
  });

  const requests: SubdomainRequestItem[] = useMemo(() => {
    return (data?.data?.requests || data?.requests || []) as SubdomainRequestItem[];
  }, [data]);

  const pagination = data?.data?.pagination || data?.pagination;

  const approveMutation = useMutation({
    mutationFn: (id: string) => subdomainRequestService.adminApprove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminSubdomainRequests'] }),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => subdomainRequestService.adminReject(id, reason),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminSubdomainRequests'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, requestedSubdomain }: { id: string; requestedSubdomain: string }) =>
      subdomainRequestService.adminUpdate(id, requestedSubdomain),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminSubdomainRequests'] }),
  });

  if (!isAdmin) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center">
                <ShieldCheck className="h-5 w-5 text-slate-700" />
              </div>
              <div>
                <div className="text-lg font-semibold text-slate-900">Admin erişimi gerekli</div>
                <div className="text-sm text-slate-600">Bu sayfaya sadece admin kullanıcılar erişebilir.</div>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-yellow-400 text-slate-900 flex items-center justify-center">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">Subdomain Talepleri</div>
              <div className="text-sm text-slate-600">Kullanıcıların subdomain isteklerini incele ve onayla</div>
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

        <div className="rounded-xl border border-slate-200 bg-white">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {(['pending', 'approved', 'rejected', 'all'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setStatus(s);
                    setPage(1);
                  }}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    status === s
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {s === 'pending' && 'Bekliyor'}
                  {s === 'approved' && 'Onaylandı'}
                  {s === 'rejected' && 'Reddedildi'}
                  {s === 'all' && 'Tümü'}
                </button>
              ))}
            </div>
            <div className="text-sm text-slate-500">{isLoading ? 'Yükleniyor...' : `${requests.length} kayıt`}</div>
          </div>

          <div className="divide-y divide-slate-200">
            {requests.map((r) => {
              const reason = rejectReason[r.id] || '';
              const edit = editValue[r.id] ?? r.requestedSubdomain;

              return (
                <div key={r.id} className="p-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <div className="text-base font-semibold text-slate-900">
                        {r.requestedSubdomain}.netqr.io
                      </div>
                      <div className="mt-1 text-sm text-slate-600">
                        <span className="font-medium">Kullanıcı:</span> {r.user?.email || '-'}
                        {r.user?.subdomain ? (
                          <>
                            {' '}<span className="text-slate-400">|</span>{' '}
                            <span className="font-medium">Mevcut:</span> {r.user.subdomain}.netqr.io
                          </>
                        ) : null}
                      </div>
                      <div className="mt-1 text-xs text-slate-500">Status: {r.status}</div>
                      {r.adminNotes ? (
                        <div className="mt-1 text-xs text-rose-700">Admin notu: {r.adminNotes}</div>
                      ) : null}
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      {r.status === 'pending' ? (
                        <>
                          <div className="flex items-center gap-2">
                            <input
                              value={edit}
                              onChange={(e) => setEditValue((prev) => ({ ...prev, [r.id]: e.target.value }))}
                              className="w-44 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                            />
                            <button
                              onClick={() => updateMutation.mutate({ id: r.id, requestedSubdomain: (edit || '').trim().toLowerCase() })}
                              disabled={updateMutation.isPending}
                              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                              title="Düzenle"
                            >
                              <PencilLine className="h-4 w-4" />
                              Güncelle
                            </button>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => approveMutation.mutate(r.id)}
                              disabled={approveMutation.isPending}
                              className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              Onayla
                            </button>
                            <button
                              onClick={() => rejectMutation.mutate({ id: r.id, reason: reason || 'Rejected' })}
                              disabled={rejectMutation.isPending}
                              className="inline-flex items-center justify-center gap-2 rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
                            >
                              <XCircle className="h-4 w-4" />
                              Reddet
                            </button>
                          </div>
                          <input
                            value={reason}
                            onChange={(e) => setRejectReason((prev) => ({ ...prev, [r.id]: e.target.value }))}
                            placeholder="Red sebebi (opsiyonel)"
                            className="w-full sm:w-64 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                          />
                        </>
                      ) : (
                        <div className="text-sm text-slate-600">Aksiyon yok</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {!isLoading && requests.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-600">Kayıt bulunamadı.</div>
            ) : null}
          </div>

          <div className="flex items-center justify-between border-t border-slate-200 p-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              Önceki
            </button>
            <div className="text-sm text-slate-600">
              Sayfa {page}
              {pagination?.pages ? ` / ${pagination.pages}` : ''}
            </div>
            <button
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Sonraki
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
