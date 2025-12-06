#!/bin/bash
# Rebuild and restart the frontend container via the frontend docker-compose.yml

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$ROOT_DIR/frontend"

log() { printf "==> %s\n" "$1"; }

if [ ! -d "$FRONTEND_DIR" ]; then
  echo "Error: frontend directory not found at $FRONTEND_DIR" >&2
  exit 1
fi

# Pick docker compose (new plugin) or docker-compose (legacy)
if docker compose version >/dev/null 2>&1; then
  compose() { (cd "$FRONTEND_DIR" && docker compose "$@"); }
elif command -v docker-compose >/dev/null 2>&1; then
  compose() { (cd "$FRONTEND_DIR" && docker-compose "$@"); }
else
  echo "Error: docker compose is required but not installed." >&2
  exit 1
fi

log "Building frontend image (frontend/docker-compose.yml)"
compose build frontend

log "Restarting frontend container"
compose up -d frontend

log "Done. Frontend should be available on port 3000 (reverse proxy on 80 if running)."
