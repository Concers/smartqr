# SmartQR - Dynamic QR Code System with URL Routing

## Proje Genel Bakış

SmartQR, dinamik QR kodları oluşturan ve bu QR kodların yönlendirme URL'lerini gerçek zamanlı olarak değiştirmenizi sağlayan bir sistemdir. Bir kere oluşturulan QR kod kalıcıdır, ancak içindeki linkleri yönetim paneli üzerinden istediğiniz zaman güncelleyebilirsiniz.

## 🚀 Özellikler

- ✅ **Dinamik QR Kod Oluşturma**: Tek seferde kalıcı QR kodları
- ✅ **Gerçek Zamanlı URL Yönlendirme**: QR kodları yeniden oluşturmadan hedef URL değiştirme
- ✅ **Yönetim Paneli**: URL'leri yönetmek için modern arayüz
- ✅ **Analytics**: Tıklama istatistikleri ve cihaz takibi
- ✅ **Redis Cache**: Yüksek performanslı yönlendirme
- ✅ **API Destek**: RESTful API ile entegrasyon

## 🛠️ Teknoloji Stack'i

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **PostgreSQL** - Veritabanı
- **Redis** - Cache ve session
- **Prisma** - ORM
- **JWT** - Authentication

### Frontend (Admin Panel)
- **React.js** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Query** - State management
- **React Router** - Navigation

### QR Generation
- **qrcode** - QR code generation
- **sharp** - Image processing

## 📋 Kurulum

### Gereksinimler
- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- npm veya yarn

### Backend Kurulum

```bash
# Clone repository
git clone <repository-url>
cd SmartQR

# Backend dependencies
cd backend
npm install

# Environment variables
cp .env.example .env
# .env dosyasını düzenleyin

# Veritabanı migration
npx prisma migrate dev

# Redis başlatın
redis-server

# Backend server
npm run dev
```

### Frontend Kurulum

```bash
# Frontend dependencies
cd frontend
npm install

# Development server
npm start
```

## 🗄️ Veritabanı Şeması

### QR Codes Tablosu
```sql
CREATE TABLE qr_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    short_code VARCHAR(10) UNIQUE NOT NULL,
    original_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    user_id UUID REFERENCES users(id)
);
```

### URL Destinations Tablosu
```sql
CREATE TABLE url_destinations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    qr_code_id UUID REFERENCES qr_codes(id),
    destination_url TEXT NOT NULL,
    active_from TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 1
);
```

### Analytics Tablosu
```sql
CREATE TABLE qr_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    qr_code_id UUID REFERENCES qr_codes(id),
    ip_address INET,
    user_agent TEXT,
    country VARCHAR(2),
    city VARCHAR(100),
    device_type VARCHAR(50),
    browser VARCHAR(50),
    accessed_at TIMESTAMP DEFAULT NOW()
);
```

## 🚀 API Endpoint'leri

### QR Kod Management

#### QR Kod Oluştur
```http
POST /api/qr/generate
Content-Type: application/json

{
  "destinationUrl": "https://example.com",
  "customCode": "optional-custom-code",
  "expiresAt": "2024-12-31T23:59:59Z"
}
```

**Response:**
```json
{
  "id": "uuid",
  "shortCode": "abc123",
  "qrCodeUrl": "https://your-domain.com/abc123",
  "qrCodeImage": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "destinationUrl": "https://example.com",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

#### QR Kod Listesi
```http
GET /api/qr/list?page=1&limit=10&search=keyword
```

#### QR Kod Detayı
```http
GET /api/qr/:id
```

#### QR Kod Güncelle
```http
PUT /api/qr/:id/destination
Content-Type: application/json

{
  "destinationUrl": "https://new-destination.com",
  "activeFrom": "2024-01-01T00:00:00Z",
  "expiresAt": "2024-12-31T23:59:59Z"
}
```

#### QR Kod Sil
```http
DELETE /api/qr/:id
```

### URL Yönlendirme

#### Short URL Redirect (Subdomain)
```http
GET https://qr.smartqr.com/:shortCode
```
*Response: 302 Redirect to destination URL*

#### Short URL Redirect (Custom Domain)
```http
GET https://your-domain.com/:shortCode
```
*Response: 302 Redirect to destination URL*

### Analytics

#### İstatistikler
```http
GET /api/qr/:id/analytics?from=2024-01-01&to=2024-01-31
```

**Response:**
```json
{
  "totalClicks": 1250,
  "uniqueVisitors": 890,
  "topCountries": [
    {"country": "TR", "count": 450},
    {"country": "US", "count": 320}
  ],
  "devices": [
    {"type": "mobile", "count": 780},
    {"type": "desktop", "count": 470}
  ],
  "dailyStats": [
    {"date": "2024-01-01", "clicks": 45},
    {"date": "2024-01-02", "clicks": 52}
  ]
}
```

## 📁 Proje Yapısı

```
SmartQR/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── qrController.ts
│   │   │   ├── analyticsController.ts
│   │   │   └── authController.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   ├── rateLimit.ts
│   │   │   └── validation.ts
│   │   ├── routes/
│   │   │   ├── qr.ts
│   │   │   ├── analytics.ts
│   │   │   └── auth.ts
│   │   ├── services/
│   │   │   ├── qrService.ts
│   │   │   ├── cacheService.ts
│   │   │   └── analyticsService.ts
│   │   ├── utils/
│   │   │   ├── shortCodeGenerator.ts
│   │   │   ├── qrGenerator.ts
│   │   │   └── validators.ts
│   │   ├── config/
│   │   │   ├── database.ts
│   │   │   ├── redis.ts
│   │   │   └── app.ts
│   │   └── app.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── QRGenerator/
│   │   │   ├── QRList/
│   │   │   ├── Analytics/
│   │   │   └── Layout/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── utils/
│   │   └── App.tsx
│   ├── package.json
│   └── tsconfig.json
├── docker-compose.yml
├── README.md
└── .gitignore
```

## 🔧 Environment Variables

### Backend (.env)
```env
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/smartqr"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# App
APP_URL="http://localhost:3000"
FRONTEND_URL="http://localhost:3001"

# QR Code
QR_BASE_URL="https://qr.smartqr.com"
QR_CUSTOM_DOMAIN_ENABLED=true
QR_DOMAIN_ALIASES="your-domain.com,another-domain.com"
```

### Frontend (.env)
```env
REACT_APP_API_URL="http://localhost:3000/api"
REACT_APP_QR_BASE_URL="https://qr.smartqr.com"
```

## 🐳 Docker ile Kurulum

```bash
# Docker compose ile tüm servisleri başlat
docker-compose up -d

# Veritabanı migration
docker-compose exec backend npx prisma migrate dev
```

## 📊 Kullanım Örnekleri

### 1. QR Kod Oluşturma

```javascript
// API call
const response = await fetch('/api/qr/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    destinationUrl: 'https://my-website.com',
    customCode: 'my-qr'
  })
});

const qrData = await response.json();
console.log(qrData.qrCodeImage); // Base64 QR image
console.log(qrData.qrCodeUrl);   // https://qr.smartqr.com/my-qr
```

### 2. URL Yönlendirme Güncelleme

```javascript
// Update destination
await fetch(`/api/qr/${qrId}/destination`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    destinationUrl: 'https://new-destination.com'
  })
});
```

### 3. Analytics Verileri

```javascript
// Get analytics
const analytics = await fetch(`/api/qr/${qrId}/analytics`);
const data = await analytics.json();

console.log(`Toplam tıklama: ${data.totalClicks}`);
console.log(`Benzersiz ziyaretçi: ${data.uniqueVisitors}`);
```

## 🌐 Subdomain ve Domain Yönetimi

### Subdomain Yapılandırması

QR kodları için özel subdomain kullanımı:

```bash
# DNS Ayarları
qr.smartqr.com -> A RECORD -> Sunucu IP
*.qr.smartqr.com -> CNAME -> qr.smartqr.com
```

### Nginx Konfigürasyonu

```nginx
# /etc/nginx/sites-available/qr.smartqr.com
server {
    listen 80;
    server_name qr.smartqr.com *.qr.smartqr.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### SSL Sertifikası (Let's Encrypt)

```bash
# SSL sertifikası oluştur
sudo certbot --nginx -d qr.smartqr.com -d *.qr.smartqr.com
```

### Custom Domain Desteği

Kullanıcıların kendi domain'lerini kullanabilmesi için:

```javascript
// Domain validation middleware
const validateDomain = (req, res, next) => {
  const host = req.hostname;
  const allowedDomains = process.env.QR_DOMAIN_ALIASES.split(',');
  
  if (host === 'qr.smartqr.com' || allowedDomains.includes(host)) {
    next();
  } else {
    res.status(403).json({ error: 'Domain not allowed' });
  }
};
```

## 🔒 Güvenlik

- **Rate Limiting**: API endpoint'leri için istek limitleri
- **Input Validation**: Tüm girdilerin doğrulanması
- **CORS**: Cross-origin request güvenliği
- **HTTPS**: Production'da SSL zorunluluğu
- **URL Validation**: Malicious URL tespiti

## 🚀 Deployment

### Production Setup

```bash
# Build
npm run build

# Production mode
npm start

# PM2 ile process management
pm2 start ecosystem.config.js
```

### Environment Variables (Production)
```env
NODE_ENV=production
PORT=3000
DATABASE_URL="postgresql://user:pass@prod-db:5432/smartqr"
REDIS_URL="redis://prod-redis:6379"
JWT_SECRET="production-jwt-secret"
```

## 📈 Performans Optimizasyonu

- **Redis Cache**: Yönlendirme URL'leri cache'lenir
- **CDN**: QR kod görselleri CDN üzerinden sunulur
- **Database Indexing**: Sorgular için optimize edilmiş index'ler
- **Compression**: Gzip ile response compression

## 🤝 Contributing

1. Fork repository
2. Feature branch oluştur (`git checkout -b feature/amazing-feature`)
3. Commit yap (`git commit -m 'Add amazing feature'`)
4. Push yap (`git push origin feature/amazing-feature`)
5. Pull request oluştur

## 📝 Lisans

Bu proje MIT lisansı altında dağıtılmaktadır.

## 🆘 Destek

Sorularınız için:
- 📧 Email: support@smartqr.com
- 📱 Discord: [Sunucu Linki]
- 🐛 Issues: [GitHub Issues]

---

**SmartQR** - QR kodlarınızı akıllı hale getirin! 🚀
