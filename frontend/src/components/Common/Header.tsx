import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from './Button';
import { useAuth } from '../../hooks/useAuth';
import { 
  LayoutDashboard, 
  QrCode, 
  List, 
  BarChart3, 
  Package, 
  LogOut, 
  User, 
  Menu,
  X 
} from 'lucide-react';

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export function Header({ title = "Smart QR", subtitle = "Manager" }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Navigasyon öğeleri
  const navItems = [
    { name: 'Ana Sayfa', icon: LayoutDashboard, href: '/' },
    { name: 'QR Oluştur', icon: QrCode, href: '/qr/generate' },
    { name: 'QR Listesi', icon: List, href: '/qr/list' },
    { name: 'Analitikler', icon: BarChart3, href: '/analytics' },
    { name: 'Paketler', icon: Package, href: '/pricing' },
  ];

  // Aktif sayfayı belirle
  const getActiveItem = () => {
    return navItems.find(item => item.href === location.pathname);
  };

  const activeItem = getActiveItem();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* Logo Bölümü */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-400 text-slate-900 shadow-sm shadow-yellow-200">
              <QrCode className="h-6 w-6" />
            </div>
            <div className="hidden md:block">
              <h1 className="text-lg font-bold leading-tight text-slate-900">{title}</h1>
              <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">{subtitle}</p>
            </div>
          </div>

          {/* Masaüstü Navigasyon */}
          {isAuthenticated && (
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => navigate(item.href)}
                  className={`group flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 
                    ${activeItem?.href === item.href
                      ? 'bg-slate-100 text-slate-900' 
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                >
                  <span className="relative">
                    {item.name}
                    {/* Hover'da alt çizgi animasyonu */}
                    <span className={`absolute -bottom-1 left-0 h-0.5 w-0 bg-yellow-400 transition-all group-hover:w-full ${activeItem?.href === item.href ? 'w-full' : ''}`}></span>
                  </span>
                </button>
              ))}
            </nav>
          )}

          {/* Guest Navigation */}
          {!isAuthenticated && (
            <nav className="hidden md:flex items-center gap-1">
              <button
                onClick={() => navigate('/')}
                className="text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50 px-3 py-2 rounded-lg transition-all duration-200"
              >
                Ana Sayfa
              </button>
              <button
                onClick={() => navigate('/pricing')}
                className="text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50 px-3 py-2 rounded-lg transition-all duration-200"
              >
                Paketler
              </button>
              <button
                onClick={() => navigate('/login')}
                className="text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50 px-3 py-2 rounded-lg transition-all duration-200"
              >
                Giriş Yap
              </button>
              <button
                onClick={() => navigate('/register')}
                className="text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50 px-3 py-2 rounded-lg transition-all duration-200"
              >
                Üye Ol
              </button>
            </nav>
          )}

          {/* Sağ Taraf: Kullanıcı Profili ve Çıkış */}
          <div className="flex items-center gap-4">
            
            {/* Kullanıcı Bilgisi (Authenticated) */}
            {isAuthenticated && (
              <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-slate-200">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-100">
                  <div className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">
                    <User className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-sm font-medium text-slate-700">{user?.name || user?.email || 'Test Hesabı'}</span>
                </div>
                
                {/* Modern Çıkış Butonu (Ghost Style) */}
                <button 
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors" 
                  title="Çıkış Yap"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            )}

            {/* Mobil Menü Butonu */}
            <button 
              className="md:hidden p-2 text-slate-600"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobil Menü (Drawer) */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white">
          <div className="space-y-1 px-4 pb-4 pt-2">
            {isAuthenticated ? (
              <>
                {navItems.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => {
                      navigate(item.href);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-3 block px-3 py-3 rounded-md text-base font-medium w-full text-left
                      ${activeItem?.href === item.href
                        ? 'bg-yellow-50 text-yellow-700' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </button>
                ))}
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between px-3">
                  <div className="flex items-center gap-2">
                     <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center">
                        <User className="h-4 w-4 text-slate-600" />
                     </div>
                     <span className="font-medium text-slate-700">{user?.name || user?.email || 'Test Hesabı'}</span>
                  </div>
                  <button 
                    onClick={() => {
                      logout();
                      navigate('/');
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-sm font-medium text-red-600 flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" /> Çıkış
                  </button>
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    navigate('/');
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 block px-3 py-3 rounded-md text-base font-medium w-full text-left text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                >
                  Ana Sayfa
                </button>
                <button
                  onClick={() => {
                    navigate('/pricing');
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 block px-3 py-3 rounded-md text-base font-medium w-full text-left text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                >
                  Paketler
                </button>
                <button
                  onClick={() => {
                    navigate('/login');
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 block px-3 py-3 rounded-md text-base font-medium w-full text-left text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                >
                  Giriş Yap
                </button>
                <button
                  onClick={() => {
                    navigate('/register');
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 block px-3 py-3 rounded-md text-base font-medium w-full text-left text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                >
                  Üye Ol
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
