import { useState, useEffect, useCallback } from 'react';
import { 
  ChevronLeft, 
  ChevronRight,
  QrCode,
  Smartphone,
  BarChart3,
  Shield,
  Cloud,
  Building2
} from 'lucide-react';

interface HeroSliderProps {
  isAuthenticated: boolean;
  onGetStarted: () => void;
  onDemo: () => void;
}

interface Slide {
  id: number;
  badge: string;
  title: string;
  highlight: string;
  description: string;
  ctaPrimary: string;
  ctaSecondary: string;
  features: { icon: React.ElementType; text: string }[];
  image: string;
  imageAlt: string;
}

const slides: Slide[] = [
  {
    id: 1,
    badge: 'Kurumsal QR Çözümleri',
    title: 'Saniyeler İçinde',
    highlight: 'Profesyonel QR Kodları',
    description: 'İşletmeniz için dinamik, takip edilebilir ve tamamen özelleştirilebilir QR kodları oluşturun. Tek platformda tüm QR ihtiyaçlarınızı yönetin.',
    ctaPrimary: 'Hemen Başla',
    ctaSecondary: 'Demo Talep Et',
    features: [
      { icon: QrCode, text: 'Dinamik QR Kodları' },
      { icon: BarChart3, text: 'Gerçek Zamanlı Analitik' },
      { icon: Shield, text: 'Kurumsal Güvenlik' }
    ],
    image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&h=800&fit=crop',
    imageAlt: 'QR kod tarama'
  },
  {
    id: 2,
    badge: 'Çoklu Kullanım Alanı',
    title: 'Menü, Ödeme, Takip',
    highlight: 'Tek Platformda',
    description: 'Restoran menüleri, temassız ödeme, envanter takibi ve müşteri etkileşimi. Tüm sektörlere uygun esnek QR çözümleri.',
    ctaPrimary: 'Özellikleri Keşfet',
    ctaSecondary: 'Fiyatları Gör',
    features: [
      { icon: Smartphone, text: 'Dijital Menü' },
      { icon: BarChart3, text: 'Detaylı Raporlama' },
      { icon: Building2, text: 'Çoklu Şube Yönetimi' }
    ],
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=800&fit=crop',
    imageAlt: 'Dashboard analitik'
  },
  {
    id: 3,
    badge: 'Kurumsal Altyapı',
    title: 'Güvenli ve Ölçeklenebilir',
    highlight: 'Bulut Altyapısı',
    description: '%99.9 uptime garantisi, SSL şifreleme ve KVKK uyumlu veri yönetimi. Fortune 500 şirketlerinin tercih ettiği altyapı.',
    ctaPrimary: 'Kurumsal Teklif Al',
    ctaSecondary: 'Referansları Gör',
    features: [
      { icon: Cloud, text: 'Bulut Altyapı' },
      { icon: Shield, text: 'SSL Şifreleme' },
      { icon: Building2, text: '500+ Kurumsal Müşteri' }
    ],
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=800&fit=crop',
    imageAlt: 'Kurumsal güvenlik'
  }
];

export default function HeroSlider({ isAuthenticated, onGetStarted, onDemo }: HeroSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goToSlide = useCallback((index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide(index);
    setTimeout(() => setIsTransitioning(false), 500);
  }, [isTransitioning]);

  const nextSlide = useCallback(() => {
    goToSlide((currentSlide + 1) % slides.length);
  }, [currentSlide, goToSlide]);

  const prevSlide = useCallback(() => {
    goToSlide((currentSlide - 1 + slides.length) % slides.length);
  }, [currentSlide, goToSlide]);

  useEffect(() => {
    const interval = setInterval(nextSlide, 6000);
    return () => clearInterval(interval);
  }, [nextSlide]);

  const slide = slides[currentSlide];

  return (
    <section className="relative bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 min-h-[600px] lg:min-h-[700px]">
          
          {/* Sol Taraf - İçerik */}
          <div className="flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-16 lg:py-24 order-2 lg:order-1">
            <div 
              key={slide.id}
              className="transition-opacity duration-500 ease-in-out"
              style={{ opacity: isTransitioning ? 0 : 1 }}
            >
              {/* Badge */}
              <div className="inline-flex items-center px-4 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-full mb-6">
                <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                {slide.badge}
              </div>

              {/* Başlık */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-4">
                {slide.title}
                <br />
                <span className="text-blue-600">{slide.highlight}</span>
              </h1>

              {/* Açıklama */}
              <p className="text-lg text-slate-600 leading-relaxed mb-8 max-w-xl">
                {slide.description}
              </p>

              {/* Özellik Listesi */}
              <div className="flex flex-wrap gap-4 mb-10">
                {slide.features.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div 
                      key={index}
                      className="flex items-center text-slate-700"
                    >
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mr-3">
                        <Icon className="w-5 h-5 text-blue-600" />
                      </div>
                      <span className="text-sm font-medium">{feature.text}</span>
                    </div>
                  );
                })}
              </div>

              {/* CTA Butonları */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={onGetStarted}
                  className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {isAuthenticated ? 'Admin Panel' : slide.ctaPrimary}
                </button>
                <button
                  onClick={onDemo}
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-slate-900 font-semibold rounded-lg border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors"
                >
                  {slide.ctaSecondary}
                </button>
              </div>
            </div>

            {/* Slider Kontrolleri */}
            <div className="flex items-center gap-6 mt-12 pt-8 border-t border-slate-200">
              {/* Oklar */}
              <div className="flex gap-2">
                <button
                  onClick={prevSlide}
                  className="w-12 h-12 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                  aria-label="Önceki"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextSlide}
                  className="w-12 h-12 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                  aria-label="Sonraki"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Slide Göstergeleri */}
              <div className="flex gap-2">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === currentSlide 
                        ? 'w-8 bg-blue-600' 
                        : 'w-2 bg-slate-300 hover:bg-slate-400'
                    }`}
                    aria-label={`Slide ${index + 1}`}
                  />
                ))}
              </div>

              {/* Slide Numarası */}
              <div className="text-sm text-slate-500 ml-auto">
                <span className="font-semibold text-slate-900">{String(currentSlide + 1).padStart(2, '0')}</span>
                <span className="mx-1">/</span>
                <span>{String(slides.length).padStart(2, '0')}</span>
              </div>
            </div>
          </div>

          {/* Sağ Taraf - Görsel */}
          <div className="relative bg-slate-100 order-1 lg:order-2 min-h-[300px] lg:min-h-full">
            {/* Görsel Container */}
            <div className="absolute inset-0">
              {slides.map((s, index) => (
                <div
                  key={s.id}
                  className={`absolute inset-0 transition-opacity duration-500 ${
                    index === currentSlide ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <img
                    src={s.image}
                    alt={s.imageAlt}
                    className="w-full h-full object-cover"
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-blue-900/10"></div>
                </div>
              ))}
            </div>

            {/* Telefon Mockup Overlay */}
            <div className="absolute inset-0 flex items-center justify-center p-8 lg:p-16">
              <div className="relative w-full max-w-[280px] lg:max-w-[320px]">
                {/* Telefon Frame */}
                <div className="relative bg-slate-900 rounded-[3rem] p-3 shadow-2xl">
                  <div className="bg-white rounded-[2.5rem] overflow-hidden">
                    {/* Notch */}
                    <div className="bg-slate-900 h-8 flex items-center justify-center">
                      <div className="w-20 h-5 bg-slate-900 rounded-b-2xl"></div>
                    </div>
                    {/* Screen Content */}
                    <div className="bg-white p-6 min-h-[400px]">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <QrCode className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">netqr.io</h3>
                        <p className="text-sm text-slate-500 mb-6">QR Kodu Tara</p>
                        
                        {/* QR Placeholder */}
                        <div className="bg-slate-100 rounded-2xl p-6 mb-6">
                          <div className="grid grid-cols-5 gap-1">
                            {Array.from({ length: 25 }).map((_, i) => (
                              <div 
                                key={i} 
                                className={`aspect-square rounded-sm ${
                                  Math.random() > 0.5 ? 'bg-slate-900' : 'bg-white'
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="h-3 bg-slate-100 rounded-full w-3/4 mx-auto"></div>
                          <div className="h-3 bg-slate-100 rounded-full w-1/2 mx-auto"></div>
                        </div>
                      </div>
                    </div>
                    {/* Home Indicator */}
                    <div className="bg-white pb-4 flex justify-center">
                      <div className="w-32 h-1 bg-slate-300 rounded-full"></div>
                    </div>
                  </div>
                </div>

                {/* Floating Stats Card */}
                <div className="absolute -right-4 lg:-right-8 top-1/4 bg-white rounded-xl shadow-xl p-4 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Bugün</p>
                      <p className="text-lg font-bold text-slate-900">2,847</p>
                      <p className="text-xs text-green-600">+12.5%</p>
                    </div>
                  </div>
                </div>

                {/* Floating Security Badge */}
                <div className="absolute -left-4 lg:-left-8 bottom-1/4 bg-white rounded-xl shadow-xl p-4 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Shield className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">SSL Korumalı</p>
                      <p className="text-xs text-slate-500">256-bit şifreleme</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}
