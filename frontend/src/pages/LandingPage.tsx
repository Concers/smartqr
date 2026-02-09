import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  QrCode, 
  BarChart3, 
  Shield, 
  Check,
  Users,
  TrendingUp,
  Globe,
  FileText,
  Download,
  Menu,
  X
} from 'lucide-react';
import { Button } from '../components/Common/Button';
import { useAuth } from '../hooks/useAuth';
import HeroSlider from '../components/landing/HeroSlider';

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [showDemo, setShowDemo] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: QrCode,
      title: 'Dinamik QR Kodları',
      description: 'Gerçek zamanlı olarak hedef URL\'leri güncelleyen akıllı QR kodları oluşturun.',
      color: 'bg-blue-500'
    },
    {
      icon: BarChart3,
      title: 'Gelişmiş Analitikler',
      description: 'Tarama istatistikleri, cihaz ve coğrafi verilerini detaylı analiz edin.',
      color: 'bg-green-500'
    },
    {
      icon: Shield,
      title: 'Kurumsal Güvenlik',
      description: 'JWT tabanlı kimlik doğrulama ve SSL şifreleme ile verilerinizi koruyun.',
      color: 'bg-purple-500'
    },
    {
      icon: Users,
      title: 'Kullanıcı Yönetimi',
      description: 'Ekip üyeleri, rol bazlı erişim ve detaylı kullanıcı yönetimi.',
      color: 'bg-orange-500'
    },
    {
      icon: FileText,
      title: 'Özelleştirilebilir Tasarımlar',
      description: 'Marka renkleri, logo ekleme ve profesyonel QR kod tasarımları.',
      color: 'bg-pink-500'
    },
    {
      icon: Download,
      title: 'Toplu İhracat',
      description: 'QR kodları toplu olarak indirin veya farklı formatlarda dışa aktarın.',
      color: 'bg-indigo-500'
    }
  ];

  const stats = [
    { value: '10K+', label: 'QR Kodu', icon: QrCode },
    { value: '99.9%', label: 'Uptime', icon: TrendingUp },
    { value: '24/7', label: 'Destek', icon: Users },
    { value: '150+', label: 'Ülke', icon: Globe }
  ];

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/admin');
    } else {
      navigate('/login');
    }
  };

  const handleDemo = () => {
    setShowDemo(true);
    setTimeout(() => setShowDemo(false), 3000);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                <QrCode className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">netqr.io</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-slate-600 hover:text-slate-900 transition-colors">Özellikler</a>
              <a href="#pricing" className="text-slate-600 hover:text-slate-900 transition-colors">Fiyatlandırma</a>
              <a href="#contact" className="text-slate-600 hover:text-slate-900 transition-colors">İletişim</a>
            </nav>

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              {isAuthenticated ? (
                <Button onClick={handleGetStarted} className="bg-blue-600 text-white hover:bg-blue-700">
                  Admin Panel
                </Button>
              ) : (
                <>
                  <Button 
                    onClick={() => navigate('/login')} 
                    className="bg-slate-900 text-white hover:bg-slate-800"
                  >
                    Giriş Yap
                  </Button>
                  <Button 
                    onClick={() => navigate('/register')} 
                    variant="outline"
                  >
                    Kayıt Ol
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center space-x-3">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                aria-expanded={mobileMenuOpen}
                aria-label={mobileMenuOpen ? 'Menüyü kapat' : 'Menüyü aç'}
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white">
            <nav className="px-4 py-4 space-y-1">
              <a 
                href="#features" 
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 text-base font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
              >
                Özellikler
              </a>
              <a 
                href="#pricing" 
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 text-base font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
              >
                Fiyatlandırma
              </a>
              <a 
                href="#contact" 
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 text-base font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
              >
                İletişim
              </a>
              <div className="pt-4 mt-4 border-t border-slate-200 space-y-2">
                {isAuthenticated ? (
                  <Button 
                    onClick={() => {
                      handleGetStarted();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Admin Panel
                  </Button>
                ) : (
                  <>
                    <Button 
                      onClick={() => {
                        navigate('/login');
                        setMobileMenuOpen(false);
                      }}
                      className="w-full bg-slate-900 text-white hover:bg-slate-800"
                    >
                      Giriş Yap
                    </Button>
                    <Button 
                      onClick={() => {
                        navigate('/register');
                        setMobileMenuOpen(false);
                      }}
                      variant="outline"
                      className="w-full"
                    >
                      Kayıt Ol
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Slider Section */}
      <HeroSlider 
        isAuthenticated={isAuthenticated}
        onGetStarted={handleGetStarted}
        onDemo={handleDemo}
      />

      {/* Demo Modal */}
      {showDemo && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-slate-900">Demo Hesabı</h3>
              <button 
                onClick={() => setShowDemo(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                <span className="font-medium text-slate-700">E-posta:</span>
                <code className="bg-white px-3 py-1 rounded text-slate-900">demo@smartqr.com</code>
              </div>
              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                <span className="font-medium text-slate-700">Şifre:</span>
                <code className="bg-white px-3 py-1 rounded text-slate-900">demo123</code>
              </div>
            </div>
            <Button 
              onClick={() => {
                // Simulate demo login
                navigate('/login');
                setShowDemo(false);
              }}
              className="w-full bg-blue-600 text-white hover:bg-blue-700"
            >
              Demo ile Giriş Yap
            </Button>
          </div>
        </div>
      )}

      {/* Stats Section */}
      <section className="py-28 lg:py-36 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 lg:mb-20">
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-3">Rakamlarla</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">Platformumuzun Gücü</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <article 
                  key={index} 
                  className="group relative bg-white border border-slate-200 rounded-2xl p-6 lg:p-8 hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 border border-slate-200 rounded-xl flex items-center justify-center group-hover:border-slate-300 transition-colors">
                      <Icon className="w-6 h-6 text-slate-600" aria-hidden="true" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight tabular-nums">
                      {stat.value}
                    </p>
                    <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-28 lg:py-36 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-16 lg:mb-20">
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-3">Özellikler</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight mb-4">
              QR Kod Yönetimini Kolaylaştırın
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              İşletmenizin ihtiyaçlarına özel tasarlanmış güçlü araçlar
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <article 
                  key={index} 
                  className="group bg-white border border-slate-200 rounded-2xl p-6 lg:p-8 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className="w-11 h-11 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center mb-5">
                    <Icon className="w-5 h-5 text-slate-700" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{feature.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-28 lg:py-36 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-16 lg:mb-20">
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-3">Fiyatlandırma</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight mb-4">
              İşletmenize Uygun Plan
            </h2>
            <p className="text-lg text-slate-600">
              Tüm planlar 14 gün ücretsiz deneme içerir
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-0 items-center">
            {/* Başlangıç */}
            <article className="relative bg-white border border-slate-200 rounded-2xl lg:rounded-r-none p-6 lg:p-8 hover:shadow-sm transition-shadow">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-1">Başlangıç</h3>
                <p className="text-sm text-slate-500">Bireysel kullanım için</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold text-slate-900 tabular-nums">Ücretsiz</span>
              </div>
              <ul className="space-y-3 mb-8">
                {['5 QR Kodu', '1.000 Tarama/ay', 'Temel Analitik', 'Email Destek'].map((feature, i) => (
                  <li key={i} className="flex items-center text-sm text-slate-600">
                    <Check className="w-4 h-4 text-slate-400 mr-3 flex-shrink-0" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
              <button 
                onClick={handleGetStarted}
                className="w-full py-2.5 px-4 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors"
              >
                Ücretsiz Başla
              </button>
            </article>

            {/* Profesyonel - Featured */}
            <article className="relative bg-slate-900 rounded-2xl p-6 lg:p-8 lg:py-10 lg:-my-4 z-10 shadow-xl">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded-full">
                  En Popüler
                </span>
              </div>
              <div className="mb-6 pt-2">
                <h3 className="text-lg font-semibold text-white mb-1">Profesyonel</h3>
                <p className="text-sm text-slate-400">Büyüyen işletmeler için</p>
              </div>
              <div className="mb-6">
                <span className="text-5xl font-bold text-white tabular-nums">₺149</span>
                <span className="text-slate-400 text-sm ml-1">/ay</span>
              </div>
              <ul className="space-y-3 mb-8">
                {['100 QR Kodu', '10.000 Tarama/ay', 'Gelişmiş Analitik', 'Öncelikli Destek', 'Özelleştirme'].map((feature, i) => (
                  <li key={i} className="flex items-center text-sm text-slate-300">
                    <Check className="w-4 h-4 text-blue-400 mr-3 flex-shrink-0" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
              <button 
                onClick={handleGetStarted}
                className="w-full py-2.5 px-4 text-sm font-medium text-slate-900 bg-white rounded-lg hover:bg-slate-100 transition-colors"
              >
                Hemen Başla
              </button>
            </article>

            {/* Kurumsal */}
            <article className="relative bg-white border border-slate-200 rounded-2xl lg:rounded-l-none p-6 lg:p-8 hover:shadow-sm transition-shadow">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-1">Kurumsal</h3>
                <p className="text-sm text-slate-500">Büyük ölçekli operasyonlar</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold text-slate-900">Özel</span>
                <span className="text-slate-500 text-sm ml-1">teklif</span>
              </div>
              <ul className="space-y-3 mb-8">
                {['Sınırsız QR Kodu', 'Sınırsız Tarama', 'API Erişimi', 'Özel Panel', '7/24 Destek', 'White Label'].map((feature, i) => (
                  <li key={i} className="flex items-center text-sm text-slate-600">
                    <Check className="w-4 h-4 text-slate-400 mr-3 flex-shrink-0" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
              <button 
                onClick={handleGetStarted}
                className="w-full py-2.5 px-4 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors"
              >
                İletişime Geç
              </button>
            </article>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-28 lg:py-36 bg-slate-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white tracking-tight mb-4">
            QR Kod Yönetimine Bugün Başlayın
          </h2>
          <p className="text-lg text-slate-400 mb-10 max-w-xl mx-auto">
            14 gün ücretsiz deneyin. Kredi kartı gerekmez.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button 
              onClick={handleGetStarted}
              className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-slate-900 bg-white rounded-lg hover:bg-slate-100 hover:-translate-y-0.5 transition-all"
            >
              {isAuthenticated ? 'Admin Panel' : 'Ücretsiz Başla'}
            </button>
            <button 
              onClick={handleDemo}
              className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white border border-slate-700 rounded-lg hover:bg-slate-800 hover:border-slate-600 transition-colors"
            >
              Demo Talep Et
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Footer */}
          <div className="py-16 lg:py-20">
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-12">
              {/* Brand */}
              <div className="col-span-2">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                    <QrCode className="w-5 h-5 text-slate-900" aria-hidden="true" />
                  </div>
                  <span className="text-lg font-semibold text-white">netqr.io</span>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed mb-6 max-w-xs">
                  Kurumsal QR kod yönetimi ve analitik platformu.
                </p>
                <div className="flex items-center space-x-4">
                  <a href="#" className="text-slate-500 hover:text-slate-300 transition-colors" aria-label="Twitter">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </a>
                  <a href="#" className="text-slate-500 hover:text-slate-300 transition-colors" aria-label="LinkedIn">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                  <a href="#" className="text-slate-500 hover:text-slate-300 transition-colors" aria-label="GitHub">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"/>
                    </svg>
                  </a>
                </div>
              </div>

              {/* Product */}
              <div>
                <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-4">Ürün</h3>
                <ul className="space-y-3">
                  <li><a href="#features" className="text-sm text-slate-400 hover:text-white transition-colors">Özellikler</a></li>
                  <li><a href="#pricing" className="text-sm text-slate-400 hover:text-white transition-colors">Fiyatlandırma</a></li>
                  <li><a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">API</a></li>
                  <li><a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Entegrasyonlar</a></li>
                </ul>
              </div>

              {/* Company */}
              <div>
                <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-4">Şirket</h3>
                <ul className="space-y-3">
                  <li><a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Hakkımızda</a></li>
                  <li><a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Blog</a></li>
                  <li><a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Kariyer</a></li>
                  <li><a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Basın</a></li>
                </ul>
              </div>

              {/* Resources */}
              <div>
                <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-4">Kaynaklar</h3>
                <ul className="space-y-3">
                  <li><a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Dokümantasyon</a></li>
                  <li><a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Yardım Merkezi</a></li>
                  <li><a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">SSS</a></li>
                  <li><a href="#contact" className="text-sm text-slate-400 hover:text-white transition-colors">İletişim</a></li>
                </ul>
              </div>

              {/* Legal */}
              <div>
                <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-4">Yasal</h3>
                <ul className="space-y-3">
                  <li><a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Gizlilik</a></li>
                  <li><a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Kullanım Şartları</a></li>
                  <li><a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">KVKK</a></li>
                  <li><a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Çerez Politikası</a></li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-slate-800/50 py-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-slate-500">
                © {new Date().getFullYear()} netqr.io. Tüm hakları saklıdır.
              </p>
              <div className="flex items-center space-x-6">
                <a href="#" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Durum</a>
                <a href="#" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Güvenlik</a>
                <a href="#" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Site Haritası</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
