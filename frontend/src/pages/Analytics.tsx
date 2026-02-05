import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar, 
  Download, 
  Smartphone, 
  Monitor, 
  Globe, 
  Activity,
  MapPin,
  Clock,
  User,
  Zap
} from 'lucide-react';

import { authService } from '../services/authService';
import { useAuth } from '../hooks/useAuth';
import { AdminLayout } from '../components/Layout/AdminLayout';

export default function AnalyticsPage() {
  const { isAuthenticated } = useAuth();

  const { data: overview, refetch: refetchOverview } = useQuery({
    queryKey: ['analyticsOverview'],
    queryFn: () => authService.getOverallStats(),
    enabled: isAuthenticated,
    staleTime: 0,
  });

  const { data: daily, refetch: refetchDaily } = useQuery({
    queryKey: ['analyticsDaily'],
    queryFn: () => authService.getDailyStats(),
    enabled: isAuthenticated,
    staleTime: 0,
  });

  const { data: geo, refetch: refetchGeo } = useQuery({
    queryKey: ['analyticsGeo'],
    queryFn: () => authService.getGeoStats(),
    enabled: isAuthenticated,
    staleTime: 0,
  });

  const { data: devices, refetch: refetchDevices } = useQuery({
    queryKey: ['analyticsDevices'],
    queryFn: () => authService.getDeviceStats(),
    enabled: isAuthenticated,
    staleTime: 0,
  });

  const { data: browsers, refetch: refetchBrowsers } = useQuery({
    queryKey: ['analyticsBrowsers'],
    queryFn: () => authService.getBrowserStats(),
    enabled: isAuthenticated,
    staleTime: 0,
  });

  // Log data when it changes
  useEffect(() => {
    if (overview) console.log('📊 Overview data:', overview);
  }, [overview]);

  useEffect(() => {
    if (daily) console.log('📊 Daily data:', daily);
  }, [daily]);

  useEffect(() => {
    if (geo) console.log('📊 Geo data:', geo);
  }, [geo]);

  useEffect(() => {
    if (devices) console.log('📊 Devices data:', devices);
  }, [devices]);

  useEffect(() => {
    if (browsers) console.log('📊 Browsers data:', browsers);
  }, [browsers]);

  const handleRefreshAll = () => {
    refetchOverview();
    refetchDaily();
    refetchGeo();
    refetchDevices();
    refetchBrowsers();
  };

  if (!isAuthenticated) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow rounded-2xl flex items-center justify-center shadow-[4px_4px_0_0_#1F2937] transition-transform hover:translate-y-1 mx-auto mb-6">
              <svg className="w-9 h-9 text-dark" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 11h8V3H3v8zm2-6h4v4H5V5zm8-2v8h8V3h-8zm6 6h-4V5h4v4zM3 21h8v-8H3v8zm2-6h4v4H5v-4zm8 2h2v2h-2v-2zm2-2h2v2h-2v-2zm2 2h2v2h-2v-2zm2-2h2v2h-2v-2z" />
              </svg>
            </div>
            <div className="text-2xl font-bold text-dark mb-2">Analytics</div>
            <div className="text-lg text-dark/70">Giriş yapmanız gerekiyor</div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 lg:p-12">
      
      {/* Sayfa Başlığı ve Aksiyonlar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Genel Bakış</h1>
          <p className="text-slate-500">QR kodlarınızın performansını ve kitle etkileşimlerini takip edin.</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Tarih Seçici Mockup */}
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors">
            <Calendar className="w-4 h-4 text-slate-500" />
            <span>Son 30 Gün</span>
          </button>
          
          {/* Dışa Aktar Butonu */}
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-medium shadow-lg shadow-slate-200 hover:bg-slate-800 transition-transform active:scale-95">
            <Download className="w-4 h-4" />
            <span>Rapor İndir</span>
          </button>
          
          {/* Verileri Yenile Butonu */}
          <button 
            onClick={handleRefreshAll}
            className="flex items-center gap-2 px-4 py-2 bg-yellow text-dark rounded-xl text-sm font-medium shadow-lg shadow-slate-200 hover:bg-yellow/90 transition-transform active:scale-95"
          >
            <Activity className="w-4 h-4" />
            <span>Yenile</span>
          </button>
        </div>
      </div>

      {/* KPI Kartları (Özet Veriler) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { 
            title: 'Toplam Tıklama', 
            value: overview?.totalClicks?.toLocaleString('tr-TR') || '0', 
            change: '+12.5%', 
            trend: 'up' as const, 
            icon: Activity, 
            color: 'text-indigo-600', 
            bg: 'bg-indigo-50' 
          },
          { 
            title: 'Benzersiz Ziyaretçi', 
            value: overview?.uniqueVisitors?.toLocaleString('tr-TR') || '0', 
            change: '+8.2%', 
            trend: 'up' as const, 
            icon: User, 
            color: 'text-emerald-600', 
            bg: 'bg-emerald-50' 
          },
          { title: 'Ort. Etkileşim Süresi', value: '42sn', change: '-2.4%', trend: 'down' as const, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
          { title: 'Dönüşüm Oranı', value: '%24', change: '+4.1%', trend: 'up' as const, icon: Zap, color: 'text-rose-600', bg: 'bg-rose-50' },
        ].map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              {stat.trend === 'up' ? (
                <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                  <ArrowUpRight className="w-3 h-3" /> {stat.change}
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-full">
                  <ArrowDownRight className="w-3 h-3" /> {stat.change}
                </span>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{stat.title}</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Ana Grafik ve Detay Alanı */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Sol Taraf: Büyük Grafik (Zaman Çizelgesi) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800">Tıklama Performansı</h3>
            <div className="flex gap-2">
               <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="w-3 h-3 rounded-full bg-indigo-500"></span> Mobil
               </div>
               <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="w-3 h-3 rounded-full bg-slate-300"></span> Masaüstü
               </div>
            </div>
          </div>
          
          {/* CSS-Only Chart Mockup (Gerçek projede Recharts kullanılmalı) */}
          <div className="h-64 w-full flex items-end justify-between gap-2 border-b border-slate-100 pb-2">
            {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 50, 95].map((h, i) => (
              <div key={i} className="w-full bg-slate-100 rounded-t-lg relative group">
                 <div 
                   className="absolute bottom-0 w-full bg-indigo-500 rounded-t-lg transition-all duration-500 group-hover:bg-indigo-600" 
                   style={{ height: `${h}%` }}
                 ></div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-xs text-slate-400 font-medium">
            <span>Pzt</span><span>Sal</span><span>Çar</span><span>Per</span><span>Cum</span><span>Cmt</span><span>Paz</span>
          </div>
        </div>

        {/* Sağ Taraf: Cihaz ve Lokasyon Dağılımı */}
        <div className="space-y-6">
          
          {/* Cihaz Dağılımı */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Cihaz Dağılımı</h3>
            <div className="space-y-4">
              {devices?.slice(0, 3).map((device: any, index: number) => {
                const percentage = Math.round((device.clicks / (devices?.reduce((sum: number, d: any) => sum + d.clicks, 0) || 1)) * 100);
                return (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 rounded-lg">
                        {device.device?.toLowerCase().includes('mobile') || device.device?.toLowerCase().includes('mobil') ? (
                          <Smartphone className="w-5 h-5 text-slate-600" />
                        ) : (
                          <Monitor className="w-5 h-5 text-slate-600" />
                        )}
                      </div>
                      <span className="font-medium text-slate-700">{device.device || 'Diğer'}</span>
                    </div>
                    <div className="text-right">
                      <span className="block font-bold text-slate-900">%{percentage}</span>
                      <div className="w-24 h-2 bg-slate-100 rounded-full mt-1">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            device.device?.toLowerCase().includes('mobile') || device.device?.toLowerCase().includes('mobil') 
                              ? 'bg-indigo-500' 
                              : 'bg-yellow-400'
                          }`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* En Çok Tıklanan Ülkeler */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Lokasyonlar</h3>
            <div className="space-y-3">
              {geo?.slice(0, 3).map((location: any, index: number) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-slate-400" />
                    <span className="font-medium text-slate-600">{location.country || 'Bilinmeyen'}</span>
                  </div>
                  <span className="font-semibold text-slate-900">{location.clicks}</span>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-2 text-sm text-indigo-600 font-medium hover:bg-indigo-50 rounded-lg transition-colors">
              Tüm Raporu Gör
            </button>
          </div>

        </div>
      </div>
      </div>
    </AdminLayout>
  );
}
