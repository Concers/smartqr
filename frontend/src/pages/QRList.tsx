import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Download, 
  Edit, 
  Trash2, 
  ExternalLink, 
  QrCode,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Copy
} from 'lucide-react';

import { qrService } from '../services/qrService';
import { useAuth } from '../hooks/useAuth';
import { isValidUrl } from '../utils/validators';
import { QREditModal } from '../components/QRList/QREditModal';
import { AdminLayout } from '../components/Layout/AdminLayout';

export default function QRListPage() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'Website' | 'vCard'>('all');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | undefined>();

  const { data, isLoading } = useQuery({
    queryKey: ['qrList', page, search],
    queryFn: () => qrService.list(page, 10, search).then((r) => r.data),
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

  const items: any[] = (data?.data?.data || []).map((d: any) => {
    const destinationUrl = d.destinationUrl;
    const isVCard = typeof destinationUrl === 'string' && destinationUrl.toLowerCase().startsWith('data:text/vcard');
    return {
      id: d.id,
      name: d.shortCode || `QR-${d.id}`,
      url: d.destinationUrl,
      type: isVCard ? 'vCard' : 'Website',
      status: d.isActive ? 'active' : 'paused',
      date: new Date(d.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' }),
      shortCode: d.shortCode,
      qrCodeUrl: d.qrCodeUrl,
      qrCodeImageUrl: d.qrCodeImageUrl,
      destinationUrl: d.destinationUrl,
      createdAt: d.createdAt,
      expiresAt: d.expiresAt,
      isActive: d.isActive,
    };
  });

  const filteredItems = items.filter((qr) => {
    if (statusFilter !== 'all' && qr.status !== statusFilter) return false;
    if (typeFilter !== 'all' && qr.type !== typeFilter) return false;
    return true;
  });

  const total = data?.data?.total || 0;
  const limit = 10;

  const handleCopyUrl = async (url: string) => {
    try {
<<<<<<< HEAD
      await navigator.clipboard.writeText(url);
=======
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement('textarea');
        textArea.value = url;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
>>>>>>> origin/feature/business-card-preview
      // Could add toast notification here
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = async (qrCodeImageUrl: string, shortCode: string) => {
    try {
      const res = await fetch(qrCodeImageUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${shortCode}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8 font-sans">
        
        {/* 1. Üst Kontrol Paneli (Toolbar) */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">QR Kodlarım</h1>
            <p className="text-sm text-slate-500">Tüm QR kodlarınızı yönetin, düzenleyin ve takip edin.</p>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Arama Çubuğu */}
            <div className="relative group w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-yellow-500 transition-colors" />
              <input 
                type="text" 
                placeholder="QR Ara..." 
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all shadow-sm"
              />
            </div>
            
            {/* Filtre Butonu */}
            <div className="relative">
              <button
                type="button"
                className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition-colors shadow-sm"
                onClick={() => setFiltersOpen((v) => !v)}
              >
                <Filter className="w-5 h-5" />
              </button>

              {filtersOpen ? (
                <div className="absolute right-0 mt-2 w-72 rounded-xl border border-slate-200 bg-white shadow-lg p-3 z-10">
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Durum</div>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          className={`px-2 py-2 rounded-lg text-xs font-medium border ${statusFilter === 'all' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
                          onClick={() => setStatusFilter('all')}
                        >
                          Tümü
                        </button>
                        <button
                          type="button"
                          className={`px-2 py-2 rounded-lg text-xs font-medium border ${statusFilter === 'active' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
                          onClick={() => setStatusFilter('active')}
                        >
                          Aktif
                        </button>
                        <button
                          type="button"
                          className={`px-2 py-2 rounded-lg text-xs font-medium border ${statusFilter === 'paused' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
                          onClick={() => setStatusFilter('paused')}
                        >
                          Durak
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Tür</div>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          className={`px-2 py-2 rounded-lg text-xs font-medium border ${typeFilter === 'all' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
                          onClick={() => setTypeFilter('all')}
                        >
                          Tümü
                        </button>
                        <button
                          type="button"
                          className={`px-2 py-2 rounded-lg text-xs font-medium border ${typeFilter === 'Website' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
                          onClick={() => setTypeFilter('Website')}
                        >
                          Web
                        </button>
                        <button
                          type="button"
                          className={`px-2 py-2 rounded-lg text-xs font-medium border ${typeFilter === 'vCard' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
                          onClick={() => setTypeFilter('vCard')}
                        >
                          vCard
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        className="text-xs font-medium text-slate-600 hover:text-slate-900"
                        onClick={() => {
                          setStatusFilter('all');
                          setTypeFilter('all');
                        }}
                      >
                        Sıfırla
                      </button>
                      <button
                        type="button"
                        className="text-xs font-medium text-slate-600 hover:text-slate-900"
                        onClick={() => setFiltersOpen(false)}
                      >
                        Kapat
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
            
            {/* Yeni Oluştur Butonu */}
            <button 
              onClick={() => navigate('/qr/generate')}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-lg shadow-slate-200 hover:bg-slate-800 transition-transform active:scale-95 whitespace-nowrap"
            >
              <QrCode className="w-4 h-4" />
              <span className="hidden sm:inline">Yeni Oluştur</span>
            </button>
          </div>
        </div>

        {/* 2. Ana Tablo Alanı (Data Grid) */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">QR Detayı</th>
                  <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tür</th>
                  <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Durum</th>
                  <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tarih</th>
                  <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      Yükleniyor...
                    </td>
                  </tr>
                ) : filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      QR kod bulunamadı.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((qr) => (
                    <tr key={qr.id} className="group hover:bg-slate-50/80 transition-colors">
                      
                      {/* İsim ve URL */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                            <QrCode className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-sm">{qr.name}</div>
                            <div
                              className="flex items-center gap-2 text-xs text-slate-500 mt-0.5 group/link cursor-pointer"
<<<<<<< HEAD
                              onClick={() => handleCopyUrl(qr.type === 'vCard' ? qr.qrCodeUrl : qr.url)}
                            >
                              <span className="truncate max-w-[150px]">{qr.type === 'vCard' ? qr.qrCodeUrl : qr.url}</span>
=======
                              onClick={() => handleCopyUrl(qr.qrCodeUrl)}
                            >
                              <span className="truncate max-w-[150px]">{qr.qrCodeUrl}</span>
>>>>>>> origin/feature/business-card-preview
                              <Copy className="w-3 h-3 opacity-0 group-hover/link:opacity-100 transition-opacity hover:text-yellow-600" />
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Tür */}
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                          {qr.type}
                        </span>
                      </td>

                      {/* Durum (Badge) */}
                      <td className="py-4 px-6">
                        {qr.status === 'active' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Aktif
                          </span>
                        )}
                        {qr.status === 'paused' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Duraklatıldı
                          </span>
                        )}
                      </td>

                      {/* Tarih */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {qr.date}
                        </div>
                      </td>

                      {/* Aksiyon Butonları */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                          <button 
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" 
                            title="İstatistikler"
                            onClick={() => window.open(`/analytics/${qr.id}`, '_blank')}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                          <button 
                            className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors" 
                            title="Düzenle"
                            onClick={() => {
                              setEditingItem(qr);
                              setEditModalOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            className="p-2 text-slate-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors" 
                            title="İndir"
                            onClick={() => handleDownload(qr.qrCodeImageUrl, qr.shortCode)}
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button 
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" 
                            title="Sil"
                            onClick={() => {
                              if (window.confirm('Bu QR kod silinecek. Emin misiniz?')) {
                                deleteMutation.mutate([qr.id]);
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* 3. Pagination (Sayfalama) */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/30">
            <div className="text-sm text-slate-500">
              Toplam <span className="font-medium text-slate-900">{total}</span> kayıttan <span className="font-medium text-slate-900">{((page - 1) * limit) + 1}-{Math.min(page * limit, total)}</span> arası gösteriliyor
            </div>
            <div className="flex gap-2">
              <button 
                className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-slate-600 hover:border-slate-300 disabled:opacity-50"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-slate-600 hover:border-slate-300 disabled:opacity-50"
                onClick={() => setPage(page + 1)}
                disabled={page * limit >= total}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          
        </div>
      </div>

      {/* Edit Modal */}
      {editModalOpen && editingItem && (
        <QREditModal
          item={editingItem}
          open={editModalOpen}
          loading={updateMutation.isPending}
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
    </AdminLayout>
  );
}
