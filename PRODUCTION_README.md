# SmartQR - Production Kurulum Checklist (Yapılacaklar)

Bu doküman SmartQR backend’i production ortamına güvenli ve sürdürülebilir şekilde almak için yapılacakları checklist formatında listeler.

> Hedef: `https://qr.smartqr.com/<shortCode>` üzerinden redirect çalışacak. Admin/API ise örn: `https://api.smartqr.com` veya aynı domain altında `/api` ile sunulabilir.

---

## 1) Altyapı Kararı

- [ ] **Hosting** seç:
  - [ ] VPS (Hetzner/DigitalOcean)
  - [ ] Managed (Render/Fly.io)
  - [ ] Kubernetes (ileri seviye)
- [ ] **DB** seç:
  - [ ] Managed Postgres (önerilir)
  - [ ] Self-hosted Postgres
- [ ] **Cache** seç:
  - [ ] Managed Redis (önerilir)
  - [ ] Self-hosted Redis
- [ ] **Storage** seç:
  - [ ] S3 (önerilir)
  - [ ] Local disk (tek sunucu ise mümkün)

---

## 2) DNS ve Domain

### 2.1 Subdomainler
- [ ] `qr.smartqr.com` → yönlendirme/redirect sunucusu
- [ ] (opsiyonel) `api.smartqr.com` → API
- [ ] (opsiyonel) `admin.smartqr.com` → Admin panel

### 2.2 DNS kayıtları
- [ ] **A Record**
  - [ ] `qr.smartqr.com` → Sunucu IP
  - [ ] `api.smartqr.com` → Sunucu IP (opsiyonel)
- [ ] **CNAME** (opsiyonel)
  - [ ] `www.smartqr.com` → `smartqr.com`

---

## 3) SSL (HTTPS)

- [ ] Let’s Encrypt kurulumu (Nginx/Certbot)
- [ ] Sertifikalar:
  - [ ] `qr.smartqr.com`
  - [ ] `api.smartqr.com` (varsa)
- [ ] Otomatik yenileme:
  - [ ] `certbot renew` cron

---

## 4) Reverse Proxy (Nginx)

- [ ] Nginx kur
- [ ] `qr.smartqr.com` server block:
  - [ ] `/:shortCode` isteklerini backend’e proxy et
- [ ] `api.smartqr.com` server block (opsiyonel):
  - [ ] `/api/*` isteklerini backend’e proxy et
- [ ] HTTP → HTTPS redirect aktif et

**Örnek (özet) Nginx config:**
```nginx
server {
  listen 80;
  server_name qr.smartqr.com;
  return 301 https://$host$request_uri;
}

server {
  listen 443 ssl;
  server_name qr.smartqr.com;

  # ssl_certificate ...
  # ssl_certificate_key ...

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

---

## 5) Backend Deploy

### 5.1 Environment Variables (Production)
- [ ] `.env` production oluştur
- [ ] Zorunlu değişkenler:
  - [ ] `NODE_ENV=production`
  - [ ] `PORT=3000`
  - [ ] `APP_URL=https://qr.smartqr.com`
  - [ ] `QR_BASE_URL=https://qr.smartqr.com`
  - [ ] `DATABASE_URL=postgresql://...`
  - [ ] `REDIS_URL=redis://...`
  - [ ] `JWT_SECRET=...` (**güçlü, random**)

### 5.2 Build/Run
- [ ] `npm ci`
- [ ] `npx prisma generate`
- [ ] `npx prisma migrate deploy` (production’da)
- [ ] Process manager:
  - [ ] PM2 veya
  - [ ] systemd

---

## 6) Database

- [ ] Migration stratejisi:
  - [ ] Production: `prisma migrate deploy`
- [ ] Index kontrol:
  - [ ] `qr_codes.shortCode` unique index
  - [ ] `url_destinations.qrCodeId` index
  - [ ] `qr_analytics.qrCodeId` index
- [ ] Backup:
  - [ ] günlük pg_dump
  - [ ] retention planı (örn: 7/30 gün)

---

## 7) Redis

- [ ] Redis authentication / network restriction
- [ ] Persistence seçimi (AOF/RDB)
- [ ] Monitoring

---

## 8) Storage (S3 Önerilen)

Şu an local disk ile çalışır. Production’da S3’e geçmek için:

- [ ] S3 bucket oluştur
- [ ] Public read policy veya signed URL stratejisi belirle
- [ ] `STORAGE_PROVIDER=s3` gibi bir env standardı belirle
- [ ] `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `S3_BUCKET` ekle
- [ ] `storageService.ts` içine S3 provider ekle

---

## 9) Güvenlik

- [ ] CORS production origin kısıtla
- [ ] Rate limit production değerlerini sıkılaştır
- [ ] `helmet` ayarlarını gözden geçir
- [ ] JWT secret rotation planı
- [ ] Admin panel için ekstra koruma (2FA opsiyonel)

---

## 10) Observability (Log/Metric)

- [ ] Uygulama logları:
  - [ ] JSON log (opsiyonel)
  - [ ] log rotation
- [ ] Error tracking:
  - [ ] Sentry (opsiyonel)
- [ ] Uptime monitoring:
  - [ ] Health endpoint izleme

---

## 11) Go-Live Checklist

- [ ] `GET /health` prod’da OK
- [ ] `POST /api/auth/login` çalışıyor
- [ ] `POST /api/qr/generate` çalışıyor
- [ ] `GET https://qr.smartqr.com/<shortCode>` 302 redirect yapıyor
- [ ] Analytics insert oluyor
- [ ] Cache hit/miss beklenen gibi

---

## 12) Rollback Planı

- [ ] Önceki deploy artefact’ını tut
- [ ] DB migration rollback stratejisi (Prisma’da dikkat)
- [ ] Feature flag ile kritik değişiklikleri kontrol et
