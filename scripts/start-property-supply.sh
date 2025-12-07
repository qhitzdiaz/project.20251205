#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

REBUILD=false
if [[ "${1-}" == "--build" || "${1-}" == "-b" ]]; then
  REBUILD=true
fi

log() { printf "==> %s\n" "$1"; }

start_stack() {
  local dir="$1"
  local name="$2"
  if [[ ! -d "$dir" ]]; then
    log "Skipping $name (directory not found: $dir)"
    return
  fi
  pushd "$dir" >/dev/null
  if $REBUILD; then
    log "Starting $name with rebuild..."
    docker compose up -d --build
  else
    log "Starting $name..."
    docker compose up -d
  fi
  popd >/dev/null
}

log "Starting Property Management backend"
start_stack "$ROOT_DIR/property-management/backend" "property-management"

log "Starting Supply Chain backend"
start_stack "$ROOT_DIR/supply-chain/backend" "supply-chain"

log "Done. Verify with: docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'"
