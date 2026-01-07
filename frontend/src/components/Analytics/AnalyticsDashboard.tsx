import { Chart } from '../Common/Chart';

export type AnalyticsOverview = {
  totalClicks: number;
  uniqueVisitors: number;
  topCountries: { country: string; clicks: number }[];
  deviceBreakdown: { device: string; clicks: number }[];
  browserBreakdown: { browser: string; clicks: number }[];
};

export function AnalyticsDashboard({ data }: { data: AnalyticsOverview }) {
  const totalClicks = data?.totalClicks ?? 0;
  const uniqueVisitors = data?.uniqueVisitors ?? 0;
  const topCountries = data?.topCountries ?? [];
  const deviceBreakdown = data?.deviceBreakdown ?? [];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Chart title="Toplam Tıklamalar">
        <div className="text-2xl font-bold text-emerald-600">{totalClicks.toLocaleString('tr-TR')}</div>
        <div className="text-xs text-slate-500">Tüm zamanlar</div>
      </Chart>

      <Chart title="Benzersiz Ziyaretçiler">
        <div className="text-2xl font-bold text-blue-600">{uniqueVisitors.toLocaleString('tr-TR')}</div>
        <div className="text-xs text-slate-500">Farklı IP</div>
      </Chart>

      <Chart title="En Çok Tıklanan Ülkeler">
        <div className="space-y-2">
          {topCountries.slice(0, 5).map((c, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-slate-700">{c.country || 'Bilinmeyen'}</span>
              <span className="font-medium text-slate-900">{c.clicks}</span>
            </div>
          ))}
        </div>
      </Chart>

      <Chart title="Cihaz Dağılımı">
        <div className="space-y-2">
          {deviceBreakdown.slice(0, 5).map((d, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-slate-700">{d.device || 'Diğer'}</span>
              <span className="font-medium text-slate-900">{d.clicks}</span>
            </div>
          ))}
        </div>
      </Chart>
    </div>
  );
}
