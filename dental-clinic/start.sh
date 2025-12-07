#!/bin/bash

# Dental Clinic Application Startup Script
# Compleat Smile Dental Aesthetic

set -e

echo "=========================================="
echo "Dental Clinic Application"
echo "Compleat Smile Dental Aesthetic"
echo "=========================================="
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running"
    echo "Please start Docker Desktop and try again"
    exit 1
fi

echo "✓ Docker is running"

# Check if .env file exists
if [ ! -f "backend/.env" ]; then
    echo "⚠ Warning: backend/.env not found"
    echo "Creating .env from .env.example..."
    cp backend/.env.example backend/.env
    echo "✓ Created backend/.env"
fi

# Stop any existing containers
echo ""
echo "Stopping existing containers..."
docker compose down 2>/dev/null || true

# Start the application
echo ""
echo "Starting Dental Clinic application..."
docker compose up -d --build

# Wait for services to be ready
echo ""
echo "Waiting for services to start..."
sleep 5

# Check service health
echo ""
echo "Checking service health..."

# Check PostgreSQL
if docker exec dental-clinic-postgres pg_isready -U dental_clinic_user > /dev/null 2>&1; then
    echo "✓ PostgreSQL is ready"
else
    echo "⚠ PostgreSQL is starting..."
fi

# Check Backend
if curl -s http://localhost:5015/api/health > /dev/null 2>&1; then
    echo "✓ Backend API is ready"
else
    echo "⚠ Backend API is starting..."
fi

echo ""
echo "=========================================="
echo "Application started successfully!"
echo "=========================================="
echo ""
echo "Access points:"
echo "  - Main Application: http://localhost:8081"
echo "  - Frontend Direct:  http://localhost:3001"
echo "  - Backend API:      http://localhost:5015/api"
echo "  - Database:         localhost:5440"
echo ""
echo "To view logs:"
echo "  docker compose logs -f"
echo ""
echo "To stop the application:"
echo "  docker compose down"
echo ""
