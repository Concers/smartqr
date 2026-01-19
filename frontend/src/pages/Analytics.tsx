import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

import { Header } from '../components/Common/Header';
import { Button } from '../components/Common/Button';
import { AnalyticsDashboard, AnalyticsOverview } from '../components/Analytics/AnalyticsDashboard';
import { AnalyticsChart } from '../components/Analytics/AnalyticsChart';
import { authService } from '../services/authService';
import { useAuth } from '../hooks/useAuth';

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
      <div className="min-h-screen bg-cream flex items-center justify-center">
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
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <Header title="Smart QR Manager" subtitle="Veri Analizleri" />
      
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="text-4xl font-bold text-dark mb-4">Analytics</div>
            <div className="text-2xl text-dark mb-8">
              QR kodlarınızın <span className="text-green">performansını</span> takip edin
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-center mb-8">
            <Button
              onClick={handleRefreshAll}
              className="bg-green text-white hover:bg-green/90 transition-colors shadow-[2px_2px_0_0_#1F2937] active:translate-y-0.5"
            >
              Verileri Yenile
            </Button>
          </div>

          {/* Analytics Content */}
          <div className="space-y-8">
            <AnalyticsDashboard data={overview as AnalyticsOverview} />

            <AnalyticsChart
              daily={daily as any[]}
              geo={geo as any[]}
              devices={devices as any[]}
              browsers={browsers as any[]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
