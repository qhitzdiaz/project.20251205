#!/bin/bash

# Qhitz Inc., - Complete Rebuild Script
# This script rebuilds all backend services, frontend, reverse proxy, and syncs the mobile app
#
# Usage:
#   ./rebuild-all.sh           # Full rebuild with backup and restore
#   ./rebuild-all.sh --quick   # Quick rebuild (skip backups, faster)
#   ./rebuild-all.sh --no-prune # Rebuild without pruning volumes
#   ./rebuild-all.sh --help    # Show help

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Parse command line arguments
QUICK_MODE=false
SKIP_BACKUP=false
SKIP_PRUNE=false

show_help() {
    echo -e "${CYAN}Qhitz Inc., Complete Rebuild Script${NC}"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --quick       Quick rebuild (skip backups and volume pruning)"
    echo "  --no-backup   Skip database backups (faster, but risky)"
    echo "  --no-prune    Skip volume pruning (keeps existing data)"
    echo "  --help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                # Full rebuild with backup and restore"
    echo "  $0 --quick        # Quick rebuild for development"
    echo "  $0 --no-prune     # Rebuild but keep existing volumes"
    exit 0
}

while [[ $# -gt 0 ]]; do
    case $1 in
        --quick)
            QUICK_MODE=true
            SKIP_BACKUP=true
            SKIP_PRUNE=true
            shift
            ;;
        --no-backup)
            SKIP_BACKUP=true
            shift
            ;;
        --no-prune)
            SKIP_PRUNE=true
            shift
            ;;
        --help|-h)
            show_help
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"
FRONTEND_DIR="$SCRIPT_DIR/frontend"
REVERSE_PROXY_DIR="$SCRIPT_DIR/reverse-proxy"

echo -e "${BLUE}========================================${NC}"
if [ "$QUICK_MODE" = true ]; then
    echo -e "${CYAN}  Qhitz Inc., - Quick Rebuild Mode${NC}"
else
    echo -e "${BLUE}  Qhitz Inc., - Complete Rebuild Script${NC}"
fi
echo -e "${BLUE}========================================${NC}"
echo ""

if [ "$QUICK_MODE" = true ]; then
    echo -e "${YELLOW}⚡ Quick Mode: Skipping backups and volume pruning${NC}"
    echo ""
fi

# Create backup directory
BACKUP_DIR="$SCRIPT_DIR/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_PATH="$BACKUP_DIR/$TIMESTAMP"

if [ "$SKIP_BACKUP" = false ]; then
    mkdir -p "$BACKUP_PATH"
fi

# Step 1: Export all database data
if [ "$SKIP_BACKUP" = false ]; then
    echo -e "${YELLOW}[1/8] Exporting database data...${NC}"
else
    echo -e "${YELLOW}[1/8] Skipping database backup (--quick or --no-backup mode)${NC}"
fi

# Function to export PostgreSQL database
export_postgres_db() {
    local container_name=$1
    local db_name=$2
    local db_user=$3
    local backup_file=$4

    if docker ps --filter "name=$container_name" --format "{{.Names}}" | grep -q "$container_name"; then
        echo "  Exporting $db_name from $container_name..."
        docker exec "$container_name" pg_dump -U "$db_user" "$db_name" > "$backup_file" 2>/dev/null || {
            echo -e "${RED}  ⚠️  Warning: Failed to export $db_name${NC}"
            return 1
        }
        echo -e "${GREEN}  ✓ Exported $db_name ($(du -h "$backup_file" | cut -f1))${NC}"
    else
        echo "  Skipping $container_name (not running)"
    fi
}

if [ "$SKIP_BACKUP" = false ]; then
    # Export core databases
    export_postgres_db "qhitz-postgres-auth" "auth_db" "qhitz_user" "$BACKUP_PATH/auth_db.sql"
    export_postgres_db "qhitz-postgres-media" "media_db" "qhitz_user" "$BACKUP_PATH/media_db.sql"
    export_postgres_db "qhitz-postgres-cloud" "cloud_db" "qhitz_user" "$BACKUP_PATH/cloud_db.sql"

    # Export Supply Chain database
    export_postgres_db "qhitz-postgres-supply" "supply_chain_db" "supply_user" "$BACKUP_PATH/supply_chain_db.sql"

    # Export Property Management database
    export_postgres_db "qhitz-postgres-property" "property_db" "property_user" "$BACKUP_PATH/property_db.sql"

    # Export Serbisyo24x7 database
    export_postgres_db "qhitz-postgres-serbisyo" "serbisyo_db" "serbisyo_user" "$BACKUP_PATH/serbisyo_db.sql"
fi

if [ "$SKIP_BACKUP" = false ]; then
    # Backup media uploads and cloud storage volumes
    if docker volume ls | grep -q "qhitz-media-uploads"; then
        echo "  Backing up media uploads..."
        docker run --rm -v qhitz-media-uploads:/data -v "$BACKUP_PATH":/backup alpine tar czf /backup/media-uploads.tar.gz -C /data . 2>/dev/null && \
            echo -e "${GREEN}  ✓ Backed up media uploads${NC}" || \
            echo -e "${YELLOW}  ⚠️  Warning: Failed to backup media uploads${NC}"
    fi

    if docker volume ls | grep -q "qhitz-cloud-storage"; then
        echo "  Backing up cloud storage..."
        docker run --rm -v qhitz-cloud-storage:/data -v "$BACKUP_PATH":/backup alpine tar czf /backup/cloud-storage.tar.gz -C /data . 2>/dev/null && \
            echo -e "${GREEN}  ✓ Backed up cloud storage${NC}" || \
            echo -e "${YELLOW}  ⚠️  Warning: Failed to backup cloud storage${NC}"
    fi

    echo -e "${GREEN}✓ Database export complete${NC}"
    echo -e "${BLUE}  Backup location: $BACKUP_PATH${NC}"
fi
echo ""

# Step 2: Stop all containers
echo -e "${YELLOW}[2/8] Stopping all containers...${NC}"
cd "$SCRIPT_DIR" && docker compose down --remove-orphans 2>/dev/null || true

# Clean up any remaining qhitz containers that might be orphaned
echo "  Cleaning up any orphaned qhitz containers..."
docker ps -a --filter "name=qhitz-" --format "{{.Names}}" | xargs -r docker rm -f 2>/dev/null || true

echo -e "${GREEN}✓ All containers stopped${NC}"
echo ""

# Step 3: Clean up Docker (now safe with backups)
echo -e "${YELLOW}[3/8] Cleaning up Docker resources...${NC}"
docker container prune -f
docker image prune -f

if [ "$SKIP_PRUNE" = false ]; then
    echo -e "${YELLOW}⚠️  Pruning volumes (data will be restored from backup)...${NC}"
    docker volume prune -f
else
    echo -e "${CYAN}  Keeping existing volumes (--no-prune mode)${NC}"
fi

echo -e "${GREEN}✓ Docker cleanup complete${NC}"
echo ""

# Step 4: Rebuild backend services (core + property + supply + serbisyo)
echo -e "${YELLOW}[4/8] Rebuilding backend services...${NC}"
cd "$SCRIPT_DIR"
# Start databases first, then API services
docker compose up -d --build postgres-auth postgres-media postgres-cloud postgres-property postgres-supply postgres-serbisyo
docker compose up -d --build backend-api backend-media backend-cloud backend-property backend-supply backend-serbisyo
echo -e "${GREEN}✓ Backend services rebuilt and started${NC}"
echo ""

# Step 5: Wait for databases to be healthy
echo -e "${YELLOW}[5/8] Waiting for databases to be healthy...${NC}"
sleep 5
for i in {1..30}; do
    if docker ps --filter "name=qhitz-postgres" --filter "health=healthy" | grep -q "healthy"; then
        echo -e "${GREEN}✓ Databases are healthy${NC}"
        break
    fi
    echo -n "."
    sleep 2
done
echo ""

# Step 6: Import database data from backup
echo -e "${YELLOW}[6/8] Importing database data from backup...${NC}"

# Function to check if database is empty
is_db_empty() {
    local container_name=$1
    local db_name=$2
    local db_user=$3

    local table_count=$(docker exec "$container_name" psql -U "$db_user" "$db_name" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | tr -d ' ')

    if [ -z "$table_count" ] || [ "$table_count" -eq "0" ]; then
        return 0  # Empty
    else
        return 1  # Not empty
    fi
}

# Function to find the latest backup
find_latest_backup() {
    local db_filename=$1

    # Find the most recent backup directory with this file
    find "$BACKUP_DIR" -name "$db_filename" -type f ! -size 0 | sort -r | head -1
}

# Function to import PostgreSQL database
import_postgres_db() {
    local container_name=$1
    local db_name=$2
    local db_user=$3
    local backup_file=$4
    local db_filename=$(basename "$backup_file")

    # Only import when the database is empty to avoid duplicate constraint errors
    if ! is_db_empty "$container_name" "$db_name" "$db_user"; then
        echo -e "${CYAN}  Skipping import for $db_name (database already has tables)${NC}"
        return
    fi

    # First, try to import from current backup
    if [ -f "$backup_file" ] && [ -s "$backup_file" ]; then
        echo "  Importing $db_name from current backup..."
        docker exec -i "$container_name" psql -U "$db_user" "$db_name" < "$backup_file" 2>/dev/null && \
            echo -e "${GREEN}  ✓ Imported $db_name${NC}" || \
            echo -e "${YELLOW}  ⚠️  Warning: Failed to import $db_name from current backup${NC}"
    else
        echo -e "${YELLOW}  No current backup for $db_name${NC}"
    fi

    # If still empty, try the most recent prior backup
    if is_db_empty "$container_name" "$db_name" "$db_user"; then
        echo -e "${YELLOW}  Database $db_name is empty, searching for latest backup...${NC}"

        local latest_backup=$(find_latest_backup "$db_filename")

        if [ -n "$latest_backup" ] && [ -f "$latest_backup" ]; then
            echo "  Found backup: $latest_backup"
            echo "  Importing $db_name from latest backup..."
            docker exec -i "$container_name" psql -U "$db_user" "$db_name" < "$latest_backup" 2>/dev/null && \
                echo -e "${GREEN}  ✓ Imported $db_name from latest backup${NC}" || \
                echo -e "${RED}  ✗ Failed to import $db_name from latest backup${NC}"
        else
            echo -e "${YELLOW}  ⚠️  No previous backups found for $db_name${NC}"
        fi
    fi
}

# Import core databases
import_postgres_db "qhitz-postgres-auth" "auth_db" "qhitz_user" "$BACKUP_PATH/auth_db.sql"
import_postgres_db "qhitz-postgres-media" "media_db" "qhitz_user" "$BACKUP_PATH/media_db.sql"
import_postgres_db "qhitz-postgres-cloud" "cloud_db" "qhitz_user" "$BACKUP_PATH/cloud_db.sql"

# Import Supply Chain database
import_postgres_db "qhitz-postgres-supply" "supply_chain_db" "supply_user" "$BACKUP_PATH/supply_chain_db.sql"

# Import Property Management database
import_postgres_db "qhitz-postgres-property" "property_db" "property_user" "$BACKUP_PATH/property_db.sql"

# Import Serbisyo24x7 database
import_postgres_db "qhitz-postgres-serbisyo" "serbisyo_db" "serbisyo_user" "$BACKUP_PATH/serbisyo_db.sql"

# Restore media uploads and cloud storage volumes
restore_volume() {
    local volume_name=$1
    local backup_filename=$2
    local current_backup="$BACKUP_PATH/$backup_filename"

    # Try current backup first
    if [ -f "$current_backup" ]; then
        echo "  Restoring $volume_name from current backup..."
        docker run --rm -v "$volume_name":/data -v "$BACKUP_PATH":/backup alpine tar xzf "/backup/$backup_filename" -C /data 2>/dev/null && \
            echo -e "${GREEN}  ✓ Restored $volume_name${NC}" && return 0
    fi

    # If failed or no current backup, find latest backup
    echo -e "${YELLOW}  Searching for latest backup of $volume_name...${NC}"
    local latest_backup=$(find "$BACKUP_DIR" -name "$backup_filename" -type f ! -size 0 | sort -r | head -1)

    if [ -n "$latest_backup" ] && [ -f "$latest_backup" ]; then
        local latest_dir=$(dirname "$latest_backup")
        echo "  Found backup: $latest_backup"
        docker run --rm -v "$volume_name":/data -v "$latest_dir":/backup alpine tar xzf "/backup/$backup_filename" -C /data 2>/dev/null && \
            echo -e "${GREEN}  ✓ Restored $volume_name from latest backup${NC}" || \
            echo -e "${YELLOW}  ⚠️  Warning: Failed to restore $volume_name${NC}"
    else
        echo -e "${YELLOW}  ⚠️  No backups found for $volume_name${NC}"
    fi
}

restore_volume "qhitz-media-uploads" "media-uploads.tar.gz"
restore_volume "qhitz-cloud-storage" "cloud-storage.tar.gz"

echo -e "${GREEN}✓ Database import complete${NC}"
echo ""

# Step 7: Rebuild frontend
echo -e "${YELLOW}[7/8] Rebuilding frontend application...${NC}"
cd "$SCRIPT_DIR"
docker compose up -d --build frontend
sleep 3
echo -e "${GREEN}✓ Frontend rebuilt and started${NC}"
echo ""

# Step 8: Copy frontend build and start reverse proxy
echo -e "${YELLOW}[8/8] Setting up reverse proxy...${NC}"
docker cp qhitz-frontend:/usr/share/nginx/html/. "$FRONTEND_DIR/build/"
cd "$SCRIPT_DIR"
docker compose up -d reverse-proxy
echo -e "${GREEN}✓ Reverse proxy started${NC}"
echo ""

# Sync Capacitor for mobile app
echo -e "${YELLOW}[Extra] Syncing Capacitor for mobile app...${NC}"
cd "$FRONTEND_DIR"
npx cap sync android
echo -e "${GREEN}✓ Capacitor synced${NC}"
echo ""

# Build and deploy mobile binaries to emulators/simulators
MOBILE_SCRIPT="$SCRIPT_DIR/scripts/build-android-ios-sim.sh"
if [ -x "$MOBILE_SCRIPT" ]; then
  echo -e "${YELLOW}[Extra] Building & installing mobile apps to simulators...${NC}"
  # Default to iPad simulator; override with SIM_DEVICE/ANDROID_AVD env vars as needed.
  SIM_DEVICE="${SIM_DEVICE:-iPad Pro 11-inch (M5)}" \
  ANDROID_AVD="${ANDROID_AVD:-}" \
  "$MOBILE_SCRIPT" || echo -e "${YELLOW}⚠️ Mobile build/install step encountered an issue; check logs above.${NC}"
  echo ""
fi

# Display status
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}  ✓ Rebuild Complete!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check all services
echo -e "${YELLOW}Checking service health...${NC}"
sleep 2

# Test backend APIs
if curl -s http://localhost:5010/api/health > /dev/null; then
    echo -e "${GREEN}✓ Auth API (5010) - Healthy${NC}"
else
    echo -e "${RED}✗ Auth API (5010) - Not responding${NC}"
fi

if curl -s http://localhost:5011/api/health > /dev/null; then
    echo -e "${GREEN}✓ Media API (5011) - Healthy${NC}"
else
    echo -e "${RED}✗ Media API (5011) - Not responding${NC}"
fi

if curl -s http://localhost:5012/api/health > /dev/null; then
    echo -e "${GREEN}✓ Cloud API (5012) - Healthy${NC}"
else
    echo -e "${RED}✗ Cloud API (5012) - Not responding${NC}"
fi

if curl -s http://localhost:5070/health > /dev/null; then
    echo -e "${GREEN}✓ Supply Chain API (5070) - Healthy${NC}"
else
    echo -e "${RED}✗ Supply Chain API (5070) - Not responding${NC}"
fi

if curl -s http://localhost:5050/health > /dev/null; then
    echo -e "${GREEN}✓ Property API (5050) - Healthy${NC}"
else
    echo -e "${RED}✗ Property API (5050) - Not responding${NC}"
fi

if curl -s http://localhost:5080/health > /dev/null; then
    echo -e "${GREEN}✓ Serbisyo24x7 API (5080) - Healthy${NC}"
else
    echo -e "${RED}✗ Serbisyo24x7 API (5080) - Not responding${NC}"
fi

# Test frontend
if curl -s http://localhost:3000 > /dev/null; then
    echo -e "${GREEN}✓ Frontend (3000) - Running${NC}"
else
    echo -e "${RED}✗ Frontend (3000) - Not responding${NC}"
fi

if curl -s http://localhost > /dev/null; then
    echo -e "${GREEN}✓ Reverse Proxy (80) - Running${NC}"
else
    echo -e "${RED}✗ Reverse Proxy (80) - Not responding${NC}"
fi

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Access Information${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}Web (Computer):${NC}"
echo "  http://localhost"
echo "  http://localhost:3000"
echo ""
echo -e "${GREEN}Homelab Network:${NC}"
LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)
echo "  http://$LOCAL_IP"
echo "  http://$LOCAL_IP:3000"
echo ""
echo -e "${GREEN}Mobile App:${NC}"
echo "  Configured to connect to: http://$LOCAL_IP:3000"
echo "  APK location: frontend/android/app/build/outputs/apk/release/"
echo ""
echo -e "${YELLOW}To build Android APK, run:${NC}"
echo "  cd frontend/android"
echo "  export JAVA_HOME=/opt/homebrew/opt/openjdk@21"
echo "  ./gradlew assembleRelease"
echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Backup Information${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}Latest backup:${NC}"
echo "  $BACKUP_PATH"
echo ""

# Clean up old backups (keep only 10 most recent)
if [ "$SKIP_BACKUP" = false ]; then
    echo -e "${YELLOW}Cleaning up old backups (keeping 10 most recent)...${NC}"
    BACKUP_COUNT=$(ls -1d "$BACKUP_DIR"/*/ 2>/dev/null | wc -l | tr -d ' ')
    if [ "$BACKUP_COUNT" -gt 10 ]; then
        OLD_BACKUPS=$(ls -1td "$BACKUP_DIR"/*/ | tail -n +11)
        if [ -n "$OLD_BACKUPS" ]; then
            echo "$OLD_BACKUPS" | while read backup_path; do
                echo "  Removing old backup: $(basename "$backup_path")"
                rm -rf "$backup_path"
            done
            REMOVED_COUNT=$((BACKUP_COUNT - 10))
            echo -e "${GREEN}✓ Removed $REMOVED_COUNT old backup(s)${NC}"
        fi
    else
        echo "  No old backups to remove (total: $BACKUP_COUNT)"
    fi
    echo ""
fi

echo -e "${YELLOW}Note:${NC} Backups are stored in $BACKUP_DIR"
echo -e "${YELLOW}This rebuild includes full container, image, and volume pruning with automatic data restoration${NC}"
echo ""

# Service Statistics
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Service Statistics${NC}"
echo -e "${BLUE}========================================${NC}"

# Count running services
RUNNING_SERVICES=$(docker ps --filter "name=qhitz-" --format "{{.Names}}" | wc -l | tr -d ' ')
TOTAL_SERVICES=11  # auth, media, cloud, property, supply, serbisyo, frontend, proxy, + 6 databases

echo -e "${GREEN}Services Running:${NC} $RUNNING_SERVICES / $TOTAL_SERVICES"

# Show container resource usage
echo ""
echo -e "${CYAN}Resource Usage:${NC}"
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}" | grep "qhitz-" | head -5

echo ""
echo -e "${CYAN}Database Sizes:${NC}"
for container in qhitz-postgres-auth qhitz-postgres-media qhitz-postgres-cloud qhitz-postgres-property qhitz-postgres-supply qhitz-postgres-serbisyo; do
    if docker ps --filter "name=$container" --format "{{.Names}}" | grep -q "$container"; then
        DB_NAME=$(docker exec "$container" printenv POSTGRES_DB 2>/dev/null || echo "")
        DB_USER=$(docker exec "$container" printenv POSTGRES_USER 2>/dev/null || echo "$(echo $container | sed 's/qhitz-postgres-//')_user")
        DB_NAME=${DB_NAME:-$DB_USER}
        DB_SIZE=$(docker exec "$container" psql -U "$DB_USER" -d "$DB_NAME" -c "SELECT pg_size_pretty(pg_database_size(current_database()));" 2>/dev/null | sed -n '3p' | tr -d ' ' || echo "N/A")
        echo "  $container: $DB_SIZE"
    fi
done

echo ""
echo -e "${GREEN}All systems operational! 🚀${NC}"
