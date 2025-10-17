#!/bin/bash

# Configuration
timestamp=$(date +%Y%m%d_%H%M%S)
backup_dir="/var/backups/bharatiyanews"
db_path="/var/www/bharatiyanews.com/database/dev.db"
backup_log="$backup_dir/backup.log"

# Ensure backup directory exists
mkdir -p "$backup_dir"

# Check if database exists
if [ ! -f "$db_path" ]; then
    echo "Error: Database file not found at $db_path" | tee -a "$backup_log"
    exit 1
fi

# Create backup
cp "$db_path" "$backup_dir/dev_$timestamp.db"
if [ $? -eq 0 ]; then
    echo "Backup created successfully at $backup_dir/dev_$timestamp.db" | tee -a "$backup_log"
else
    echo "Error: Failed to create backup" | tee -a "$backup_log"
    exit 1
fi

# Set permissions
chmod 644 "$backup_dir/dev_$timestamp.db"

# Upload to Google Drive (if rclone is configured)
if command -v rclone &> /dev/null; then
    echo "Uploading to Google Drive..." | tee -a "$backup_log"
    rclone copy "$backup_dir/dev_$timestamp.db" gdrive:bharatiyanews_backups/ 2>&1 | tee -a "$backup_log"
fi

# Keep only last 7 days of local backups
find "$backup_dir" -type f -mtime +7 -name '*.db' -delete

# Keep only last 30 days of Google Drive backups (if rclone is configured)
if command -v rclone &> /dev/null; then
    rclone delete gdrive:bharatiyanews_backups/ --min-age 30d
fi

echo "Backup completed at $timestamp" | tee -a "$backup_log"

# Report backup status
echo "Recent backups:"
ls -lh "$backup_dir"/*.db 2>/dev/null || echo "No local backups found"
