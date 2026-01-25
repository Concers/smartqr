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
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import { Button } from '../components/Common/Button';
import { useAuth } from '../hooks/useAuth';

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [showDemo, setShowDemo] = useState(false);

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

  const pricingPlans = [
    {
      name: 'Başlangıç',
      price: 'Ücretsiz',
      period: '',
      features: ['5 QR Kodu', '1.000 Tarama/ay', 'Temel Analitik', 'Email Destek'],
      popular: false,
      buttonText: 'Başla',
      color: 'bg-gray-100 text-gray-900 hover:bg-gray-200'
    },
    {
      name: 'Profesyonel',
      price: '₺149',
      period: '/ay',
      features: ['100 QR Kodu', '10.000 Tarama/ay', 'Gelişmiş Analitik', 'Öncelikli Destek', 'Özelleştirme'],
      popular: true,
      buttonText: 'En Popüler',
      color: 'bg-blue-600 text-white hover:bg-blue-700'
    },
    {
      name: 'Kurumsal',
      price: 'Özel',
      period: 'teklif',
      features: ['Sınırsız QR Kodu', 'Sınırsız Tarama', 'API Erişimi', 'Özel Panel', '7/24 Destek', 'White Label'],
      popular: false,
      buttonText: 'İletişime Geç',
      color: 'bg-purple-600 text-white hover:bg-purple-700'
    }
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                <QrCode className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">SmartQR</span>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-slate-600 hover:text-slate-900 transition-colors">Özellikler</a>
              <a href="#pricing" className="text-slate-600 hover:text-slate-900 transition-colors">Fiyatlandırma</a>
              <a href="#contact" className="text-slate-600 hover:text-slate-900 transition-colors">İletişim</a>
            </nav>
            <div className="flex items-center space-x-4">
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
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <QrCode className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Akıllı QR Kodlarıyla
              <br />
              <span className="text-yellow-300">Dijital Dönüşümü Hızlandırın</span>
            </h1>
            <p className="text-xl text-blue-100 mb-10 max-w-3xl mx-auto leading-relaxed">
              Profesyonel QR kod yönetimi platformumuzla dinamik içerik, gerçek zamanlı analitikler ve kurumsal güvenlik 
              ile pazarlama kampanyalarınızı bir üst seviyeye taşıyın.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={handleGetStarted} size="lg" className="bg-yellow-400 text-slate-900 hover:bg-yellow-300 font-semibold px-8 py-4 rounded-xl shadow-lg">
                {isAuthenticated ? 'Admin Panel' : 'Ücretsiz Başla'}
              </Button>
              <Button 
                onClick={handleDemo} 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-slate-900 font-semibold px-8 py-4 rounded-xl"
              >
                Demo İzle
              </Button>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
      </section>

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
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Platformumuzun Gücü</h2>
            <p className="text-xl text-slate-600">Binlerce işletmenin güvenini kazandık</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 mx-auto">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-slate-900 mb-2">{stat.value}</div>
                  <div className="text-slate-600">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Özellikler</h2>
            <p className="text-xl text-slate-600">QR kod yönetiminizi kolaylaştıran güçlü özellikler</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 hover:shadow-xl transition-shadow">
                  <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-6`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Fiyatlandırma</h2>
            <p className="text-xl text-slate-600">İhtiyaçlarınıza uygun esnek paket seçenekleri</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <div key={index} className={`relative rounded-2xl overflow-hidden ${plan.popular ? 'ring-2 ring-blue-500' : 'border border-slate-200'}`}>
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-blue-500 text-white px-3 py-1 text-sm font-bold rounded-bl-lg">
                    {plan.buttonText}
                  </div>
                )}
                <div className="p-8">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-slate-900">{plan.name}</h3>
                    <div className="text-4xl font-bold text-slate-900 mb-2">
                      {plan.price}
                      <span className="text-lg font-normal text-slate-600">{plan.period}</span>
                    </div>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5 mr-3" />
                        <span className="text-slate-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    onClick={handleGetStarted}
                    className={`w-full ${plan.color} font-semibold px-6 py-3 rounded-lg transition-colors`}
                  >
                    {plan.buttonText}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">Hemen Başlayın</h2>
          <p className="text-xl mb-8 text-blue-100">
            Akıllı QR kodları oluşturun ve dijital pazarlama kampanyalarınızı güçlendirin.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={handleGetStarted}
              size="lg"
              className="bg-yellow-400 text-slate-900 hover:bg-yellow-300 font-semibold px-8 py-4 rounded-xl shadow-lg"
            >
              {isAuthenticated ? 'Admin Panel' : 'Ücretsiz Başla'}
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-slate-900 font-semibold px-8 py-4 rounded-xl"
            >
              Demo İzle
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <QrCode className="w-8 h-8 text-yellow-400" />
                <span className="text-xl font-bold">SmartQR</span>
              </div>
              <p className="text-slate-400">Profesyonel QR kod yönetimi platformu</p>
              <div className="flex space-x-4 mt-4">
                <Mail className="w-5 h-5 text-slate-400" />
                <Phone className="w-5 h-5 text-slate-400" />
                <MapPin className="w-5 h-5 text-slate-400" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Ürün</h3>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Özellikler</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Fiyatlandırma</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Dokümantasyon</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Şirket</h3>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Hakkımızda</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Kariyer</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Destek</h3>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Yardım Merkezi</a></li>
                <li><a href="#" className="hover:text-white transition-colors">İletişim</a></li>
                <li><a href="#" className="hover:text-white transition-colors">SSS</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
            <p>&copy; 2024 SmartQR. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
