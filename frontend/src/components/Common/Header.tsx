import { useNavigate } from 'react-router-dom';
import { Button } from './Button';
import { useAuth } from '../../hooks/useAuth';

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export function Header({ title = "Smart QR Manager", subtitle = "Profesyonel QR Kod Yönetimi" }: HeaderProps) {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-dark/10 bg-cream/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow rounded-2xl flex items-center justify-center shadow-[4px_4px_0_0_#1F2937] transition-transform hover:translate-y-1">
            <svg className="w-6 h-6 text-dark" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 11h8V3H3v8zm2-6h4v4H5V5zm8-2v8h8V3h-8zm6 6h-4V5h4v4zM3 21h8v-8H3v8zm2-6h4v4H5v-4zm8 2h2v2h-2v-2zm2-2h2v2h-2v-2zm2 2h2v2h-2v-2zm2-2h2v2h-2v-2z" />
            </svg>
          </div>
          <div className="leading-tight">
            <div className="text-sm font-bold text-dark">{title}</div>
            <div className="text-xs text-dark/60">{subtitle}</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-6">
          {isAuthenticated ? (
            <>
              {/* Main Navigation */}
              <div className="hidden md:flex items-center gap-6">
                <button
                  onClick={() => navigate('/')}
                  className="text-sm font-medium text-dark hover:text-green transition-colors"
                >
                  Ana Sayfa
                </button>
                <button
                  onClick={() => navigate('/qr/generate')}
                  className="text-sm font-medium text-dark hover:text-green transition-colors"
                >
                  QR Oluştur
                </button>
                <button
                  onClick={() => navigate('/analytics')}
                  className="text-sm font-medium text-dark hover:text-green transition-colors"
                >
                  Analitikler
                </button>
                <button
                  onClick={() => navigate('/pricing')}
                  className="text-sm font-medium text-dark hover:text-green transition-colors"
                >
                  Paketler
                </button>
              </div>

              {/* User Menu */}
              <div className="flex items-center gap-3">
                <div className="hidden items-center gap-2 text-sm text-dark/70 md:flex">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  <span>{user?.name || user?.email}</span>
                </div>
                <Button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="h-9 px-3 bg-coral text-white hover:bg-coral/90 transition-colors shadow-[2px_2px_0_0_#1F2937] active:translate-y-0.5"
                >
                  Çıkış Yap
                </Button>
              </div>

              {/* Mobile Menu Button */}
              <div className="md:hidden">
                <button className="text-dark hover:text-green transition-colors">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Guest Navigation */}
              <div className="hidden md:flex items-center gap-6">
                <button
                  onClick={() => navigate('/')}
                  className="text-sm font-medium text-dark hover:text-green transition-colors"
                >
                  Ana Sayfa
                </button>
                <button
                  onClick={() => navigate('/pricing')}
                  className="text-sm font-medium text-dark hover:text-green transition-colors"
                >
                  Paketler
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="text-sm font-medium text-dark hover:text-green transition-colors"
                >
                  Giriş Yap
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="text-sm font-medium text-dark hover:text-green transition-colors"
                >
                  Üye Ol
                </button>
              </div>

              {/* Mobile Menu Button */}
              <div className="md:hidden">
                <button className="text-dark hover:text-green transition-colors">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
