# Backend Geliştirme Fazları

## Faz 1 - MVP Lansman (Yüksek Öncelik)

### 🚀 Temel QR Kod Tipleri
- **URL**: Internet Sitesi - URL doğrulama, kırık link kontrolü, UTM parametre desteği
- **Text**: Düz metin - Karakter limiti, UTF-8 desteği, statik QR optimizasyonu
- **WiFi**: Ağ bilgileri - WIFI: format standardı, şifre güvenlik uyarısı, iOS/Android uyumluluğu
- **VCard**: Dijital kartvizit - vCard 3.0/4.0 formatı, telefon formatı, rehbere kaydetme testi

### 📱 Sosyal Medya Entegrasyonları
- **Facebook**: Sayfa/profil URL doğrulama, beğen butonu API entegrasyonu
- **LinkedIn**: Profil/şirket URL format doğrulama, profesyonel fotoğraf boyutu
- **Twitter (X)**: Kullanıcı adı doğrulama, API erişim kısıtlamaları, sabit tweet güncelleme
- **YouTube**: Video/Kanal/Playlist URL ayrımı, abone ol butonu API, thumbnail otomatik çekme
- **Instagram**: Kullanıcı adı @ tamamlama, profil görseli çözünürlüğü, deep link desteği
- **TikTok**: Kullanıcı adı doğrulama, video önizleme kalitesi, deep link desteği

### 📞 İletişim Protokolleri
- **E-mail**: Adres doğrulama (regex), mailto: protokolü, URL encoding, CC/BCC gizlilik
- **Phone Call**: E.164 format doğrulama, tel: protokolü, mesai saatleri uyarısı
- **SMS**: Karakter limiti gösterimi, smsto: protokolü, uluslararası format, şablonlar
- **WhatsApp**: wa.me link formatı, ülke kodu zorunluluğu, URL encoding, Business vs Normal ayrımı

### 🎨 Medya ve İçerik
- **PDF**: Dosya boyutu limiti, mobil görüntüleyici uyumu, şifre korumalı PDF desteği
- **Video**: Dosya boyutu limiti (100MB), MP4/WebM formatları, thumbnail oluşturma
- **Görsel**: WebP dönüşüm, maksimum görsel sayısı, lazy loading, EXIF veri temizleme

### 📄 Doküman Entegrasyonları
- **Google Docs**: Paylaşım izni kontrolü, URL format doğrulama, erişim hatası yönlendirmesi
- **Google Forms**: Form URL doğrulama, kapanış tarihi mesajı, yanıt limiti uyarısı
- **Google Sheets**: Paylaşım izni kontrolü, sayfa/sekme yönlendirme, düzenleme/salt okunur ayrımı

### 📍 Konum ve Harita
- **Map**: Google/Apple Maps uyumu, enlem-boylam hassasiyeti (6 ondalık), geo: URI standardı
- **Yol tarifi**: Araba/yaya/toplu taşıma modları, konum pin doğruluğu

### 🛡️ Güvenlik ve Acil Durum
- **Acil Durum Konum**: Konum izni onayı, GPS doğruluk kontrolü, acil arama butonları (112,155,110)
- **Araç Camı**: Doğrudan arama butonu, standart cam boyutları, gece görünürlüğü
- **Pet ID**: Tasma etiketi boyutu, su geçirmez materyal, mikroçip doğrulama

---

## Faz 2 - İleri Özellikler (Orta Öncelik)

### 🌐 Web & Bağlantı
- **Çoklu Bağlantı Sayfası**: Linktree benzeri arayüz, sınırsız link ekleme
- **Sürükle-Bırak Sıralama**: Link sıralama mantığı, mobil uyumlu tasarım
- **Tıklama Analitiği**: Her link için tıklama takibi, kırık link uyarısı
- **Profil Özelleştirme**: Profil bölümü, arka plan teması, buton stili

### 💼 İş & Pazarlama
- **Google Review**: Google Places ID doğrulama, kısa review URL oluşturma
- **Kupon Sistemi**: Benzersiz kod kontrolü, geçerlilik tarihi, kullanım limiti
- **Minimum Sepet Tutarı**: Kupon doğrulama API, kullanılmış kupon gösterimi
- **Multi-platform Review**: Yelp, TripAdvisor entegrasyonu

### 📅 Etkinlik & Davet
- **Calendar**: ICS dosya formatı, zaman dilimi yönetimi (UTC)
- **Tekrarlama Kuralları**: RRULE standardı, Google/Apple/Outlook uyumluluğu
- **Konum Entegrasyonu**: Harita linki, hatırlatma süresi seçenekleri

### 🍽️ Yeme & İçme
- **Dijital Menü**: Kategori ekleme, ürün bilgileri, alerjen ikonları (14 ana alerjen)
- **Çoklu Dil Desteği**: Dil seçeneği, UX uyumu, fiyat güncelleme kolaylığı
- **Masaya Özel QR**: Her masa için özel kod, tükenmiş ürün gizleme
- **Özel Diyetler**: Vegeteryan/Vegan ikonları, kalori bilgisi

---

## Faz 3 - Tasarım ve Marka (Düşük Öncelik)

### 🎨 Logo ve Marka
- **Logo Entegrasyonu**: PNG/SVG desteği, boyutu ayarı (%30 max kaplama)
- **Renk Kontrast Kontrolü**: Minimum 4:1 oran, okunabilirlik testi
- **Hata Düzeltme Seviyesi**: Otomatik H seviyesi, logo entegrasyonuna göre ayar
- **Vektör Kalitesi**: SVG desteği, baskı çözünürlüğü (min 300 DPI)

### 🖼️ İş Kartı Tasarımları
- **Hazır Şablonlar**: Kurumsal, Modern, Minimal, Yaratıcı tasarımlar
- **Sektöre Uygunluk**: Her sektör için özel tasarım önerileri
- **Baskı Uyumu**: 85x55mm boyut, NFC entegrasyon imkanı

### 🔧 Gelişmiş Optimizasyon
- **Performans**: QR kod tarama hızı optimizasyonu
- **Test Sistemi**: Otomatik tarama testi zorunluluğu
- **Kalite Kontrol**: Baskı öncesi kalite kontrol sistemleri

---

## 🔧 Teknik Gereksinimler

### Veritabanı Yapısı
- QR kodları tablosu (type, content, analytics, settings)
- Kullanıcı ayarları tablosu (theme, preferences)
- Analitik verileri tablosu (clicks, locations, devices)
- Medya dosyaları tablosu (PDF, görseller, videolar)

### API Endpoints
- `POST /api/qr/generate` - QR kod oluşturma
- `GET /api/qr/:id` - QR kod detayları
- `PUT /api/qr/:id` - QR kod güncelleme
- `DELETE /api/qr/:id` - QR kod silme
- `GET /api/analytics/:id` - Analitik verileri

### Güvenlik
- Rate limiting (IP bazlı)
- Input validation ve sanitization
- File upload güvenliği
- CORS konfigürasyonu
- JWT token authentication

### Performans
- Redis cache için sık kullanılan QR kodlar
- CDN entegrasyonu medya dosyaları
- Database indexing optimizasyonu
- Asynchronous processing için büyük dosyalar
