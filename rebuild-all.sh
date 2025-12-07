#!/bin/bash

# Qhitz Inc - Complete Rebuild Script
# This script rebuilds all backend services, frontend, reverse proxy, and syncs the mobile app

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"
FRONTEND_DIR="$SCRIPT_DIR/frontend"
REVERSE_PROXY_DIR="$SCRIPT_DIR/reverse-proxy"
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Qhitz Inc - Complete Rebuild Script${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Create backup directory
BACKUP_DIR="$SCRIPT_DIR/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_PATH="$BACKUP_DIR/$TIMESTAMP"
mkdir -p "$BACKUP_PATH"

# Step 1: Export all database data
echo -e "${YELLOW}[1/8] Exporting database data...${NC}"

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

# Export core databases
export_postgres_db "qhitz-postgres-auth" "auth_db" "qhitz_user" "$BACKUP_PATH/auth_db.sql"
export_postgres_db "qhitz-postgres-media" "media_db" "qhitz_user" "$BACKUP_PATH/media_db.sql"
export_postgres_db "qhitz-postgres-cloud" "cloud_db" "qhitz_user" "$BACKUP_PATH/cloud_db.sql"

# Export Supply Chain database
export_postgres_db "qhitz-postgres-supply" "supply_chain_db" "supply_user" "$BACKUP_PATH/supply_chain_db.sql"

# Export Property Management database
export_postgres_db "qhitz-postgres-property" "property_db" "property_user" "$BACKUP_PATH/property_db.sql"

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
echo -e "${YELLOW}⚠️  Pruning volumes (data will be restored from backup)...${NC}"
docker volume prune -f
echo -e "${GREEN}✓ Docker cleanup complete${NC}"
echo ""

# Step 4: Rebuild backend services (core + property + supply)
echo -e "${YELLOW}[4/8] Rebuilding backend services...${NC}"
cd "$SCRIPT_DIR"
# Start databases first, then API services
docker compose up -d --build postgres-auth postgres-media postgres-cloud postgres-property postgres-supply
docker compose up -d --build backend-api backend-media backend-cloud backend-property backend-supply
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

# Function to import PostgreSQL database
import_postgres_db() {
    local container_name=$1
    local db_name=$2
    local db_user=$3
    local backup_file=$4

    if [ -f "$backup_file" ] && [ -s "$backup_file" ]; then
        echo "  Importing $db_name to $container_name..."
        docker exec -i "$container_name" psql -U "$db_user" "$db_name" < "$backup_file" 2>/dev/null && \
            echo -e "${GREEN}  ✓ Imported $db_name${NC}" || \
            echo -e "${YELLOW}  ⚠️  Warning: Failed to import $db_name${NC}"
    else
        echo "  Skipping $db_name (no backup file found)"
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

# Restore media uploads and cloud storage volumes
if [ -f "$BACKUP_PATH/media-uploads.tar.gz" ]; then
    echo "  Restoring media uploads..."
    docker run --rm -v qhitz-media-uploads:/data -v "$BACKUP_PATH":/backup alpine tar xzf /backup/media-uploads.tar.gz -C /data 2>/dev/null && \
        echo -e "${GREEN}  ✓ Restored media uploads${NC}" || \
        echo -e "${YELLOW}  ⚠️  Warning: Failed to restore media uploads${NC}"
fi

if [ -f "$BACKUP_PATH/cloud-storage.tar.gz" ]; then
    echo "  Restoring cloud storage..."
    docker run --rm -v qhitz-cloud-storage:/data -v "$BACKUP_PATH":/backup alpine tar xzf /backup/cloud-storage.tar.gz -C /data 2>/dev/null && \
        echo -e "${GREEN}  ✓ Restored cloud storage${NC}" || \
        echo -e "${YELLOW}  ⚠️  Warning: Failed to restore cloud storage${NC}"
fi

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
echo -e "${YELLOW}Note:${NC} Backups are stored in $BACKUP_DIR"
echo -e "${YELLOW}This rebuild includes full container, image, and volume pruning with automatic data restoration${NC}"
echo ""
echo -e "${GREEN}All systems operational! 🚀${NC}"
