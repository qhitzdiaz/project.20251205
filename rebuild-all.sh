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

# Step 1: Stop all containers
echo -e "${YELLOW}[1/8] Stopping all containers...${NC}"
cd "$FRONTEND_DIR" && docker compose down 2>/dev/null || true
cd "$REVERSE_PROXY_DIR" && docker compose down 2>/dev/null || true
cd "$BACKEND_DIR" && docker compose down 2>/dev/null || true
echo -e "${GREEN}✓ All containers stopped${NC}"
echo ""

# Step 2: Clean up unused containers and images
echo -e "${YELLOW}[2/8] Cleaning up Docker...${NC}"
docker container prune -f
docker image prune -f
echo -e "${GREEN}✓ Docker cleanup complete${NC}"
echo ""

# Step 3: Rebuild backend services (core only: auth, media, cloud)
echo -e "${YELLOW}[3/8] Rebuilding backend services...${NC}"
cd "$BACKEND_DIR"
docker compose up -d --build backend-api backend-media backend-cloud
echo -e "${GREEN}✓ Backend services rebuilt and started${NC}"
echo ""

# Step 4: Start Supply Chain backend (separate stack)
if [ -d "$SCRIPT_DIR/supply-chain/backend" ]; then
  echo -e "${YELLOW}[4/8] Starting Supply Chain backend...${NC}"
  cd "$SCRIPT_DIR/supply-chain/backend"
  docker compose up -d --build
  echo -e "${GREEN}✓ Supply Chain API started (port 5060)${NC}"
  echo ""
else
  echo -e "${YELLOW}[4/8] Skipping Supply Chain backend (directory not found)${NC}"
  echo ""
fi

# Step 5: Start Property Management backend (separate stack)
if [ -d "$SCRIPT_DIR/property-management/backend" ]; then
  echo -e "${YELLOW}[5/8] Starting Property Management backend...${NC}"
  cd "$SCRIPT_DIR/property-management/backend"
  docker compose up -d --build
  echo -e "${GREEN}✓ Property API started (port 5050)${NC}"
  echo ""
else
  echo -e "${YELLOW}[5/8] Skipping Property backend (directory not found)${NC}"
  echo ""
fi

# Step 6: Wait for databases to be healthy
echo -e "${YELLOW}[6/8] Waiting for databases to be healthy...${NC}"
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

# Step 7: Rebuild frontend
echo -e "${YELLOW}[7/8] Rebuilding frontend application...${NC}"
cd "$FRONTEND_DIR"
docker compose up -d --build
sleep 3
echo -e "${GREEN}✓ Frontend rebuilt and started${NC}"
echo ""

# Step 8: Copy frontend build and start reverse proxy
echo -e "${YELLOW}[8/8] Setting up reverse proxy...${NC}"
docker cp qhitz-frontend:/usr/share/nginx/html/. "$FRONTEND_DIR/build/"
cd "$REVERSE_PROXY_DIR"
docker compose up -d
echo -e "${GREEN}✓ Reverse proxy started${NC}"
echo ""

# Sync Capacitor for mobile app
echo -e "${YELLOW}[Extra] Syncing Capacitor for mobile app...${NC}"
cd "$FRONTEND_DIR"
npx cap sync android
echo -e "${GREEN}✓ Capacitor synced${NC}"
echo ""

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

if curl -s http://localhost:5060/health > /dev/null; then
    echo -e "${GREEN}✓ Supply Chain API (5060) - Healthy${NC}"
else
    echo -e "${RED}✗ Supply Chain API (5060) - Not responding${NC}"
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
echo -e "${GREEN}All systems operational! 🚀${NC}"
