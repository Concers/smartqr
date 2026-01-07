import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { QRListTable, QRListItem } from '../components/QRList/QRListTable';
import { QREditModal } from '../components/QRList/QREditModal';
import { qrService } from '../services/qrService';
import { useAuth } from '../hooks/useAuth';
import { isValidUrl } from '../utils/validators';

export default function QRListPage() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

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
    mutationFn: async ({ id, destinationUrl, isActive }: any) =>
      qrService.updateDestination(id, destinationUrl, undefined, isActive),
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
    <div className="space-y-4">
      <div className="text-lg font-semibold text-slate-900">QR Listesi</div>

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
          });
        }}
      />
    </div>
  );
}
