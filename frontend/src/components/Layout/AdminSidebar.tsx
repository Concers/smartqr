import { useLocation, useNavigate } from 'react-router-dom';
import { 
  QrCode, 
  BarChart3, 
  Plus, 
  Settings, 
  LogOut,
  Home,
  Package,
  TestTube
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const menuItems = [
  {
    key: 'home',
    label: 'Ana Sayfa',
    icon: Home,
    path: '/admin'
  },
  {
    key: 'qr-generate',
    label: 'QR Oluştur',
    icon: Plus,
    path: '/qr/generate'
  },
  {
    key: 'qr-list',
    label: 'QR Listesi',
    icon: QrCode,
    path: '/qr/list'
  },
  {
    key: 'analytics',
    label: 'Analitikler',
    icon: BarChart3,
    path: '/analytics'
  },
  {
    key: 'packages',
    label: 'Paketler',
    icon: Package,
    path: '/pricing'
  },
  {
    key: 'settings',
    label: 'Ayarlar',
    icon: Settings,
    path: '/settings'
  }
];

interface AdminSidebarProps {
  className?: string;
}

export function AdminSidebar({ className = "" }: AdminSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path || 
           (path !== '/' && location.pathname.startsWith(path));
  };

  const handleLogout = () => {
    logout();
    navigate('/'); // Redirect to landing page instead of login
  };

  const getUserInitial = () => {
    if (user?.name) return user.name.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return 'A';
  };

  const getUserName = () => {
    return user?.name || user?.email || 'Kullanıcı';
  };

  const getUserEmail = () => {
    return user?.email || '';
  };

  return (
    <div className={`w-64 bg-slate-900 text-white min-h-screen flex flex-col ${className}`}>
      {/* Logo Section */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-yellow-400 p-2 rounded-lg">
            <QrCode className="w-6 h-6 text-slate-900" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">SmartQR</h1>
            <p className="text-xs text-slate-400 font-medium">Admin Panel</p>
          </div>
        </div>
        
        {/* User Section - Right under logo */}
        <div className="flex items-center gap-3 pt-3 border-t border-slate-800">
          <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium">{getUserInitial()}</span>
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-white">{getUserName()}</div>
            <div className="text-xs text-slate-400">{getUserEmail()}</div>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Çıkış Yap"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <button
                key={item.key}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all group ${
                  active
                    ? 'bg-yellow-400 text-slate-900 shadow-lg'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 transition-colors ${
                  active ? 'text-slate-900' : 'text-slate-400 group-hover:text-white'
                }`} />
                <span>{item.label}</span>
                {active && (
                  <div className="ml-auto w-2 h-2 bg-slate-900 rounded-full"></div>
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
