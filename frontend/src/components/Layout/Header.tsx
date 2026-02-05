import { NavLink } from 'react-router-dom';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 rounded-md text-sm font-medium ${
    isActive ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'
  }`;

export function Header() {
  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
<<<<<<< HEAD
        <div className="text-lg font-semibold">SmartQR Admin</div>
=======
        <div className="text-lg font-semibold">netqr.io Admin</div>
>>>>>>> origin/feature/business-card-preview
        <nav className="hidden gap-2 md:flex">
          <NavLink to="/" className={linkClass} end>
            Ana Sayfa
          </NavLink>
          <NavLink to="/qr/generate" className={linkClass}>
            QR Oluştur
          </NavLink>
          <NavLink to="/analytics" className={linkClass}>
            Analitikler
          </NavLink>
          <NavLink to="/packages" className={linkClass}>
            Paketler
          </NavLink>
          <NavLink to="/test" className={linkClass}>
            Test
          </NavLink>
          <NavLink to="/settings" className={linkClass}>
            Ayarlar
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
