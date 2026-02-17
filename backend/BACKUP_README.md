# SmartQR Database Yedekleme Sistemi

## 🗄️ Otomatik Database Yedekleme

SmartQR projesi için otomatik database yedekleme sistemi, her gün saat 03:00'te çalışacak şekilde yapılandırılmıştır.

## 📁 Dosya Yapısı

```
backend/scripts/
├── backup-database.sh      # Ana yedekleme script'i
└── setup-backup-cron.sh    # Cron job kurulum script'i
```

## 🚀 Kurulum

### 1. Script'lere Çalıştırma İzni Ver
```bash
chmod +x backend/scripts/backup-database.sh
chmod +x backend/scripts/setup-backup-cron.sh
```

### 2. Cron Job Kurulumu
```bash
./backend/scripts/setup-backup-cron.sh
```

### 3. Environment Variables Ayarla
Script'in çalışması için environment variables gerekli:
```bash
export DB_PASSWORD="your_database_password"
```

## ⚙️ Özellikler

### 🔄 **Otomatik Yedekleme**
- **Sıklık**: Her gün saat 03:00
- **Format**: SQL dump + gzip sıkıştırma
- **Konum**: `/var/backups/smartqr/`

### 📊 **Yedek Özellikleri**
- ✅ Tüm database schema ve verileri
- ✅ Sıkıştırılmış format (.gz)
- ✅ Tarih damgalı dosya adları
- ✅ Otomatik temizleme (30 gün)

### 🗑️ **Temizleme Politikası**
- **Saklama Süresi**: 30 gün
- **Otomatik Temizleme**: Eski yedekler silinir
- **Disk Alanı**: Optimize edilmiş

## 📝 Loglama

### Log Dosyası
- **Konum**: `/var/log/smartqr-backup.log`
- **Format**: Timestamp + mesaj
- **İçerik**: Başarı/hata durumları, dosya boyutları

### Log Örneği
```
2026-02-18 03:00:01 - === Database backup başlatılıyor ===
2026-02-18 03:00:02 - Database yedeği alınıyor: /var/backups/smartqr/smartqr_backup_2026-02-18_03-00-01.sql
2026-02-18 03:00:15 - ✅ Database yedeği başarıyla oluşturuldu
2026-02-18 03:00:16 - Yedek dosyası sıkıştırılıyor...
2026-02-18 03:00:18 - ✅ Yedek dosyası sıkıştırıldı
2026-02-18 03:00:18 - 📁 Yedek dosyası boyutu: 15.2MB
2026-02-18 03:00:18 - Eski yedekler temizleniyor (son 30 gün)...
2026-02-18 03:00:18 - 🗑️ Temizleme tamamlandı. Mevcut yedek sayısı: 30
2026-02-18 03:00:18 - === Database backup tamamlandı ===
```

## 🔧 Manuel Yedekleme

### Script'i Manuel Çalıştırma
```bash
./backend/scripts/backup-database.sh
```

### Yedek Listesini Görüntüleme
```bash
ls -la /var/backups/smartqr/
```

### Yedeği Geri Yükleme
```bash
gunzip -c /var/backups/smartqr/smartqr_backup_2026-02-18_03-00-01.sql.gz | psql -h localhost -U postgres -d smartqr
```

## 🛡️ Güvenlik

### ✅ **GitHub'a Eklenmez**
- Yedek dosyaları `.gitignore`'da hariç tutulmuştur
- Log dosyası GitHub'a eklenmez
- Sadece server'da saklanır

### 🔒 **Environment Variables**
- Database şifresi environment variable'dan alınır
- Kod içinde şifre saklanmaz
- Güvenli erişim sağlanır

## 🚨 Troubleshooting

### Cron Job Çalışmıyorsa
```bash
# Cron service durumunu kontrol et
sudo systemctl status cron

# Cron log'unu kontrol et
sudo tail -f /var/log/syslog | grep CRON
```

### Permission Hataları
```bash
# Script izinlerini kontrol et
ls -la backend/scripts/backup-database.sh

# Log dosyası izinlerini kontrol et
ls -la /var/log/smartqr-backup.log
```

### Database Bağlantı Hataları
```bash
# Database bağlantısını test et
psql -h localhost -U postgres -d smartqr -c "SELECT version();"
```

## 📊 İstatistikler

### Yedek Boyutları
- **Ortalama**: 10-20MB (sıkıştırılmış)
- **Frekans**: Günlük
- **Depolama**: ~600MB/ay (30 gün)

### Başarı Oranı
- **Hedef**: %99.9 uptime
- **Monitor**: Log dosyası üzerinden takip
- **Alert**: Cron job hatalarında log'a kayıt

## 🔄 Bakım

### Aylık Kontrol
```bash
# Yedek sayısını kontrol et
find /var/backups/smartqr/ -name "*.gz" | wc -l

# Disk kullanımını kontrol et
du -sh /var/backups/smartqr/

# Son yedeği kontrol et
ls -la /var/backups/smartqr/ | tail -1
```

### Yıllık Bakım
- Log dosyasını arşivle
- Yedek retention süresini gözden geçir
- Disk alanını kontrol et

---

**🎯 SmartQR Database Yedekleme Sistemi - Production Ready!**
