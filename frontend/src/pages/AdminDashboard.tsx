import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  QrCode, 
  Plus, 
  BarChart3, 
  Users, 
  TrendingUp,
  Activity,
  Calendar,
  Search,
  Filter,
  Edit,
  Trash2,
  Download,
  ExternalLink,
  Copy,
  ChevronRight,
  Eye,
  Clock,
  Globe,
  Smartphone,
  Monitor
} from 'lucide-react';
import { AdminLayout } from '../components/Layout/AdminLayout';
import { qrService } from '../services/qrService';
import { useAuth } from '../hooks/useAuth';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const displayName = user?.name || user?.email || 'Kullanıcı';

  // Fetch real QR data
  const { data: qrData, isLoading } = useQuery({
    queryKey: ['qrList', 1, 10], // First page, 10 items
    queryFn: () => qrService.list(1, 10).then((r) => r.data),
    enabled: true,
  });

  // Transform real data to match our interface
  const recentQRCodes = (qrData?.data?.data || []).map((d: any) => ({
    id: d.id,
    name: d.shortCode || `QR-${d.id}`,
    url: d.destinationUrl,
    type: 'Website', // Default type, can be enhanced based on URL
    scans: Math.floor(Math.random() * 5000), // Placeholder until real scan data is available
    status: d.isActive ? 'active' : 'paused',
    date: new Date(d.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' }),
    shortCode: d.shortCode,
    qrCodeUrl: d.qrCodeUrl,
    qrCodeImageUrl: d.qrCodeImageUrl,
  }));

  // Mock stats data (can be enhanced with real analytics)
  const stats = {
    totalQRs: qrData?.data?.total || 0,
    activeQRs: recentQRCodes.filter((qr: any) => qr.status === 'active').length,
    totalScans: recentQRCodes.reduce((sum: number, qr: any) => sum + qr.scans, 0),
    thisMonthScans: Math.floor(recentQRCodes.reduce((sum: number, qr: any) => sum + qr.scans, 0) * 0.3), // Estimate
    conversionRate: 24.5 // Mock data
  };

  const filteredQRCodes = recentQRCodes.filter((qr: any) =>
    qr.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    qr.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
    qr.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCopyUrl = async (url: string) => {
    try {
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
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">
            Hoş Geldin, {displayName}! 👋
          </h1>
          <p className="text-slate-500 mt-2">
            QR kodlarınızı yönetin, performansı takip edin ve yeni kodlar oluşturun.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <QrCode className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-sm text-green-600 font-medium">+12%</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.totalQRs}</div>
            <div className="text-sm text-slate-500">Toplam QR Kodu</div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-sm text-green-600 font-medium">+8%</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">32</div>
            <div className="text-sm text-slate-500">Toplam Tıklama</div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-50 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-sm text-green-600 font-medium">+15%</span>
            </div>
            <div className="text-2xl font-bold text-slate-900"></div>
            <div className="text-sm text-slate-500">Bu Ay Tarama</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <button 
            onClick={() => navigate('/qr/generate')}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <div className="flex items-center gap-3 mb-2">
                  <Plus className="w-6 h-6" />
                  <span className="text-lg font-semibold">Yeni QR Kod Oluştur</span>
                </div>
                <p className="text-blue-100 text-sm">Hemen yeni bir QR kodu oluşturun</p>
              </div>
              <ChevronRight className="w-5 h-5 text-blue-200 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          <button 
            onClick={() => navigate('/analytics')}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <div className="flex items-center gap-3 mb-2">
                  <BarChart3 className="w-6 h-6" />
                  <span className="text-lg font-semibold">Analitikleri Gör</span>
                </div>
                <p className="text-green-100 text-sm">Detaylı performans raporları</p>
              </div>
              <ChevronRight className="w-5 h-5 text-green-200 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          <button 
            onClick={() => navigate('/pricing')}
            className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="w-6 h-6" />
                  <span className="text-lg font-semibold">Paket Yönetimi</span>
                </div>
                <p className="text-purple-100 text-sm">Kullanıcı ve paket yönetimi</p>
              </div>
              <ChevronRight className="w-5 h-5 text-purple-200 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>

        {/* Recent QR Codes */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Son QR Kodlar</h2>
                <p className="text-sm text-slate-500 mt-1">En son oluşturulan QR kodlarınız</p>
              </div>
              <button 
                onClick={() => navigate('/qr/list')}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                Tümünü Gör
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="QR kodlarında ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400"
              />
            </div>
          </div>

          {/* QR Codes List */}
          <div className="divide-y divide-slate-100">
            {isLoading ? (
              <div className="p-8 text-center text-slate-500">
                <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p>QR kodlar yükleniyor...</p>
              </div>
            ) : filteredQRCodes.length > 0 ? (
              filteredQRCodes.map((qr: any) => (
                <div key={qr.id} className="p-4 hover:bg-slate-50 transition-colors group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center">
                        <QrCode className="w-5 h-5 text-slate-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-slate-900 truncate">{qr.name}</div>
                        <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                          <span className="flex items-center gap-1">
                            <Globe className="w-3 h-3" />
                            {qr.type}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {qr.scans} tarama
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {qr.date}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        qr.status === 'active' 
                          ? 'bg-green-50 text-green-700'
                          : qr.status === 'paused'
                          ? 'bg-yellow-50 text-yellow-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {qr.status === 'active' ? 'Aktif' : qr.status === 'paused' ? 'Duraklatıldı' : 'Arşiv'}
                      </span>
                      
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleCopyUrl(qr.url)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="URL'yi kopyala"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => navigate(`/analytics/${qr.id}`)}
                          className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                          title="Analitikleri gör"
                        >
                          <BarChart3 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => navigate(`/qr/list`)}
                          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
                          title="Düzenle"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-500">
                <QrCode className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="font-medium">QR kod bulunamadı</p>
                <p className="text-sm mt-1">Yeni bir QR kodu oluşturun veya arama terimini değiştirin</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
