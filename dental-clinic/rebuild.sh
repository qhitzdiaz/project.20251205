#!/bin/bash

# Rebuild script for Compleat Smile Dental Clinic
# This script stops, rebuilds, and restarts all Docker containers

set -e

echo "🦷 Compleat Smile Dental Clinic - Rebuild Script"
echo "================================================"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Stop all running containers
echo -e "${YELLOW}Stopping all containers...${NC}"
docker compose down

# Remove old images (optional - uncomment if you want to force full rebuild)
# echo -e "${YELLOW}Removing old images...${NC}"
# docker compose down --rmi all

# Rebuild all services
echo -e "${YELLOW}Rebuilding all services...${NC}"
docker compose build --no-cache

# Start all services
echo -e "${YELLOW}Starting all services...${NC}"
docker compose up -d

# Wait for services to be healthy
echo -e "${YELLOW}Waiting for services to be healthy...${NC}"
sleep 10

# Check status
echo -e "${GREEN}Container Status:${NC}"
docker compose ps

echo ""
echo -e "${GREEN}✅ Rebuild complete!${NC}"
echo ""
echo "Services are available at:"
echo "  - Frontend: http://localhost:3001"
echo "  - Nginx Proxy: http://localhost:8081"
echo "  - Backend API: http://localhost:5015"
echo "  - Database: localhost:5440"
echo ""
echo "To view logs: docker compose logs -f"
echo "To stop: docker compose down"
