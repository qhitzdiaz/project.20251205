#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

log() { printf "==> %s\n" "$1"; }

stop_stack() {
  local dir="$1"
  local name="$2"
  if [[ ! -d "$dir" ]]; then
    log "Skipping $name (directory not found: $dir)"
    return
  fi
  pushd "$dir" >/dev/null
  log "Stopping $name..."
  docker compose down || true
  popd >/dev/null
}

stop_stack "$ROOT_DIR/property-management/backend" "property-management"
stop_stack "$ROOT_DIR/supply-chain/backend" "supply-chain"

log "Done. Verify with: docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'"
