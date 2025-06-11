#!/bin/bash

# PerfMirror Database Backup and Restore Utility
# This script helps backup and restore your performance tracking data

set -e

function show_help() {
    echo "PerfMirror Database Backup and Restore Utility"
    echo "=============================================="
    echo ""
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  backup-local     Create backup of local database"
    echo "  backup-docker    Create backup of Docker volume data"
    echo "  restore-local    Restore local database from backup"
    echo "  restore-docker   Restore Docker volume from backup"
    echo "  list-backups     List available backups"
    echo "  migrate-data     Migrate data from local to Docker or vice versa"
    echo ""
    echo "Options:"
    echo "  --file FILENAME  Specify backup file (for restore operations)"
    echo "  --help           Show this help"
    echo ""
    echo "Examples:"
    echo "  $0 backup-local"
    echo "  $0 restore-local --file backup-20241211_143000.db"
    echo "  $0 backup-docker"
    echo "  $0 migrate-data"
}

function backup_local() {
    echo "💾 Creating local database backup..."
    
    if [ -f "prisma/dev.db" ]; then
        backup_file="backup-local-$(date +%Y%m%d_%H%M%S).db"
        cp prisma/dev.db "$backup_file"
        echo "✅ Local backup created: $backup_file"
        echo "📊 File size: $(du -h "$backup_file" | cut -f1)"
    else
        echo "❌ No local database file found at prisma/dev.db"
        exit 1
    fi
}

function backup_docker() {
    echo "💾 Creating Docker volume backup..."
    
    # Check if Docker volume exists
    if ! docker volume ls | grep -q "perf_mirror_data"; then
        echo "❌ Docker volume 'perf_mirror_data' not found"
        echo "💡 Start the application with Docker first: make docker-deploy"
        exit 1
    fi
    
    mkdir -p backups
    backup_file="backups/perf-mirror-docker-$(date +%Y%m%d_%H%M%S).tar.gz"
    
    docker run --rm \
        -v perf_mirror_data:/data:ro \
        -v "$(pwd)/backups:/backup" \
        alpine tar czf "/backup/$(basename "$backup_file")" -C /data .
    
    echo "✅ Docker volume backup created: $backup_file"
    echo "📊 File size: $(du -h "$backup_file" | cut -f1)"
}

function list_backups() {
    echo "📋 Available backups:"
    echo "===================="
    
    # Local backups
    echo ""
    echo "🏠 Local database backups:"
    ls -la backup-local-*.db 2>/dev/null | awk '{print "  " $9 " (" $5 " bytes, " $6 " " $7 " " $8 ")"}' || echo "  No local backups found"
    
    # Docker backups
    echo ""
    echo "🐳 Docker volume backups:"
    if [ -d "backups" ]; then
        ls -la backups/perf-mirror-docker-*.tar.gz 2>/dev/null | awk '{print "  " $9 " (" $5 " bytes, " $6 " " $7 " " $8 ")"}' || echo "  No Docker backups found"
    else
        echo "  No backups directory found"
    fi
}

function restore_local() {
    if [ -z "$backup_file" ]; then
        echo "❌ Please specify a backup file with --file"
        echo "Example: $0 restore-local --file backup-local-20241211_143000.db"
        exit 1
    fi
    
    if [ ! -f "$backup_file" ]; then
        echo "❌ Backup file '$backup_file' not found"
        exit 1
    fi
    
    echo "🔄 Restoring local database from $backup_file..."
    
    # Backup current database if it exists
    if [ -f "prisma/dev.db" ]; then
        current_backup="prisma/dev.db.backup-$(date +%Y%m%d_%H%M%S)"
        cp prisma/dev.db "$current_backup"
        echo "📋 Current database backed up to: $current_backup"
    fi
    
    # Restore from backup
    cp "$backup_file" prisma/dev.db
    echo "✅ Database restored from $backup_file"
}

function restore_docker() {
    if [ -z "$backup_file" ]; then
        echo "❌ Please specify a backup file with --file"
        echo "Example: $0 restore-docker --file backups/perf-mirror-docker-20241211_143000.tar.gz"
        exit 1
    fi
    
    if [ ! -f "$backup_file" ]; then
        echo "❌ Backup file '$backup_file' not found"
        exit 1
    fi
    
    echo "🔄 Restoring Docker volume from $backup_file..."
    
    # Stop containers first
    echo "🛑 Stopping containers..."
    docker-compose down 2>/dev/null || true
    
    # Create volume if it doesn't exist
    docker volume create perf_mirror_data >/dev/null 2>&1 || true
    
    # Restore data
    docker run --rm \
        -v perf_mirror_data:/data \
        -v "$(pwd):/backup" \
        alpine sh -c "cd /data && tar xzf /backup/$backup_file"
    
    echo "✅ Docker volume restored from $backup_file"
    echo "🚀 Start the application: make docker-deploy"
}

function migrate_data() {
    echo "🔄 Data Migration Utility"
    echo "========================"
    echo ""
    echo "Choose migration direction:"
    echo "1) Local → Docker (copy local database to Docker volume)"
    echo "2) Docker → Local (copy Docker volume to local database)"
    echo ""
    read -p "Enter choice (1 or 2): " choice
    
    case $choice in
        1)
            echo "📦 Migrating local database to Docker volume..."
            if [ ! -f "prisma/dev.db" ]; then
                echo "❌ No local database found at prisma/dev.db"
                exit 1
            fi
            
            # Create volume if it doesn't exist
            docker volume create perf_mirror_data >/dev/null 2>&1 || true
            
            # Copy local db to Docker volume
            docker run --rm \
                -v "$(pwd)/prisma:/source:ro" \
                -v perf_mirror_data:/data \
                alpine cp /source/dev.db /data/dev.db
            
            echo "✅ Local database migrated to Docker volume"
            ;;
        2)
            echo "📦 Migrating Docker volume to local database..."
            if ! docker volume ls | grep -q "perf_mirror_data"; then
                echo "❌ Docker volume 'perf_mirror_data' not found"
                exit 1
            fi
            
            # Backup current local db if exists
            if [ -f "prisma/dev.db" ]; then
                backup_file="prisma/dev.db.backup-$(date +%Y%m%d_%H%M%S)"
                cp prisma/dev.db "$backup_file"
                echo "📋 Current local database backed up to: $backup_file"
            fi
            
            # Copy from Docker volume to local
            docker run --rm \
                -v perf_mirror_data:/source:ro \
                -v "$(pwd)/prisma:/data" \
                alpine cp /source/dev.db /data/dev.db
            
            echo "✅ Docker volume migrated to local database"
            ;;
        *)
            echo "❌ Invalid choice"
            exit 1
            ;;
    esac
}

# Parse command line arguments
backup_file=""
command=""

while [[ $# -gt 0 ]]; do
    case $1 in
        backup-local|backup-docker|restore-local|restore-docker|list-backups|migrate-data)
            command="$1"
            shift
            ;;
        --file)
            backup_file="$2"
            shift 2
            ;;
        --help)
            show_help
            exit 0
            ;;
        *)
            echo "❌ Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Execute command
case $command in
    backup-local)
        backup_local
        ;;
    backup-docker)
        backup_docker
        ;;
    restore-local)
        restore_local
        ;;
    restore-docker)
        restore_docker
        ;;
    list-backups)
        list_backups
        ;;
    migrate-data)
        migrate_data
        ;;
    "")
        echo "❌ No command specified"
        show_help
        exit 1
        ;;
esac 