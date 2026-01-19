import { Header } from '../components/Common/Header';
import { Button } from '../components/Common/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-cream">
      <Header />
      
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="text-4xl font-bold text-dark mb-4">Ücretlendirme</div>
            <div className="text-2xl text-dark mb-8">
              İşletmeniz için <span className="text-green">perfect</span> paketi seçin
            </div>
            <p className="text-lg text-dark/70 max-w-3xl mx-auto">
              QR kod yönetimi ihtiyaçlarınıza uygun esnek paketler. 
              Başlangıçtan kurumsal çözümlere kadar tüm seviyeler için özel teklifler.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {/* Starter */}
            <Card className="border-2 border-dark/10 shadow-[4px_4px_0_0_#1F2937] transition-transform hover:translate-y-1 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-green text-white px-4 py-1 rounded-full text-sm font-bold">
                  POPÜLER
                </div>
              </div>
              <CardHeader className="text-center pt-8">
                <CardTitle className="text-2xl font-bold text-dark mb-2">Starter</CardTitle>
                <div className="text-4xl font-bold text-dark mb-2">
                  Ücretsiz
                  <span className="text-lg font-normal text-dark/60">/ay</span>
                </div>
                <p className="text-dark/70">Düşük ücret, hızlı kullanıcı kazanımı</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center text-dark">
                    <svg className="w-5 h-5 text-green mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    Business Card
                  </li>
                  <li className="flex items-center text-dark">
                    <svg className="w-5 h-5 text-green mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    Basit Dinamik QR
                  </li>
                  <li className="flex items-center text-dark">
                    <svg className="w-5 h-5 text-green mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    Sınırlı Analitik
                  </li>
                </ul>
                <Button 
                  className="w-full bg-green text-white hover:bg-green/90 transition-colors shadow-[2px_2px_0_0_#1F2937] active:translate-y-0.5 min-h-[48px] flex items-center justify-center"
                >
                  Başlayın
                </Button>
              </CardContent>
            </Card>

            {/* Pro */}
            <Card className="border-2 border-yellow shadow-[6px_6px_0_0_#1F2937] transition-transform hover:translate-y-1 relative scale-105">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-yellow text-dark px-4 py-1 rounded-full text-sm font-bold">
                  EN ÇOK TERCİH EDİLEN
                </div>
              </div>
              <CardHeader className="text-center pt-8">
                <CardTitle className="text-2xl font-bold text-dark mb-2">Pro</CardTitle>
                <div className="text-4xl font-bold text-dark mb-2">
                  ₺199
                  <span className="text-lg font-normal text-dark/60">/ay</span>
                </div>
                <p className="text-dark/70">Zamana duyarlı QR, API, Analitik → Orta segment</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center text-dark">
                    <svg className="w-5 h-5 text-green mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    Starter paketinin tüm özellikleri
                  </li>
                  <li className="flex items-center text-dark">
                    <svg className="w-5 h-5 text-green mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    Zamana Duyarlı QR
                  </li>
                  <li className="flex items-center text-dark">
                    <svg className="w-5 h-5 text-green mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    Video QR
                  </li>
                  <li className="flex items-center text-dark">
                    <svg className="w-5 h-5 text-green mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    Gelişmiş Analitik
                  </li>
                  <li className="flex items-center text-dark">
                    <svg className="w-5 h-5 text-green mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    API Erişimi
                  </li>
                </ul>
                <Button 
                  className="w-full bg-yellow text-dark hover:bg-yellow/90 transition-colors shadow-[2px_2px_0_0_#1F2937] active:translate-y-0.5 min-h-[48px] flex items-center justify-center"
                >
                  Şimdi Yükselt
                </Button>
              </CardContent>
            </Card>

            {/* Enterprise */}
            <Card className="border-2 border-dark/10 shadow-[4px_4px_0_0_#1F2937] transition-transform hover:translate-y-1 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-coral text-white px-4 py-1 rounded-full text-sm font-bold">
                  KURUMSAL
                </div>
              </div>
              <CardHeader className="text-center pt-8">
                <CardTitle className="text-2xl font-bold text-dark mb-2">Enterprise</CardTitle>
                <div className="text-4xl font-bold text-dark mb-2">
                  Özel
                  <span className="text-lg font-normal text-dark/60">/teklif</span>
                </div>
                <p className="text-dark/70">Yüksek fiyat, özel destek ve entegrasyon</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center text-dark">
                    <svg className="w-5 h-5 text-green mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    Pro paketinin tüm özellikleri
                  </li>
                  <li className="flex items-center text-dark">
                    <svg className="w-5 h-5 text-green mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    Geo-Fence
                  </li>
                  <li className="flex items-center text-dark">
                    <svg className="w-5 h-5 text-green mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    AI İçerik
                  </li>
                  <li className="flex items-center text-dark">
                    <svg className="w-5 h-5 text-green mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    White-Label
                  </li>
                  <li className="flex items-center text-dark">
                    <svg className="w-5 h-5 text-green mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    Gelişmiş Otomasyon
                  </li>
                  <li className="flex items-center text-dark">
                    <svg className="w-5 h-5 text-green mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    7/24 Özel Destek
                  </li>
                </ul>
                <Button 
                  className="w-full bg-coral text-white hover:bg-coral/90 transition-colors shadow-[2px_2px_0_0_#1F2937] active:translate-y-0.5 min-h-[48px] flex items-center justify-center"
                >
                  Satış Ekibi İle İletişime Geç
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* FAQ Section */}
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-dark mb-8">Sıkça Sorulan Sorular</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <Card className="border-2 border-dark/10 shadow-[4px_4px_0_0_#1F2937]">
                <CardContent className="p-6">
                  <h4 className="font-bold text-dark mb-2">Paketleri değiştirebilir miyim?</h4>
                  <p className="text-dark/70">Evet, istediğiniz zaman paketlerinizi yükseltebilir veya düşürebilirsiniz.</p>
                </CardContent>
              </Card>
              <Card className="border-2 border-dark/10 shadow-[4px_4px_0_0_#1F2937]">
                <CardContent className="p-6">
                  <h4 className="font-bold text-dark mb-2">Ücretsiz deneme süresi var mı?</h4>
                  <p className="text-dark/70">Starter paketi tamamen ücretsizdir. Diğer paketler için 14 günlük deneme süresi sunuyoruz.</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <h3 className="text-3xl font-bold text-dark mb-4">Hangi Paket Size Uygun?</h3>
            <p className="text-xl text-dark/70 mb-8">İhtiyaçlarınıza uygun çözümü birlikte bulalım</p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button 
                onClick={() => window.location.href = '/qr/generate'}
                className="py-6 px-10 text-xl font-bold bg-yellow text-dark hover:bg-yellow/90 transition-colors shadow-[4px_4px_0_0_#1F2937] active:translate-y-0.5 rounded-2xl"
              >
                Ücretsiz Deneyin
              </Button>
              <Button 
                variant="outline"
                className="py-6 px-10 text-xl font-bold border-2 border-dark hover:bg-dark hover:text-cream transition-colors rounded-2xl"
              >
                Satış Ekibi İle İletişime Geç
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
