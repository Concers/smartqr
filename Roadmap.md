QRGenerator Yeni Özellikler — Yapılacaklar (MD)
Aşağıdaki maddeler QRGenerator.tsx (ve gerekli backend/redirect parçaları) için “1. adıma dönmeden önce” yapılacakların net listesidir. Eklemeden sonra 1. adımdan başlayacağız.

1) PDF QR (Dosya Yükleme + 3MB Limit)
[UI] QR tipi olarak PDF seçeneği ekle.
[UI] PDF seçildiğinde:
PDF upload input göster (sadece .pdf).
Max 3MB client-side kontrol:
file.size <= 3 * 1024 * 1024 değilse hata ver ve yüklemeyi engelle.
Yükleme esnasında progress/loading state göster.
[Frontend API] PDF upload için endpoint çağrısı tasarla:
POST /uploads/pdf gibi (multipart/form-data).
Response: { url: string }.
[Backend] Upload endpoint’i:
3MB limit (middleware: multer limits).
Content-Type kontrolü: application/pdf.
Storage’a kaydet (mevcut storage altyapısı neyse ona uygun: local/S3).
Public erişilebilir url döndür.
[QR Destination] QR’nin destinationUrl alanında:
Direkt PDF URL saklanacak (ör: https://.../files/abc.pdf)
Redirect sayfasında doğrudan açılabilir (yeni sekme / inline).

Durum: ✅ Tamamlandı

2) Sosyal Medya QR (Bağlantıların Listesi → Sosyal Medya)
[UI] “Bağlantıların Listesi” adını Sosyal Medya olarak değiştir.
[UI] Sosyal Medya form alanları:
Facebook
Instagram
X (Twitter)
(opsiyonel) TikTok, YouTube, LinkedIn
[UI] Her alan için:
kullanıcı adı veya link kabul et
input yardımcı metin/placeholder (örn. kullaniciadi veya https://...)
[Serialize] Kaydederken:
Dolu olanları normalize et (username → tam URL’ye çevir).
Tek bir “hedef sayfa” formatı belirle:
seçenek A: backend’de “sosyal medya landing” sayfası oluşturup QR onu açar
seçenek B: data: URI ile taşımak (uzun olabilir → genelde önerilmez)
[Preview] Generator’da önizleme kartı (butonlar/ikonlar) göster.

Durum: 🚧 Başlandı (2. task)
3) Video QR (Sadece Video Linkleri + Iframe Viewer)
[UI] QR tipi olarak Video ekle.
[UI] Video seçildiğinde:
Sadece video link input’u göster.
URL validasyonu yap (en azından http/https).
[Redirect/View] Linke gidildiğinde:
Iframe içinde açan viewer sayfası oluştur:
örn. /v/:shortCode veya /view/video/:shortCode
Viewer sayfası:
resolve edip gerçek URL’yi alır
URL’yi embed’e çevirir (YouTube/Vimeo için)
[Security] Iframe için allowlist:
youtube.com, youtu.be, vimeo.com vb.
Diğer domain gelirse “güvenli değil” uyarısı + dış link ile aç.

Durum: 🚧 Başlandı (3. task)
4) Görsel QR (Upload + 3MB + Compress + URL’den Çekme)
[UI] QR tipi olarak Görsel ekle.
[UI] Görsel seçildiğinde iki seçenek:
Dosya yükle (png/jpg/webp) (max 3MB)
URL’den çek (image URL input)
[Client-side Compress] Dosya yüklemede:
Upload öncesi compress/resize:
hedef: webp veya jpeg
max genişlik/yükseklik (örn 1600px)
kalite (örn 0.75)
Compress sonrası dosya hâlâ 3MB üstüyse engelle.
[Backend] POST /uploads/image:
max 3MB (upload sonrası da kontrol)
content-type allowlist: image/png, image/jpeg, image/webp
url döndür
[QR Destination]
Saklanan destinationUrl bir image URL olacak.
Redirect’te direkt açılabilir veya bir viewer sayfasında gösterilebilir.

Durum: 🚧 Başlandı (4. task)
5) WiFi QR (SSID + Password + Mevcut WiFi Bilgisini Alma)
[UI] QR tipi olarak WiFi ekle.
[UI] Alanlar:
WiFi adı (SSID)
Şifre (password)
Güvenlik türü (WPA/WEP/None) seçimi
(opsiyonel) “Hidden” toggle
[Payload Standard] WiFi QR formatı:
WIFI:T:WPA;S:SSID;P:password;H:false;;
Bunu destinationUrl yerine WiFi payload olarak üretme (QR içeriği olarak)
[Mevcut WiFi Bilgisi] “Kullanıcı bir WiFi’de ise bilgilerini alabilme”:
Web tarayıcılarında SSID/password okumak genelde mümkün değil (güvenlik kısıtları).
Yapılabilecekler:
Sadece kullanıcıdan manuel giriş
(opsiyonel) mobil app / native layer varsa oradan alınabilir
(opsiyonel) PWA/Browser ile sınırlı bilgi: SSID yok
[UX] “Mevcut WiFi’yi otomatik doldur” butonu koyup:
desteklenmiyorsa açıklama göster.

Durum: 🚧 Başlandı (5. task)
6) Ortak Backend/Storage Gereksinimleri
[Upload altyapısı]
Multipart upload middleware (multer)
Dosya boyut limiti 3MB
Content-type doğrulama
Dosya isimlendirme/klasörleme (uploads/pdf, uploads/images)
Public URL üretimi
[DB] QR’nin destination’ı dosya URL’si olacağı için:
mevcut destinationUrl alanı yeterli
ek metadata gerekirse (fileType, mime) ileride opsiyonel
7) Redirect / Viewer Sayfaları
[Video Viewer] iframe sayfası + allowlist + embed dönüştürme
[Image Viewer] (opsiyonel ama iyi UX):
image’i sayfada göster + download/open
[PDF] direkt açılabilir, gerekirse PDF viewer sayfası
Sonraki Adım
Bu liste onaylandıktan sonra 1. adımdan (PDF upload + 3MB limit) başlayacağız.

2 kısa soru (başlamadan netleştirelim)
[PDF/Görsel dosyaları] Nerede saklayalım? (mevcut backend’de kullandığınız storage: local mı S3 benzeri mi?)
[Sosyal Medya QR] QR okutulunca tek bir “Sosyal Medya sayfası” mı açılsın (öneririm) yoksa direkt bir profile mı yönlensin?
Feedback submitted



[PDF/Görsel dosyaları] Nerede saklayalım? (mevcut backend’de kullandığınız storage: local mı S3 benzeri mi?)

Uploads klasöründe 

[Sosyal Medya QR] QR okutulunca tek bir “Sosyal Medya sayfası” mı açılsın (öneririm) yoksa direkt bir profile mı yönlensin?

kullanıcı için seçim olsun öyle yönlendirilsin.

Bunları md olarak oluştur 
Kararlar (MD)
Dosya Saklama (PDF / Görsel)
Hedef: Backend tarafında dosyalar uploads/ klasöründe saklanacak.
Yapı önerisi:
uploads/pdf/
uploads/images/
Erişim:
Backend uploads klasörünü static serve edecek (örn. /uploads/...).
Frontend QR destinationUrl alanına bu public URL yazılacak.
Sosyal Medya QR Yönlendirme Davranışı
Kullanıcıya seçim sunulacak:

Seçenek A — Sosyal Medya Sayfası (Landing)
QR okutulunca tek bir sayfa açılır.
Sayfada Facebook/Instagram/X vb. butonlar listelenir.
Kullanıcı hangi platforma gideceğini oradan seçer.
Seçenek B — Direkt Profile Yönlendirme
QR okutulunca kullanıcı seçtiği tek sosyal medya profiline direkt gider (örn. sadece Instagram).
Generator ekranında bu seçim için bir alan olacak (örn. radio/select):

Yönlendirme Tipi: Landing / Direkt
Uygulama Notu (Kısa)
Landing seçeneğinde QR destinationUrl büyük ihtimalle bizim uygulama içi bir route olacak (örn. /sm/:shortCode gibi), sayfa resolve edip kayıtlı sosyal medya linklerini gösterecek.
Direkt seçeneğinde QR destinationUrl seçilen platformun URL’si olacak.
Durum
Tamamlandı: Dosya saklama yeri ve sosyal medya yönlendirme stratejisi netleştirildi (MD olarak yazıldı).