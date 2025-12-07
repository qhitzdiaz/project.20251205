#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

REBUILD=false
if [[ "${1-}" == "--build" || "${1-}" == "-b" ]]; then
  REBUILD=true
fi

log() { printf "==> %s\n" "$1"; }

log "Stopping stacks..."
"$ROOT_DIR/scripts/stop-property-supply.sh"

log "Starting stacks... (rebuild=$REBUILD)"
if $REBUILD; then
  "$ROOT_DIR/scripts/start-property-supply.sh" --build
else
  "$ROOT_DIR/scripts/start-property-supply.sh"
fi

log "Done. Verify with: docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'"
