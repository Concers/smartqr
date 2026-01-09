import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { QRListTable, QRListItem } from '../components/QRList/QRListTable';
import { QREditModal } from '../components/QRList/QREditModal';
import { qrService } from '../services/qrService';
import { useAuth } from '../hooks/useAuth';
import { isValidUrl } from '../utils/validators';
import { Button } from '../components/Common/Button';

export default function QRListPage() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<QRListItem | undefined>();

  const { data, isLoading } = useQuery({
    queryKey: ['qrList', page, search],
    queryFn: () => qrService.list(page, 10).then((r) => r.data),
    enabled: isAuthenticated,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, destinationUrl, isActive, expiresAt }: any) =>
      qrService.updateDestination(id, destinationUrl, undefined, isActive, expiresAt),
    onSuccess: () => {
      setEditModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['qrList'] });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, active }: any) => qrService.toggleActive(id, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['qrList'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (ids: string[]) => Promise.all(ids.map((id) => qrService.delete(id))),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['qrList'] });
    },
  });

  const items: QRListItem[] = (data?.data?.data || []).map((d: any) => ({
    id: d.id,
    shortCode: d.shortCode,
    qrCodeUrl: d.qrCodeUrl,
    qrCodeImageUrl: d.qrCodeImageUrl,
    destinationUrl: d.destinationUrl,
    createdAt: d.createdAt,
    expiresAt: d.expiresAt,
    isActive: d.isActive,
  }));

  const total = data?.data?.total || 0;
  const limit = 10;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-2xl font-bold text-slate-900">QR Listesi</div>
            <div className="mt-1 text-sm text-slate-600">
              Oluşturduğunuz QR kodları yönetin, linkleri kopyalayın ve durumlarını değiştirin.
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Button
              variant="outline"
              onClick={() => queryClient.invalidateQueries({ queryKey: ['qrList'] })}
              className="h-10"
            >
              Yenile
            </Button>
            <Button onClick={() => navigate('/qr/generate')} className="h-10">
              QR Oluştur
            </Button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="text-xs font-semibold text-slate-500">Toplam</div>
            <div className="mt-1 text-lg font-bold text-slate-900">{total}</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="text-xs font-semibold text-slate-500">Sayfa</div>
            <div className="mt-1 text-lg font-bold text-slate-900">{page}</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="text-xs font-semibold text-slate-500">Kayıt/Sayfa</div>
            <div className="mt-1 text-lg font-bold text-slate-900">{limit}</div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <QRListTable
          data={items}
          loading={isLoading}
          page={page}
          limit={limit}
          total={total}
          onPageChange={setPage}
          onSearchChange={(q) => {
            setSearch(q);
            setPage(1);
          }}
          onEdit={(item) => {
            setEditingItem(item);
            setEditModalOpen(true);
          }}
          onToggleActive={(id, active) => toggleActiveMutation.mutate({ id, active })}
          onDelete={(ids) => {
            if (window.confirm(`${ids.length} QR silinecek. Emin misiniz?`)) {
              deleteMutation.mutate(ids);
            }
          }}
        />
      </div>

      <QREditModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        item={editingItem}
        loading={updateMutation.isPending}
        onSubmit={(values) => {
          if (!editingItem) return;
          if (!isValidUrl(values.destinationUrl.trim())) {
            alert('Geçerli bir URL girin');
            return;
          }
          updateMutation.mutate({
            id: editingItem.id,
            destinationUrl: values.destinationUrl.trim(),
            isActive: values.isActive,
            expiresAt: values.expiresAt,
          });
        }}
      />
    </div>
  );
}
