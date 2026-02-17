#!/bin/bash

# SmartQR Backup Cron Job Kurulum Script'i

# Script'in yolu
SCRIPT_PATH="/Users/gece/Project/SmartQR/backend/scripts/backup-database.sh"
LOG_FILE="/var/log/smartqr-backup.log"

# Log dizinini oluştur
sudo mkdir -p /var/log
sudo touch $LOG_FILE
sudo chmod 666 $LOG_FILE

# Cron job'u ekle
echo "SmartQR database backup cron job kuruluyor..."

# Mevcut crontab'ı al
crontab -l > /tmp/crontab_backup.txt 2>/dev/null || touch /tmp/crontab_backup.txt

# Yeni cron job'u ekle (her gün saat 03:00)
if ! grep -q "backup-database.sh" /tmp/crontab_backup.txt; then
    echo "# SmartQR Database Backup - Her gün 03:00'te" >> /tmp/crontab_backup.txt
    echo "0 3 * * * $SCRIPT_PATH >> /var/log/smartqr-backup.log 2>&1" >> /tmp/crontab_backup.txt
    echo "" >> /tmp/crontab_backup.txt
    
    # Cron job'u yükle
    crontab /tmp/crontab_backup.txt
    
    echo "✅ Cron job başarıyla kuruldu!"
    echo "📅 Çalışma zamanı: Her gün saat 03:00"
    echo "📁 Log dosyası: $LOG_FILE"
else
    echo "⚠️ Cron job zaten mevcut!"
fi

# Geçici dosyayı temizle
rm /tmp/crontab_backup.txt

echo "🎉 Kurulum tamamlandı!"
