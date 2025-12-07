#!/bin/bash

# Dental Clinic Application Stop Script
# Compleat Smile Dental Aesthetic

set -e

echo "=========================================="
echo "Stopping Dental Clinic Application"
echo "=========================================="
echo ""

# Stop containers
echo "Stopping all containers..."
docker compose down

echo ""
echo "✓ All containers stopped"
echo ""
echo "To remove all data (including database):"
echo "  docker compose down -v"
echo ""
