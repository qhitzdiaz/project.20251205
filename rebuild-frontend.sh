#!/bin/bash
# Rebuild and restart the frontend container via docker-compose

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"

log() { printf "==> %s\n" "$1"; }

if [ ! -d "$BACKEND_DIR" ]; then
  echo "Error: backend directory not found at $BACKEND_DIR" >&2
  exit 1
fi

log "Building frontend image"
(cd "$BACKEND_DIR" && docker-compose build frontend)

log "Restarting frontend container"
(cd "$BACKEND_DIR" && docker-compose up -d frontend)

log "Done. Frontend should be available on port 3000."
