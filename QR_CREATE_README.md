# SmartQR - QR Oluşturma (Adım Adım)

Bu doküman, SmartQR backend çalışırken bir QR kodunu nasıl oluşturacağını, PNG olarak nasıl görüntüleyeceğini ve redirect’i nasıl test edeceğini adım adım anlatır.

## 0) Ön Koşullar

- Backend çalışıyor olmalı: `http://localhost:3000`
- PostgreSQL ve Redis çalışıyor olmalı (docker-compose ile veya local)
- `backend/.env` içinde `DATABASE_URL` ve `REDIS_URL` doğru olmalı

## 1) Backend’i çalıştır

```bash
cd backend
npm run dev
```

Kontrol:
- `GET http://localhost:3000/health` → `status: ok` dönmeli

## 2) Kullanıcı oluştur (Register)

Endpoint:
- `POST http://localhost:3000/api/auth/register`

Headers:
- `Content-Type: application/json`

Body:
```json
{
  "email": "test@smartqr.com",
  "password": "123456",
  "name": "Test"
}
```

Response içinden `token` dönebilir. Dönmezse 3. adım ile token al.

## 3) Login ol ve Token al

Endpoint:
- `POST http://localhost:3000/api/auth/login`

Headers:
- `Content-Type: application/json`

Body:
```json
{
  "email": "test@smartqr.com",
  "password": "123456"
}
```

Response örneği:
```json
{
  "success": true,
  "data": {
    "user": { "id": "...", "email": "test@smartqr.com" },
    "token": "<JWT>"
  }
}
```

Bu `token` değerini kopyala.

## 4) QR Oluştur (Generate)

QR oluşturma endpoint’i JWT ile korumalıdır.

Endpoint (alias):
- `POST http://localhost:3000/api/qr/generate`

(Alternatif endpoint):
- `POST http://localhost:3000/api/qr`

Headers:
- `Authorization: Bearer <JWT>`
- `Content-Type: application/json`

Body:
```json
{
  "destinationUrl": "https://example.com"
}
```

Response örneği:
```json
{
  "success": true,
  "data": {
    "id": "...",
    "shortCode": "abc123",
    "qrCodeUrl": "http://localhost:3000/abc123",
    "qrCodeImageUrl": "http://localhost:3000/uploads/qr/abc123.png",
    "destinationUrl": "https://example.com"
  }
}
```

Not:
- Development ortamında `qrCodeUrl` otomatik olarak `APP_URL` (default: `http://localhost:3000`) üzerinden üretilir.
- Production’da `QR_BASE_URL` vermezsen default olarak `https://qr.smartqr.com` kullanılır.

Eğer loglarda hâlâ `QR Base URL: https://qr.smartqr.com` görüyorsan:
- `backend/.env` içinde `QR_BASE_URL` set edilmiş demektir ve bu değer her zaman önceliklidir.
- Local test için şunu kullan:
  - `QR_BASE_URL="http://localhost:3000"`

## 5) QR PNG’yi Resim Olarak Görüntüle

Response içindeki `qrCodeImageUrl` alanını tarayıcıda aç:

- `http://localhost:3000/uploads/qr/abc123.png`

Bu bir PNG dosyasıdır ve tarayıcıda direkt görüntülenir.

## 6) Redirect Testi (QR okutma simülasyonu)

Bu endpoint public’tir (token gerekmez):

- `GET http://localhost:3000/abc123`

Beklenen:
- `302` redirect ile `https://example.com` adresine yönlenir.

## 7) QR Listeleme

Endpoint (alias):
- `GET http://localhost:3000/api/qr/list?page=1&limit=10`

Headers:
- `Authorization: Bearer <JWT>`

## 8) Sık Karşılaşılan Hatalar

### "Access token required"
- İstek header’ına `Authorization: Bearer <JWT>` eklemen gerekiyor.

### "Too many requests"
- Dev ortamında limitler yükseltildi ama Redis’te eski sayaçlar kalmış olabilir.
- 60 saniye bekle veya server’ı restart et.

### QR PNG gelmiyor
- `app.ts` içinde `/uploads` static serve açık olmalı.
- `backend/src/app.ts` içinde şu satır olmalı:
  - `app.use('/uploads', express.static(...))`

---

Bu dokümanı takip ederek QR oluşturabilir, PNG’yi görüntüleyebilir ve redirect’i test edebilirsin.
