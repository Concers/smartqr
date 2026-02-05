import { Chart } from '../Common/Chart';

export type DailyClick = {
  date: string;
  clicks: number;
};

export type GeoData = {
  country: string;
  clicks: number;
};

export type DeviceData = {
  device: string;
  clicks: number;
};

export type BrowserData = {
  browser: string;
  clicks: number;
};

export function AnalyticsChart({
  daily,
  geo,
  devices,
  browsers,
}: {
  daily: DailyClick[];
  geo: GeoData[];
  devices: DeviceData[];
  browsers: BrowserData[];
}) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Chart title="Günlük Tıklamalar (Son 7 gün)">
        <div className="space-y-3">
          {Array.isArray(daily) && daily.map((d, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-dark/70">{new Date(d.date).toLocaleDateString('tr-TR')}</span>
              <span className="font-bold text-dark">{d.clicks}</span>
            </div>
          ))}
          {!Array.isArray(daily) && (
            <div className="text-sm text-dark/50">Günlük veri mevcut değil</div>
          )}
        </div>
      </Chart>

      <Chart title="Coğrafi Dağılımı">
        <div className="space-y-3">
          {Array.isArray(geo) && geo.slice(0, 10).map((g, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-dark/70">{g.country || 'Bilinmeyen'}</span>
              <span className="font-bold text-dark">{g.clicks}</span>
            </div>
          ))}
          {!Array.isArray(geo) && (
            <div className="text-sm text-dark/50">Coğrafi veri mevcut değil</div>
          )}
        </div>
      </Chart>

      <Chart title="Cihaz Türleri">
        <div className="space-y-3">
          {Array.isArray(devices) && devices.map((d, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-dark/70">{d.device || 'Diğer'}</span>
              <span className="font-bold text-dark">{d.clicks}</span>
            </div>
          ))}
          {!Array.isArray(devices) && (
            <div className="text-sm text-dark/50">Cihaz verisi mevcut değil</div>
          )}
        </div>
      </Chart>

      <Chart title="Tarayıcılar">
        <div className="space-y-3">
          {Array.isArray(browsers) && browsers.map((b, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-dark/70">{b.browser || 'Diğer'}</span>
              <span className="font-bold text-dark">{b.clicks}</span>
            </div>
          ))}
          {!Array.isArray(browsers) && (
            <div className="text-sm text-dark/50">Tarayıcı verisi mevcut değil</div>
          )}
        </div>
      </Chart>
    </div>
  );
}
