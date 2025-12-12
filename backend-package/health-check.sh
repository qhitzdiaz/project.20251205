#!/bin/bash

# Health Check Script for Backend Services
# Verifies all backend services are responding to health endpoints

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
AUTH_PORT=${AUTH_API_PORT:-5010}
MEDIA_PORT=${MEDIA_API_PORT:-5011}
CLOUD_PORT=${CLOUD_API_PORT:-5012}
PROPERTY_PORT=${PROPERTY_API_PORT:-5050}
SUPPLY_PORT=${SUPPLY_API_PORT:-5070}
SERBISYO_PORT=${SERBISYO_API_PORT:-5080}
TIMEOUT=5
RETRIES=3

# Services to check
declare -a SERVICES=(
    "Auth API:http://localhost:${AUTH_PORT}/api/health"
    "Media API:http://localhost:${MEDIA_PORT}/api/health"
    "Cloud API:http://localhost:${CLOUD_PORT}/api/health"
    "Property API:http://localhost:${PROPERTY_PORT}/health"
    "Supply API:http://localhost:${SUPPLY_PORT}/health"
    "Serbisyo API:http://localhost:${SERBISYO_PORT}/health"
)

# PostgreSQL ports
declare -a DATABASES=(
    "Auth DB:localhost:5432:${POSTGRES_AUTH_USER:-qhitz_user}:${POSTGRES_AUTH_DB:-auth_db}"
    "Media DB:localhost:5433:${POSTGRES_MEDIA_USER:-qhitz_user}:${POSTGRES_MEDIA_DB:-media_db}"
    "Cloud DB:localhost:5434:${POSTGRES_CLOUD_USER:-qhitz_user}:${POSTGRES_CLOUD_DB:-cloud_db}"
    "Property DB:localhost:5450:${POSTGRES_PROPERTY_USER:-qhitz_user}:${POSTGRES_PROPERTY_DB:-property_db}"
    "Supply DB:localhost:5470:${POSTGRES_SUPPLY_USER:-qhitz_user}:${POSTGRES_SUPPLY_DB:-supply_db}"
    "Serbisyo DB:localhost:5480:${POSTGRES_SERBISYO_USER:-qhitz_user}:${POSTGRES_SERBISYO_DB:-serbisyo_db}"
)

echo "=========================================="
echo "Backend Services Health Check"
echo "=========================================="
echo ""

# Track overall status
ALL_HEALTHY=true

# Function to check HTTP endpoint
check_http_health() {
    local service_name=$1
    local url=$2
    
    echo -n "Checking ${service_name}... "
    
    for attempt in $(seq 1 $RETRIES); do
        if response=$(curl -s -m $TIMEOUT "$url" 2>/dev/null); then
            echo -e "${GREEN}✓ OK${NC}"
            return 0
        fi
        
        if [ $attempt -lt $RETRIES ]; then
            sleep 1
        fi
    done
    
    echo -e "${RED}✗ FAILED${NC}"
    ALL_HEALTHY=false
    return 1
}

# Function to check database connection
check_db_health() {
    local db_name=$1
    local host=$2
    local port=$3
    local user=$4
    local db=$5

    echo -n "Checking ${db_name}... "

    if timeout $TIMEOUT pg_isready -h "$host" -p "$port" >/dev/null 2>&1; then
        # optional simple query using provided user/db
        if timeout $TIMEOUT psql "host=$host port=$port user=$user dbname=$db" -c 'SELECT 1;' >/dev/null 2>&1; then
            echo -e "${GREEN}✓ OK${NC}"
            return 0
        fi
    fi

    echo -e "${RED}✗ FAILED${NC}"
    ALL_HEALTHY=false
    return 1
}

# Check if running in Docker or native
if docker-compose ps >/dev/null 2>&1; then
    echo "Running with Docker Compose"
    echo ""
    
    echo "API Services:"
    for service in "${SERVICES[@]}"; do
        IFS=':' read -r name url <<< "$service"
        check_http_health "$name" "$url"
    done
    
    echo ""
    echo "Databases:"
    for db in "${DATABASES[@]}"; do
        IFS=':' read -r name host port user dbname <<< "$db"
        check_db_health "$name" "$host" "$port" "$user" "$dbname"
    done
else
    echo "Running with native Python services"
    echo ""
    
    echo "API Services:"
    for service in "${SERVICES[@]}"; do
        IFS=':' read -r name url <<< "$service"
        check_http_health "$name" "$url"
    done
    
    echo ""
    echo "Databases:"
    for db in "${DATABASES[@]}"; do
        IFS=':' read -r name host port user dbname <<< "$db"
        check_db_health "$name" "$host" "$port" "$user" "$dbname"
    done
fi

echo ""
echo "=========================================="

if [ "$ALL_HEALTHY" = true ]; then
    echo -e "${GREEN}All services are healthy!${NC}"
    echo "=========================================="
    exit 0
else
    echo -e "${RED}Some services are not responding.${NC}"
    echo ""
    echo "Troubleshooting:"
    echo "1. Check if services are running: docker-compose ps"
    echo "2. View logs: docker-compose logs -f"
    echo "3. Verify network connectivity: ping localhost"
    echo "4. Check firewall rules"
    echo "=========================================="
    exit 1
fi
