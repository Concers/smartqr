import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Package, 
  Crown, 
  Zap, 
  Building, 
  Check, 
  X, 
  TrendingUp,
  Users,
  QrCode,
  Download,
  FileText,
  Calendar,
  CreditCard,
  Search,
  Filter
} from 'lucide-react';
import { AdminLayout } from '../components/Layout/AdminLayout';
import { pricingService, Package as PackageType, Purchase, Invoice } from '../services/pricingService';

export default function AdminPricingPage() {
  const [activeTab, setActiveTab] = useState<'packages' | 'purchases' | 'invoices'>('packages');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch real data
  const { data: packages, isLoading: packagesLoading } = useQuery({
    queryKey: ['pricingPackages'],
    queryFn: () => pricingService.getPackages(),
    refetchOnWindowFocus: false,
  });

  const { data: purchases, isLoading: purchasesLoading } = useQuery({
    queryKey: ['pricingPurchases'],
    queryFn: () => pricingService.getPurchases(),
    refetchOnWindowFocus: false,
  });

  const { data: invoices, isLoading: invoicesLoading } = useQuery({
    queryKey: ['pricingInvoices'],
    queryFn: () => pricingService.getInvoices(),
    refetchOnWindowFocus: false,
  });

  // Fetch stats data
  const { data: stats } = useQuery({
    queryKey: ['pricingStats'],
    queryFn: () => pricingService.getStats(),
    refetchOnWindowFocus: false,
  });

  const filteredPurchases = (purchases || []).filter(p => 
    (p.userId && p.userId.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (p.packageName && p.packageName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Paket Yönetimi</h1>
          <p className="text-slate-500 mt-2">Paketleri, satın almaları ve faturaları yönetin.</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8 bg-slate-100 p-1 rounded-lg w-fit">
          {[
            { key: 'packages', label: 'Paketler', icon: Package },
            { key: 'purchases', label: 'Satın Almalar', icon: CreditCard },
            { key: 'invoices', label: 'Faturalar', icon: FileText }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Packages Tab */}
        {activeTab === 'packages' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-500">Toplam Gelir</span>
                  <TrendingUp className="w-4 h-4 text-green-500" />
                </div>
                <div className="text-2xl font-bold text-slate-900">₺{stats?.totalRevenue || 0}</div>
                <div className="text-xs text-green-600 mt-1">+{stats?.monthlyGrowth?.revenue || 0}% bu ay</div>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-500">Aktif Kullanıcı</span>
                  <Users className="w-4 h-4 text-blue-500" />
                </div>
                <div className="text-2xl font-bold text-slate-900">{stats?.activeUsers || 0}</div>
                <div className="text-xs text-blue-600 mt-1">+{stats?.monthlyGrowth?.users || 0} bu ay</div>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-500">Toplam QR</span>
                  <QrCode className="w-4 h-4 text-purple-500" />
                </div>
                <div className="text-2xl font-bold text-slate-900">{stats?.userQRs || 0}</div>
                <div className="text-xs text-purple-600 mt-1">Sizin QR'larınız</div>
              </div>
            </div>

            {/* Package Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {(packages || []).map((pkg) => {
                const Icon = pkg.id === 'starter' ? Package : pkg.id === 'professional' ? Crown : Building;
                return (
                  <div key={pkg.id} className={`relative bg-white rounded-2xl border-2 ${
                    pkg.popular ? 'border-yellow-400 shadow-lg' : 'border-slate-200'
                  } overflow-hidden`}>
                    {pkg.popular && (
                      <div className="absolute top-0 right-0 bg-yellow-400 text-slate-900 text-xs font-bold px-3 py-1 rounded-bl-lg">
                        EN POPÜLER
                      </div>
                    )}
                    
                    <div className="p-8">
                      <div className="flex items-center justify-between mb-6">
                        <div className={`w-12 h-12 ${pkg.id === 'starter' ? 'bg-blue-500' : pkg.id === 'professional' ? 'bg-yellow-500' : 'bg-purple-500'} rounded-xl flex items-center justify-center`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-slate-900">₺{pkg.price}</div>
                          <div className="text-sm text-slate-500">/{pkg.period === 'monthly' ? 'ay' : 'yıl'}</div>
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-bold text-slate-900 mb-2">{pkg.name}</h3>
                      <div className="text-sm text-slate-500 mb-6">{pkg.activeUsers} aktif kullanıcı</div>
                      
                      <div className="space-y-3 mb-8">
                        {pkg.features.map((feature: string, index: number) => (
                          <div key={index} className="flex items-center gap-3">
                            <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                            <span className="text-sm text-slate-700">{feature}</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex gap-3">
                        <button className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-medium hover:bg-slate-800 transition-colors">
                          Düzenle
                        </button>
                        <button className="flex-1 border border-slate-200 text-slate-700 py-3 rounded-xl font-medium hover:bg-slate-50 transition-colors">
                          İstatistikler
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Purchases Tab */}
        {activeTab === 'purchases' && (
          <div className="space-y-6">
            {/* Search and Filter */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Kullanıcı ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-yellow-400"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50">
                <Filter className="w-4 h-4" />
                Filtrele
              </button>
            </div>

            {/* Purchases Table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-slate-700">Kullanıcı</th>
                    <th className="text-left p-4 text-sm font-medium text-slate-700">Paket</th>
                    <th className="text-left p-4 text-sm font-medium text-slate-700">Fiyat</th>
                    <th className="text-left p-4 text-sm font-medium text-slate-700">Tarih</th>
                    <th className="text-left p-4 text-sm font-medium text-slate-700">Durum</th>
                    <th className="text-left p-4 text-sm font-medium text-slate-700">Ödeme</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPurchases.map((purchase) => (
                    <tr key={purchase.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-4">
                        <div>
                          <div className="font-medium text-slate-900">Kullanıcı #{purchase.userId.slice(0, 8)}</div>
                          <div className="text-sm text-slate-500">user@example.com</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-medium text-slate-900">{purchase.packageName}</span>
                      </td>
                      <td className="p-4">
                        <span className="font-medium text-slate-900">₺{purchase.amount}</span>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-slate-900">{new Date(purchase.createdAt).toLocaleDateString('tr-TR')}</div>
                        {purchase.expiresAt && (
                          <div className="text-xs text-slate-500">Sonraki: {new Date(purchase.expiresAt).toLocaleDateString('tr-TR')}</div>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          purchase.status === 'completed' 
                            ? 'bg-green-50 text-green-700'
                            : purchase.status === 'pending'
                            ? 'bg-yellow-50 text-yellow-700'
                            : 'bg-red-50 text-red-700'
                        }`}>
                          {purchase.status === 'completed' ? 'Tamamlandı' : purchase.status === 'pending' ? 'Bekliyor' : 'İptal'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-slate-600">Kredi Kartı</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Invoices Tab */}
        {activeTab === 'invoices' && (
          <div className="space-y-6">
            {/* Invoices Table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-slate-700">Fatura No</th>
                    <th className="text-left p-4 text-sm font-medium text-slate-700">Kullanıcı</th>
                    <th className="text-left p-4 text-sm font-medium text-slate-700">Paket</th>
                    <th className="text-left p-4 text-sm font-medium text-slate-700">Tutar</th>
                    <th className="text-left p-4 text-sm font-medium text-slate-700">Tarih</th>
                    <th className="text-left p-4 text-sm font-medium text-slate-700">Durum</th>
                    <th className="text-left p-4 text-sm font-medium text-slate-700">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {(invoices || []).map((invoice) => (
                    <tr key={invoice.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-4">
                        <span className="font-mono text-sm font-medium text-slate-900">{invoice.id}</span>
                      </td>
                      <td className="p-4">
                        <span className="font-medium text-slate-900">Müşteri #{invoice.purchaseId.slice(0, 8)}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-slate-900">Profesyonel Paket</span>
                      </td>
                      <td className="p-4">
                        <span className="font-medium text-slate-900">₺{invoice.amount}</span>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-slate-900">{new Date(invoice.createdAt).toLocaleDateString('tr-TR')}</div>
                        <div className="text-xs text-slate-500">Vade: {new Date(invoice.dueDate).toLocaleDateString('tr-TR')}</div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          invoice.status === 'paid' 
                            ? 'bg-green-50 text-green-700'
                            : invoice.status === 'unpaid'
                            ? 'bg-yellow-50 text-yellow-700'
                            : 'bg-red-50 text-red-700'
                        }`}>
                          {invoice.status === 'paid' ? 'Ödendi' : invoice.status === 'unpaid' ? 'Bekliyor' : 'Gecikmiş'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
