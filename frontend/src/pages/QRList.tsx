import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { Header } from '../components/Common/Header';
import { QRListTable, QRListItem } from '../components/QRList/QRListTable';
import { QREditModal } from '../components/QRList/QREditModal';
import { qrService } from '../services/qrService';
import { useAuth } from '../hooks/useAuth';
import { isValidUrl } from '../utils/validators';
import { Button } from '../components/Common/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

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
    <div className="min-h-screen bg-cream">
      <Header />
      
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="text-4xl font-bold text-dark mb-4">QR Listesi</div>
            <div className="text-2xl text-dark mb-8">
              Oluşturduğunuz QR kodları <span className="text-green">yönetin</span> ve optimize edin
            </div>
          </div>

          {/* Actions Card */}
          <Card className="border-2 border-dark/10 shadow-[4px_4px_0_0_#1F2937] transition-transform hover:translate-y-1 mb-8">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-dark">QR Kod Yönetimi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-dark/70">
                  QR kodlarınızı yönetin, linkleri kopyalayın ve durumlarını değiştirin.
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Button
                    variant="outline"
                    onClick={() => queryClient.invalidateQueries({ queryKey: ['qrList'] })}
                    className="h-10 border-2 border-dark hover:bg-dark hover:text-cream transition-colors"
                  >
                    Yenile
                  </Button>
                  <Button 
                    onClick={() => navigate('/qr/generate')} 
                    className="h-10 bg-yellow text-dark hover:bg-yellow/90 transition-colors shadow-[2px_2px_0_0_#1F2937] active:translate-y-0.5"
                  >
                    QR Oluştur
                  </Button>
                </div>
              </div>

              {/* Stats */}
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border-2 border-dark/20 bg-yellow/20 p-4 text-center">
                  <div className="text-sm font-bold text-dark/60">Toplam</div>
                  <div className="mt-1 text-2xl font-bold text-dark">{total}</div>
                </div>
                <div className="rounded-2xl border-2 border-dark/20 bg-green/20 p-4 text-center">
                  <div className="text-sm font-bold text-dark/60">Sayfa</div>
                  <div className="mt-1 text-2xl font-bold text-dark">{page}</div>
                </div>
                <div className="rounded-2xl border-2 border-dark/20 bg-coral/20 p-4 text-center">
                  <div className="text-sm font-bold text-dark/60">Limit</div>
                  <div className="mt-1 text-2xl font-bold text-dark">{limit}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Table */}
          <Card className="border-2 border-dark/10 shadow-[4px_4px_0_0_#1F2937] transition-transform hover:translate-y-1">
            <CardContent className="p-6">
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
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Modal */}
      {editModalOpen && editingItem && (
        <QREditModal
          item={editingItem}
          open={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setEditingItem(undefined);
          }}
          onSubmit={(values) => {
            updateMutation.mutate({
              id: editingItem.id,
              destinationUrl: values.destinationUrl,
              isActive: values.isActive,
              expiresAt: values.expiresAt,
            });
          }}
        />
      )}
    </div>
  );
}
