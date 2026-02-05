import { NavLink } from 'react-router-dom';

const itemClass = ({ isActive }: { isActive: boolean }) =>
  `block rounded-md px-3 py-2 text-sm font-medium ${
    isActive ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'
  }`;

export function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 md:block">
      <div className="rounded-lg border border-slate-200 bg-white p-3">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Menü
        </div>
        <nav className="space-y-1">
          <NavLink to="/" className={itemClass} end>
            Dashboard
          </NavLink>
          <NavLink to="/qr/generate" className={itemClass}>
            QR Oluştur
          </NavLink>
          <NavLink to="/qr/list" className={itemClass}>
            QR Listesi
          </NavLink>
          <NavLink to="/analytics" className={itemClass}>
            Analytics
          </NavLink>
          <NavLink to="/settings" className={itemClass}>
            Ayarlar
          </NavLink>
        </nav>
      </div>
    </aside>
  );
}
