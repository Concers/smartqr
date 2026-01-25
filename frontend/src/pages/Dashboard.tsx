import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/Common/Button';
import { Header } from '../components/Common/Header';
import { PricingCard } from '../components/Common/PricingCard';
import { Card, CardContent } from '../components/ui/card';
import { useEffect } from 'react';

// Import AdminDashboard for logged-in users
import AdminDashboard from './AdminDashboard';

export default function Dashboard() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      // Don't redirect here, show landing page instead
    }
  }, [isAuthenticated, navigate]);

  // If authenticated, show AdminDashboard
  if (isAuthenticated) {
    return <AdminDashboard />;
  }

  // If not authenticated, show landing page

  return (
    <div className="min-h-screen bg-cream">
      <Header />
      
      <div className="pt-16">
        {/* Hero Section */}
        <div className="relative overflow-hidden pt-16">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="grid grid-cols-12 grid-rows-12 h-full">
              {Array.from({ length: 144 }).map((_, i) => (
                <div key={i} className="border border-dark/10" />
              ))}
            </div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center">
              {/* Logo ve Başlık */}
              <div className="flex items-center justify-center space-x-6 mb-12">
                <div className="w-24 h-24 bg-yellow rounded-3xl flex items-center justify-center shadow-[8px_8px_0_0_#1F2937] transition-transform hover:translate-y-1">
                  <svg className="w-14 h-14 text-dark" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 11h8V3H3v8zm2-6h4v4H5V5zm8-2v8h8V3h-8zm6 6h-4V5h4v4zM3 21h8v-8H3v8zm2-6h4v4H5v-4zm8 2h2v2h-2v-2zm2-2h2v2h-2v-2zm2 2h2v2h-2v-2zm2-2h2v2h-2v-2z" />
                  </svg>
                </div>
                <div className="text-left">
                  <h1 className="text-6xl font-bold text-dark">Smart QR Manager</h1>
                  <p className="text-coral text-xl font-bold mt-2">Profesyonel QR Kod Yönetimi</p>
                </div>
              </div>

              <h2 className="text-7xl font-bold text-dark mb-8 leading-tight">
                Dinamik QR Kodlarıyla
                <br />
                <span className="text-emerald-600">Dijital Dönüşümü Hızlandırın</span>
              </h2>
              <p className="text-xl text-dark/70 mb-12 max-w-3xl mx-auto leading-relaxed">
                Akıllı QR kodları oluşturun, gerçek zamanlı performans takibi yapın ve 
                pazarlama kampanyalarınızı veri odaklı optimize edin. 
                Kurumsal düzeyde güvenlik ve ölçeklenebilirlik.
              </p>

              {/* CTA Butonları */}
              <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
                {isAuthenticated ? (
                  <>
                    <Button
                      onClick={() => navigate('/qr/generate')}
                      className="py-6 px-10 text-xl font-bold bg-yellow text-dark hover:bg-yellow/90 transition-colors shadow-[4px_4px_0_0_#1F2937] active:translate-y-0.5 rounded-2xl"
                    >
                      QR Kod Oluştur
                    </Button>
                    <Button
                      onClick={() => navigate('/analytics')}
                      variant="outline"
                      className="py-6 px-10 text-xl font-bold border-2 border-dark hover:bg-dark hover:text-cream transition-colors rounded-2xl"
                    >
                      Analitikleri Görüntüle
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={() => navigate('/register')}
                      className="py-6 px-10 text-xl font-bold bg-green text-white hover:bg-green/90 transition-colors shadow-[4px_4px_0_0_#1F2937] active:translate-y-0.5 rounded-2xl"
                    >
                      Ücretsiz Başlayın
                    </Button>
                    <Button
                      onClick={() => navigate('/login')}
                      variant="outline"
                      className="py-6 px-10 text-xl font-bold border-2 border-dark hover:bg-dark hover:text-cream transition-colors rounded-2xl"
                    >
                      Giriş Yapın
                    </Button>
                  </>
                )}
              </div>

              {/* User Info */}
              {isAuthenticated && user && (
                <div className="inline-flex items-center space-x-3 px-6 py-3 bg-yellow/20 rounded-full border-2 border-yellow/50 md:hidden">
                  <svg className="w-5 h-5 text-dark" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-bold text-dark">
                    Hoş geldiniz, {user.name || user.email}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-dark mb-4">Platformumuzun Gücü</h3>
            <p className="text-xl text-dark/70">Binlerce işletmenin güvenini kazandık</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center p-8 border-2 border-dark/10 shadow-[4px_4px_0_0_#1F2937] transition-transform hover:translate-y-1">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-yellow rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[2px_2px_0_0_#1F2937]">
                  <svg className="w-8 h-8 text-dark" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                  </svg>
                </div>
                <div className="text-5xl font-bold text-dark mb-2">10K+</div>
                <div className="text-lg text-dark/70 font-semibold">QR Kodu</div>
                <p className="text-sm text-dark/50 mt-2">Günlük olarak oluşturuluyor</p>
              </CardContent>
            </Card>

            <Card className="text-center p-8 border-2 border-dark/10 shadow-[4px_4px_0_0_#1F2937] transition-transform hover:translate-y-1">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-green rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[2px_2px_0_0_#1F2937]">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                </div>
                <div className="text-5xl font-bold text-dark mb-2">99.9%</div>
                <div className="text-lg text-dark/70 font-semibold">Uptime</div>
                <p className="text-sm text-dark/50 mt-2">Kesintisiz hizmet</p>
              </CardContent>
            </Card>

            <Card className="text-center p-8 border-2 border-dark/10 shadow-[4px_4px_0_0_#1F2937] transition-transform hover:translate-y-1">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-coral rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[2px_2px_0_0_#1F2937]">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
                  </svg>
                </div>
                <div className="text-5xl font-bold text-dark mb-2">24/7</div>
                <div className="text-lg text-dark/70 font-semibold">Destek</div>
                <p className="text-sm text-dark/50 mt-2">Teknik yardım</p>
              </CardContent>
            </Card>
          </div>
          <div className="p-6 bg-white rounded-2xl shadow-lg border border-slate-200 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
              </svg>
            </div>
            <h4 className="text-xl font-semibold text-slate-900 mb-2">Özelleştirme</h4>
            <p className="text-slate-600">Renkler ve logolar ile QR kodlarınızı kişiselleştirin</p>
          </div>

          <div className="p-6 bg-white rounded-2xl shadow-lg border border-slate-200 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm1 2a1 1 0 000 2h6a1 1 0 100-2H7zm6 7a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1zm-3 3a1 1 0 100 2h.01a1 1 0 100-2H10zm-4 1a1 1 0 011-1h.01a1 1 0 110 2H7a1 1 0 01-1-1zm1-4a1 1 0 100 2h.01a1 1 0 100-2H7zm2 1a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1zm4-2a1 1 0 100 2h.01a1 1 0 100-2H13z" clipRule="evenodd"/>
              </svg>
            </div>
            <h4 className="text-xl font-semibold text-slate-900 mb-2">Detaylı Raporlar</h4>
            <p className="text-slate-600">Excel ve CSV formatında veri dışa aktarma</p>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h3 className="text-4xl font-bold text-dark mb-4">Paketlerimiz</h3>
          <p className="text-xl text-dark/70 mb-8">İhtiyaçlarınıza uygun esnek paketler</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <PricingCard
            title="Starter"
            price="Ücretsiz"
            period="ay"
            description="Düşük ücret, hızlı kullanıcı kazanımı"
            features={[
              "Business Card",
              "Basit Dinamik QR",
              "Sınırlı Analitik"
            ]}
            badge="POPÜLER"
            badgeColor="green"
            buttonText="Başlayın"
            buttonVariant="green"
          />

          <PricingCard
            title="Pro"
            price="₺199"
            period="ay"
            description="Zamana duyarlı QR, API, Analitik → Orta segment"
            features={[
              "Starter paketinin tüm özellikleri",
              "Zamana Duyarlı QR",
              "Video QR",
              "Gelişmiş Analitik",
              "API Erişimi"
            ]}
            badge="EN ÇOK TERCİH EDİLEN"
            badgeColor="yellow"
            buttonText="Şimdi Yükselt"
            buttonVariant="yellow"
            popular={true}
          />

          <PricingCard
            title="Enterprise"
            price="Özel"
            period="teklif"
            description="Yüksek fiyat, özel destek ve entegrasyon"
            features={[
              "Pro paketinin tüm özellikleri",
              "Geo-Fence",
              "AI İçerik",
              "White-Label",
              "Gelişmiş Otomasyon",
              "7/24 Özel Destek"
            ]}
            badge="KURUMSAL"
            badgeColor="coral"
            buttonText="Satış Ekibi İle İletişime Geç"
            buttonVariant="coral"
          />
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-3xl p-12 text-center text-white">
          <h3 className="text-4xl font-bold mb-4">Hemen Başlayın</h3>
          <p className="text-xl mb-8 text-emerald-100">
            Smart QR Manager ile dijital pazarlama kampanyalarınızı bir üst seviyeye taşıyın
          </p>
          <Button
            onClick={() => navigate(isAuthenticated ? '/qr/generate' : '/register')}
            className="py-4 px-8 text-lg font-semibold bg-white text-emerald-700 hover:bg-emerald-50 shadow-xl"
          >
            {isAuthenticated ? 'QR Kod Oluştur' : 'Ücretsiz Kaydolun'}
          </Button>
        </div>
      </div>
    </div>
  );
}
