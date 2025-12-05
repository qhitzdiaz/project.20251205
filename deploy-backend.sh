#!/bin/bash
# Backend Deployment Script for 192.168.2.98
# Run this script on the backend server

set -e

echo "🚀 Backend Deployment Script"
echo "============================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_info() { echo "ℹ️  $1"; }

# Check if running on correct server
CURRENT_IP=$(hostname -I | awk '{print $1}')
print_info "Current server IP: $CURRENT_IP"

# Navigate to project directory
if [ ! -d "backend" ]; then
    print_error "backend directory not found. Please run this from the project root."
    exit 1
fi

cd backend

# Check prerequisites
print_info "Checking prerequisites..."

if ! command -v docker &> /dev/null; then
    print_error "Docker not found. Please install Docker first."
    exit 1
fi
print_success "Docker found"

if ! docker info &> /dev/null; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi
print_success "Docker is running"

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    print_error "Docker Compose not found. Please install docker-compose."
    exit 1
fi
print_success "Docker Compose found"

# Stop existing containers
print_info "Stopping existing containers..."
docker-compose down 2>/dev/null || docker compose down 2>/dev/null || true

# Build images
print_info "Building Docker images..."
docker-compose build || docker compose build

# Start services
print_info "Starting backend services..."
docker-compose up -d || docker compose up -d

# Wait for services to be healthy
print_info "Waiting for services to start..."
sleep 10

# Check service status
print_info "Checking service status..."
docker-compose ps || docker compose ps

# Test endpoints
echo ""
print_info "Testing backend endpoints..."

for port in 5010 5011 5012 5013; do
    if curl -s -f http://localhost:$port/api/health > /dev/null 2>&1; then
        print_success "Port $port: Running"
    else
        print_error "Port $port: Not responding"
    fi
done

echo ""
print_success "Backend deployment complete!"
echo ""
echo "📊 Service Status:"
docker-compose ps 2>/dev/null || docker compose ps

echo ""
echo "🌐 Services available at:"
echo "   Auth API:   http://192.168.2.98:5010"
echo "   Media:      http://192.168.2.98:5011"
echo "   Cloud:      http://192.168.2.98:5012"
echo "   Dental:     http://192.168.2.98:5013"
echo ""
