#!/bin/bash

# SmartQR Database Backup Script
# Her gün saat 03:00'te çalışır

# Konfigürasyon
DB_NAME="smartqr"
DB_USER="postgres"
DB_HOST="localhost"
DB_PORT="5432"
BACKUP_DIR="/var/backups/smartqr"
DATE=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_FILE="${BACKUP_DIR}/smartqr_backup_${DATE}.sql"
RETENTION_DAYS=30

# Log dosyası
LOG_FILE="/var/log/smartqr-backup.log"

# Backup dizinini oluştur
mkdir -p $BACKUP_DIR

# Log fonksiyonu
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> $LOG_FILE
}

# Başlangıç log'u
log "=== Database backup başlatılıyor ==="

# Database yedeğini al
log "Database yedeği alınıyor: $BACKUP_FILE"
if PGPASSWORD=$DB_PASSWORD pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME > $BACKUP_FILE 2>> $LOG_FILE; then
    log "✅ Database yedeği başarıyla oluşturuldu: $BACKUP_FILE"
    
    # Yedek dosyasını sıkıştır
    log "Yedek dosyası sıkıştırılıyor..."
    gzip $BACKUP_FILE
    BACKUP_FILE="${BACKUP_FILE}.gz"
    log "✅ Yedek dosyası sıkıştırıldı: $BACKUP_FILE"
    
    # Dosya boyutunu log'a ekle
    FILE_SIZE=$(du -h $BACKUP_FILE | cut -f1)
    log "📁 Yedek dosyası boyutu: $FILE_SIZE"
    
else
    log "❌ Database yedeği alınırken hata oluştu!"
    exit 1
fi

# Eski yedekleri temizle (30 gün)
log "Eski yedekler temizleniyor (son $RETENTION_DAYS gün)..."
find $BACKUP_DIR -name "smartqr_backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete
DELETED_COUNT=$(find $BACKUP_DIR -name "smartqr_backup_*.sql.gz" | wc -l)
log "🗑️ Temizleme tamamlandı. Mevcut yedek sayısı: $DELETED_COUNT"

# Bitiş log'u
log "=== Database backup tamamlandı ==="
echo "" >> $LOG_FILE

# Başarılı olduğunda çık
exit 0
