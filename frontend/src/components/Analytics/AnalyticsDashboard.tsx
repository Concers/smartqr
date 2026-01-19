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
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Chart title="Toplam Tıklamalar">
        <div className="text-3xl font-bold text-yellow">{totalClicks.toLocaleString('tr-TR')}</div>
        <div className="text-sm text-dark/60">Tüm zamanlar</div>
      </Chart>

      <Chart title="Benzersiz Ziyaretçiler">
        <div className="text-3xl font-bold text-green">{uniqueVisitors.toLocaleString('tr-TR')}</div>
        <div className="text-sm text-dark/60">Farklı IP</div>
      </Chart>

      <Chart title="En Çok Tıklanan Ülkeler">
        <div className="space-y-3">
          {topCountries.slice(0, 5).map((c, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-dark/70">{c.country || 'Bilinmeyen'}</span>
              <span className="font-bold text-dark">{c.clicks}</span>
            </div>
          ))}
        </div>
      </Chart>

      <Chart title="Cihaz Dağılımı">
        <div className="space-y-3">
          {deviceBreakdown.slice(0, 5).map((d, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-dark/70">{d.device || 'Diğer'}</span>
              <span className="font-bold text-dark">{d.clicks}</span>
            </div>
          ))}
        </div>
      </Chart>
    </div>
  );
}
