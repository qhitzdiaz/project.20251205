#!/bin/bash

# Qhitz Inc - Quick Rebuild Script (No cleanup)
# This script quickly rebuilds services without stopping everything or cleaning up

set -e  # Exit on any error

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$SCRIPT_DIR/frontend"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Qhitz Inc - Quick Rebuild${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Rebuild frontend only
echo -e "${YELLOW}[1/3] Rebuilding frontend...${NC}"
cd "$FRONTEND_DIR"
docker compose up -d --build
sleep 3
echo -e "${GREEN}✓ Frontend rebuilt${NC}"
echo ""

# Copy build to reverse proxy
echo -e "${YELLOW}[2/3] Updating reverse proxy...${NC}"
docker cp qhitz-frontend:/usr/share/nginx/html/. "$FRONTEND_DIR/build/"
cd "$SCRIPT_DIR/reverse-proxy"
docker compose restart
echo -e "${GREEN}✓ Reverse proxy updated${NC}"
echo ""

# Sync Capacitor
echo -e "${YELLOW}[3/3] Syncing mobile app...${NC}"
cd "$FRONTEND_DIR"
npx cap sync android
echo -e "${GREEN}✓ Mobile app synced${NC}"
echo ""

echo -e "${GREEN}✓ Quick rebuild complete! 🚀${NC}"
echo ""
echo -e "${YELLOW}Access at:${NC}"
LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)
echo "  http://localhost or http://$LOCAL_IP"
