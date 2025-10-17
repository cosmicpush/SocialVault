#!/bin/bash

# Configuration
db_path="/var/www/bharatiyanews.com/database/dev.db"
backup_dir="/var/backups/bharatiyanews"
gdrive_path="gdrive:bharatiyanews_backups"
log_file="$backup_dir/restore.log"

# Function to log messages
log_message() {
    echo "$1"
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$log_file"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo "Options:"
    echo "  -l, --local FILENAME    Restore from local backup file"
    echo "  -r, --remote FILENAME   Restore from Google Drive backup file"
    echo "  -t, --time TIMESTAMP    Restore from backup with timestamp (format: YYYYMMDD_HHMMSS)"
    echo "  -L, --list             List available backups"
    echo "  -h, --help             Show this help message"
    echo
    echo "Examples:"
    echo "  $0 --list                          # List all available backups"
    echo "  $0 --local dev_20240323_143022.db  # Restore specific local backup"
    echo "  $0 --remote dev_20240323_143022.db # Restore specific remote backup"
    echo "  $0 --time 20240323_143022          # Restore using timestamp"
}

# Function to list available backups
list_backups() {
    echo "Local backups in $backup_dir:"
    if [ -d "$backup_dir" ]; then
        ls -lht "$backup_dir"/*.db 2>/dev/null || echo "No local backups found"
    else
        echo "No local backups found (directory doesn't exist)"
    fi
    echo
    echo "Remote backups in Google Drive:"
    if command -v rclone &> /dev/null; then
        rclone ls "$gdrive_path" 2>/dev/null | grep ".db$" || echo "No remote backups found"
    else
        echo "rclone not installed - cannot check remote backups"
    fi
}

# Function to check if database is in use
check_db_in_use() {
    if lsof "$db_path" >/dev/null 2>&1; then
        log_message "Error: Database is currently in use. Please stop any applications using the database first."
        exit 1
    fi
}

# Function to backup current database before restore
backup_current_db() {
    if [ -f "$db_path" ]; then
        local timestamp=$(date +%Y%m%d_%H%M%S)
        local pre_restore_backup="$backup_dir/pre_restore_${timestamp}.db"
        log_message "Creating backup of current database..."
        cp "$db_path" "$pre_restore_backup"
        log_message "Current database backed up to: $pre_restore_backup"
    else
        log_message "No current database to backup"
    fi
}

# Function to restore from local backup
restore_local() {
    local backup_file="$backup_dir/$1"
    if [ ! -f "$backup_file" ]; then
        log_message "Error: Backup file not found: $backup_file"
        exit 1
    fi
    
    check_db_in_use
    backup_current_db
    
    log_message "Restoring from local backup: $backup_file"
    cp "$backup_file" "$db_path"
    chmod 644 "$db_path"
    log_message "Restore completed successfully"
}

# Function to restore from remote backup
restore_remote() {
    local temp_file="$backup_dir/temp_restore_$1"
    log_message "Downloading backup from Google Drive..."
    if ! rclone copy "$gdrive_path/$1" "$backup_dir/"; then
        log_message "Error: Failed to download backup from Google Drive"
        exit 1
    fi
    
    check_db_in_use
    backup_current_db
    
    log_message "Restoring from downloaded backup..."
    cp "$backup_dir/$1" "$db_path"
    chmod 644 "$db_path"
    rm -f "$backup_dir/$1"
    log_message "Restore completed successfully"
}

# Create backup directory if it doesn't exist
mkdir -p "$backup_dir"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -l|--local)
            if [ -n "$2" ]; then
                restore_local "$2"
            else
                echo "Error: Backup filename required for local restore"
                show_usage
                exit 1
            fi
            shift 2
            ;;
        -r|--remote)
            if [ -n "$2" ]; then
                restore_remote "$2"
            else
                echo "Error: Backup filename required for remote restore"
                show_usage
                exit 1
            fi
            shift 2
            ;;
        -t|--time)
            if [ -n "$2" ]; then
                filename="dev_$2.db"
                if [ -f "$backup_dir/$filename" ]; then
                    restore_local "$filename"
                else
                    restore_remote "$filename"
                fi
            else
                echo "Error: Timestamp required"
                show_usage
                exit 1
            fi
            shift 2
            ;;
        -L|--list)
            list_backups
            exit 0
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        *)
            echo "Error: Invalid option $1"
            show_usage
            exit 1
            ;;
    esac
done

# If no arguments provided, show usage
if [ $# -eq 0 ]; then
    show_usage
    exit 1
fi