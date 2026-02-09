import { useQuery } from '@tanstack/react-query';
import { useMemo, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Activity,
  Users,
  Smartphone,
  Monitor,
  Tablet,
  Globe,
  Clock,
  MousePointerClick,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';

import { authService } from '../services/authService';
import { useAuth } from '../hooks/useAuth';
import { AdminLayout } from '../components/Layout/AdminLayout';

export default function AnalyticsPage() {
  const { isAuthenticated } = useAuth();
  const { qrId } = useParams<{ qrId?: string }>();
  const navigate = useNavigate();

  const { data: overview, refetch: r1 } = useQuery({
    queryKey: ['analyticsOverview', qrId],
    queryFn: () => authService.getOverallStats(qrId),
    enabled: isAuthenticated,
  });

  const { data: daily, refetch: r2 } = useQuery({
    queryKey: ['analyticsDaily', qrId],
    queryFn: () => authService.getDailyStats(qrId),
    enabled: isAuthenticated,
  });

  const { data: devices, refetch: r3 } = useQuery({
    queryKey: ['analyticsDevices', qrId],
    queryFn: () => authService.getDeviceStats(qrId),
    enabled: isAuthenticated,
  });

  const { data: browsers, refetch: r4 } = useQuery({
    queryKey: ['analyticsBrowsers', qrId],
    queryFn: () => authService.getBrowserStats(qrId),
    enabled: isAuthenticated,
  });

  const { data: hourly, refetch: r5 } = useQuery({
    queryKey: ['analyticsHourly', qrId],
    queryFn: () => authService.getHourlyStats(qrId),
    enabled: isAuthenticated,
  });

  const { data: recentClicks, refetch: r6 } = useQuery({
    queryKey: ['analyticsClicks', qrId],
    queryFn: () => authService.getRecentClicks(qrId),
    enabled: isAuthenticated,
  });

  const handleRefresh = () => { r1(); r2(); r3(); r4(); r5(); r6(); };
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });
  const chartRef = useRef<HTMLDivElement>(null);

  const handleChartMouseMove = useCallback((e: React.MouseEvent) => {
    if (!chartRef.current || !daily?.length) return;
    const rect = chartRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = x / rect.width;
    const idx = Math.round(pct * (daily.length - 1));
    const clamped = Math.max(0, Math.min(daily.length - 1, idx));
    setHoverIdx(clamped);
    setHoverPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, [daily]);

  // Compute chart helpers
  const dailyMax = useMemo(() => Math.max(...(daily || []).map((d: any) => d.clicks), 1), [daily]);
  const hourlyMax = useMemo(() => Math.max(...(hourly || []).map((h: any) => h.clicks), 1), [hourly]);
  const totalDeviceClicks = useMemo(() => (devices || []).reduce((s: number, d: any) => s + d.clicks, 0) || 1, [devices]);
  const totalBrowserClicks = useMemo(() => (browsers || []).reduce((s: number, b: any) => s + b.clicks, 0) || 1, [browsers]);

  // Last 7 days vs previous 7 days trend
  const trend = useMemo(() => {
    if (!daily || daily.length < 14) return null;
    const last7 = daily.slice(-7).reduce((s: number, d: any) => s + d.clicks, 0);
    const prev7 = daily.slice(-14, -7).reduce((s: number, d: any) => s + d.clicks, 0);
    if (prev7 === 0) return last7 > 0 ? 100 : 0;
    return Math.round(((last7 - prev7) / prev7) * 100);
  }, [daily]);

  const deviceColors: Record<string, string> = { mobile: 'bg-indigo-500', desktop: 'bg-amber-400', tablet: 'bg-emerald-400' };
  const deviceIcons: Record<string, any> = { mobile: Smartphone, desktop: Monitor, tablet: Tablet };
  const browserColors = ['bg-blue-500', 'bg-orange-400', 'bg-green-500', 'bg-purple-500', 'bg-pink-400'];

  if (!isAuthenticated) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <p className="text-lg text-slate-500">Giriş yapmanız gerekiyor</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 lg:p-10 space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {qrId && (
              <button onClick={() => navigate('/analytics')} className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition-colors shadow-sm">
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{qrId ? 'QR Kod Analizi' : 'Analitik Paneli'}</h1>
              <p className="text-sm text-slate-500 mt-0.5">{qrId ? 'Seçili QR kodunuzun detaylı istatistikleri' : 'Son 30 günlük performans verileri'}</p>
            </div>
          </div>
          <button onClick={handleRefresh} className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold shadow-lg hover:bg-slate-800 transition-transform active:scale-95">
            <RefreshCw className="w-4 h-4" />
            Yenile
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Toplam Tıklama', value: overview?.totalClicks ?? 0, icon: MousePointerClick, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { label: 'Benzersiz Ziyaretçi', value: overview?.uniqueVisitors ?? 0, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Haftalık Trend', value: trend !== null ? `${trend >= 0 ? '+' : ''}${trend}%` : '—', icon: TrendingUp, color: trend !== null && trend >= 0 ? 'text-emerald-600' : 'text-rose-600', bg: trend !== null && trend >= 0 ? 'bg-emerald-50' : 'bg-rose-50' },
            { label: 'Bugün', value: daily?.length ? daily[daily.length - 1]?.clicks ?? 0 : 0, icon: Activity, color: 'text-amber-600', bg: 'bg-amber-50' },
          ].map((kpi, i) => (
            <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2.5 rounded-xl ${kpi.bg}`}>
                  <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                </div>
              </div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{kpi.label}</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{typeof kpi.value === 'number' ? kpi.value.toLocaleString('tr-TR') : kpi.value}</p>
            </div>
          ))}
        </div>

        {/* Daily Chart — SVG Area Chart with HTML Tooltip */}
        {(() => {
          const data = daily || [];
          const W = 800, H = 240, PX = 0, PY = 10;
          const chartW = W, chartH = H - PY * 2;
          const max = dailyMax;
          const total30 = data.reduce((s: number, d: any) => s + d.clicks, 0);
          const avg = data.length ? Math.round(total30 / data.length) : 0;
          const best = data.reduce((b: any, d: any) => d.clicks > (b?.clicks ?? 0) ? d : b, data[0]);

          const pts = data.map((d: any, i: number) => ({
            x: PX + (i / Math.max(data.length - 1, 1)) * chartW,
            y: PY + chartH - (d.clicks / max) * chartH,
            ...d,
          }));

          const linePath = pts.map((p: any, i: number) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
          const areaPath = pts.length > 1 ? linePath + ` L${pts[pts.length - 1]?.x ?? 0},${PY + chartH} L${0},${PY + chartH} Z` : '';

          const hd = hoverIdx !== null && data[hoverIdx] ? data[hoverIdx] : null;
          const hpx = hoverIdx !== null && pts[hoverIdx] ? (hoverIdx / Math.max(data.length - 1, 1)) * 100 : 0;

          return (
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
                <div>
                  <h3 className="text-base font-bold text-slate-800">Tarama Trendi</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Son 30 günlük QR kod tarama aktivitesi</p>
                </div>
                <div className="flex items-center gap-5">
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">Toplam</p>
                    <p className="text-lg font-bold text-slate-900">{total30.toLocaleString('tr-TR')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">Günlük Ort.</p>
                    <p className="text-lg font-bold text-indigo-600">{avg}</p>
                  </div>
                  {best && (
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider">En Yoğun Gün</p>
                      <p className="text-lg font-bold text-emerald-600">{best.clicks} <span className="text-xs font-normal text-slate-400">{new Date(best.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}</span></p>
                    </div>
                  )}
                </div>
              </div>

              <div
                ref={chartRef}
                className="relative cursor-crosshair"
                onMouseMove={handleChartMouseMove}
                onMouseLeave={() => setHoverIdx(null)}
              >
                <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 220 }} preserveAspectRatio="xMidYMid meet">
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity="0.02" />
                    </linearGradient>
                  </defs>

                  {[0, 0.5, 1].map((f, i) => (
                    <line key={i} x1={0} y1={PY + chartH - f * chartH} x2={W} y2={PY + chartH - f * chartH} stroke="#f1f5f9" strokeWidth="1" />
                  ))}

                  {pts.length > 1 && (
                    <>
                      <path d={areaPath} fill="url(#areaGrad)" />
                      <path d={linePath} fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </>
                  )}

                  {hoverIdx !== null && pts[hoverIdx] && (
                    <>
                      <line x1={pts[hoverIdx].x} y1={PY} x2={pts[hoverIdx].x} y2={PY + chartH} stroke="#6366f1" strokeWidth="1" strokeDasharray="4 3" opacity="0.5" />
                      <circle cx={pts[hoverIdx].x} cy={pts[hoverIdx].y} r="5" fill="#6366f1" stroke="white" strokeWidth="2.5" />
                    </>
                  )}
                </svg>

                {/* HTML Tooltip */}
                {hd && hoverIdx !== null && (
                  <div
                    className="absolute pointer-events-none z-20 transition-all duration-100"
                    style={{
                      left: `${hpx}%`,
                      top: 0,
                      transform: hpx > 80 ? 'translateX(-100%)' : hpx < 20 ? 'translateX(0)' : 'translateX(-50%)',
                    }}
                  >
                    <div className="bg-slate-800 text-white rounded-lg px-3 py-2 shadow-lg">
                      <p className="text-xs font-semibold">{new Date(hd.date).toLocaleDateString('tr-TR', { weekday: 'short', day: 'numeric', month: 'long' })}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm font-bold">{hd.clicks} tarama</span>
                        <span className="text-[10px] text-slate-300">📱 {hd.mobile} · 🖥 {hd.desktop}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* X-axis labels */}
                <div className="flex justify-between mt-1 px-0">
                  {data.length > 0 && [0, Math.floor(data.length / 4), Math.floor(data.length / 2), Math.floor(data.length * 3 / 4), data.length - 1].map((idx, i) => (
                    <span key={i} className="text-[10px] text-slate-400">
                      {data[idx] ? new Date(data[idx].date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }) : ''}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}

        {/* Middle row: Devices + Browsers + Hourly */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Device breakdown */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 mb-5">Cihaz Dağılımı</h3>
            {(devices || []).length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">Henüz veri yok</p>
            ) : (
              <div className="space-y-4">
                {(devices || []).map((d: any, i: number) => {
                  const pct = Math.round((d.clicks / totalDeviceClicks) * 100);
                  const Icon = deviceIcons[d.device] || Monitor;
                  const barColor = deviceColors[d.device] || 'bg-slate-400';
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-slate-500" />
                          <span className="text-sm font-medium text-slate-700 capitalize">{d.device}</span>
                        </div>
                        <span className="text-sm font-bold text-slate-900">{d.clicks} <span className="text-slate-400 font-normal">(%{pct})</span></span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full">
                        <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Browser breakdown */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 mb-5">Tarayıcı Dağılımı</h3>
            {(browsers || []).length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">Henüz veri yok</p>
            ) : (
              <div className="space-y-4">
                {(browsers || []).slice(0, 5).map((b: any, i: number) => {
                  const pct = Math.round((b.clicks / totalBrowserClicks) * 100);
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-slate-500" />
                          <span className="text-sm font-medium text-slate-700 capitalize">{b.browser}</span>
                        </div>
                        <span className="text-sm font-bold text-slate-900">{b.clicks} <span className="text-slate-400 font-normal">(%{pct})</span></span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full">
                        <div className={`h-full rounded-full transition-all duration-500 ${browserColors[i] || 'bg-slate-400'}`} style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Hourly heatmap */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 mb-2">Saatlik Dağılım <span className="text-slate-400 font-normal text-sm">— Son 7 Gün</span></h3>
            <p className="text-xs text-slate-400 mb-4">En yoğun saatler koyu renkte gösterilir</p>
            {(hourly || []).length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">Henüz veri yok</p>
            ) : (
              <div className="grid grid-cols-6 gap-1.5">
                {(hourly || []).map((h: any) => {
                  const intensity = hourlyMax > 0 ? h.clicks / hourlyMax : 0;
                  const bg = intensity === 0 ? 'bg-slate-100' : intensity < 0.25 ? 'bg-indigo-100' : intensity < 0.5 ? 'bg-indigo-200' : intensity < 0.75 ? 'bg-indigo-400' : 'bg-indigo-600';
                  const textColor = intensity >= 0.5 ? 'text-white' : 'text-slate-600';
                  return (
                    <div key={h.hour} className={`${bg} rounded-lg p-2 text-center transition-colors group relative`}>
                      <div className="text-[10px] font-medium text-slate-400">{String(h.hour).padStart(2, '0')}:00</div>
                      <div className={`text-xs font-bold ${textColor}`}>{h.clicks}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Recent clicks table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-800">Son Tıklamalar</h3>
          </div>
          {(recentClicks || []).length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-slate-400">Henüz tıklama verisi yok</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tarih</th>
                    {!qrId && <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">QR Kod</th>}
                    <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Cihaz</th>
                    <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tarayıcı</th>
                    <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(recentClicks || []).map((click: any, i: number) => {
                    const DevIcon = click.deviceType === 'mobile' ? Smartphone : click.deviceType === 'tablet' ? Tablet : Monitor;
                    return (
                      <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-6 text-sm text-slate-700">
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {new Date(click.accessedAt).toLocaleString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                        {!qrId && <td className="py-3 px-6 text-sm font-medium text-slate-900">{click.shortCode}</td>}
                        <td className="py-3 px-6">
                          <span className="inline-flex items-center gap-1.5 text-sm text-slate-600 capitalize">
                            <DevIcon className="w-3.5 h-3.5" />
                            {click.deviceType}
                          </span>
                        </td>
                        <td className="py-3 px-6 text-sm text-slate-600 capitalize">{click.browser}</td>
                        <td className="py-3 px-6 text-sm text-slate-400 font-mono text-xs">{click.ipAddress?.replace('::ffff:', '')}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </AdminLayout>
  );
}
