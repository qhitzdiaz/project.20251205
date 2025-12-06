#!/bin/bash
# Build and run the iOS simulator (defaults to an iPad profile).
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FRONTEND_DIR="$ROOT_DIR/frontend"
IOS_DIR="$FRONTEND_DIR/ios"
DERIVED_DATA="$IOS_DIR/build"

# Default simulator device; override with DEVICE_NAME="iPad Pro 11-inch (M5)" etc.
DEVICE_NAME="${DEVICE_NAME:-iPad Pro 11-inch (M5)}"

export LANG="${LANG:-en_US.UTF-8}"
export LC_ALL="${LC_ALL:-en_US.UTF-8}"

log() { printf "==> %s\n" "$1"; }

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Error: $1 is required but not installed." >&2
    exit 1
  fi
}

require_cmd xcrun
require_cmd xcodebuild
require_cmd npm
require_cmd npx

log "Building web assets"
(cd "$FRONTEND_DIR" && npm run build)

log "Syncing Capacitor iOS project"
(cd "$FRONTEND_DIR" && npx cap sync ios)

log "Booting simulator: $DEVICE_NAME"
xcrun simctl bootstatus "$DEVICE_NAME" >/dev/null 2>&1 || xcrun simctl boot "$DEVICE_NAME"

log "Building Debug app for simulator"
(cd "$FRONTEND_DIR" && \
  xcodebuild \
    -workspace "$IOS_DIR/App/App.xcworkspace" \
    -scheme App \
    -configuration Debug \
    -sdk iphonesimulator \
    -destination "name=$DEVICE_NAME" \
    -derivedDataPath "$DERIVED_DATA" \
    build >/dev/null)

APP_PATH="$DERIVED_DATA/Build/Products/Debug-iphonesimulator/App.app"
if [ ! -d "$APP_PATH" ]; then
  echo "Error: built app not found at $APP_PATH" >&2
  exit 1
fi

log "Installing app to simulator"
xcrun simctl install "$DEVICE_NAME" "$APP_PATH"

log "Launching app"
xcrun simctl launch "$DEVICE_NAME" com.qhitz.mui || true

log "Done. Simulator: $DEVICE_NAME"
