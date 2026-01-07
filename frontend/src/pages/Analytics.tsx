import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-lg font-semibold text-slate-900">Analytics</div>
          <div className="text-sm text-slate-600">Giriş yapmanız gerekiyor</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold text-slate-900">Analytics</div>
        <button
          onClick={handleRefreshAll}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          Verileri Yenile
        </button>
      </div>

      <AnalyticsDashboard data={overview as AnalyticsOverview} />

      <AnalyticsChart
        daily={daily as any[]}
        geo={geo as any[]}
        devices={devices as any[]}
        browsers={browsers as any[]}
      />
    </div>
  );
}
