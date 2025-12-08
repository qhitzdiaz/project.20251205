#!/bin/bash
# Rebuild and restart backend containers via docker-compose

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"

log() { printf "==> %s\n" "$1"; }

if [ ! -d "$BACKEND_DIR" ]; then
  echo "Error: backend directory not found at $BACKEND_DIR" >&2
  exit 1
fi

# Parse command line arguments
SERVICES=()
REBUILD_ALL=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --all)
      REBUILD_ALL=true
      shift
      ;;
    auth|api)
      SERVICES+=("backend-api")
      shift
      ;;
    media)
      SERVICES+=("backend-media")
      shift
      ;;
    cloud)
      SERVICES+=("backend-cloud")
      shift
      ;;
    *)
      echo "Usage: $0 [--all|auth|media|cloud]"
      echo "  --all    Rebuild core backend services (auth, media, cloud)"
      echo "  auth     Rebuild auth API service (port 5010)"
      echo "  media    Rebuild media service (port 5011)"
      echo "  cloud    Rebuild cloud storage service (port 5012)"
      exit 1
      ;;
  esac
done

# Default to rebuilding all services if none specified
if [ "$REBUILD_ALL" = true ] || [ ${#SERVICES[@]} -eq 0 ]; then
  SERVICES=("backend-api" "backend-media" "backend-cloud")
fi

cd "$BACKEND_DIR"

# Build images
log "Building backend images: ${SERVICES[*]}"
docker-compose build "${SERVICES[@]}"

# Restart services
log "Restarting backend containers: ${SERVICES[*]}"
docker-compose up -d "${SERVICES[@]}"

# Wait for services to start
log "Waiting for services to start..."
sleep 5

# Show status
log "Service status:"
docker-compose ps

log "Done. Backend services available at:"
for service in "${SERVICES[@]}"; do
  case $service in
    backend-api)
      echo "  Auth API:   http://localhost:5010 (http://192.168.2.98:5010)"
      ;;
    backend-media)
      echo "  Media:      http://localhost:5011 (http://192.168.2.98:5011)"
      ;;
    backend-cloud)
      echo "  Cloud:      http://localhost:5012 (http://192.168.2.98:5012)"
      ;;
  esac
done
