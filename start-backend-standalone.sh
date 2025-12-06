#!/bin/bash
# Start standalone backend instance on this machine (192.168.2.28)
# This runs a complete independent backend with its own databases

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"

log() { printf "==> %s\n" "$1"; }

if [ ! -d "$BACKEND_DIR" ]; then
  echo "Error: backend directory not found at $BACKEND_DIR" >&2
  exit 1
fi

cd "$BACKEND_DIR"

log "Starting standalone backend instance on this machine..."
log "This will create a new independent backend with separate databases"
log ""

# Start all services
log "Building and starting services..."
docker compose -f docker-compose.standalone.yml up -d --build

# Wait for services to be healthy
log "Waiting for databases to be ready..."
sleep 10

# Check status
log "Service status:"
docker compose -f docker-compose.standalone.yml ps

log ""
log "✅ Standalone backend services are now running!"
log ""
log "Services available at:"
log "  Auth API:   http://localhost:6010/api (http://192.168.2.28:6010/api)"
log "  Media API:  http://localhost:6011/api (http://192.168.2.28:6011/api)"
log "  Cloud API:  http://localhost:6012/api (http://192.168.2.28:6012/api)"
log "  Dental API: http://localhost:6013/api (http://192.168.2.28:6013/api)"
log ""
log "Databases:"
log "  Auth DB:    localhost:7432"
log "  Media DB:   localhost:7433"
log "  Cloud DB:   localhost:7434"
log "  Dental DB:  localhost:7435"
log ""
log "To stop: docker compose -f backend/docker-compose.standalone.yml down"
log "To view logs: docker compose -f backend/docker-compose.standalone.yml logs -f"
