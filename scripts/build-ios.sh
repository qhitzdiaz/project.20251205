#!/bin/bash
# Build an iOS archive and export an IPA (supports app-store/testflight or development).
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FRONTEND_DIR="$ROOT_DIR/frontend"
IOS_DIR="$FRONTEND_DIR/ios"
BUILD_DIR="$IOS_DIR/build"
ARCHIVE_PATH="$BUILD_DIR/App.xcarchive"
EXPORT_PLIST="$BUILD_DIR/export-options.plist"
EXPORT_DIR="$BUILD_DIR/export"

export LANG="${LANG:-en_US.UTF-8}"
export LC_ALL="${LC_ALL:-en_US.UTF-8}"

DEVELOPMENT_TEAM="${DEVELOPMENT_TEAM:-}"
PROVISIONING_PROFILE_SPECIFIER="${PROVISIONING_PROFILE_SPECIFIER:-}"
CODE_SIGN_STYLE="${CODE_SIGN_STYLE:-Automatic}"
EXPORT_METHOD="${EXPORT_METHOD:-app-store}" # app-store, ad-hoc, enterprise, development

log() { printf "==> %s\n" "$1"; }

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Error: $1 is required but not installed." >&2
    exit 1
  fi
}

require_cmd xcodebuild
require_cmd npm
require_cmd npx

if [ -z "$DEVELOPMENT_TEAM" ] && [ "$CODE_SIGN_STYLE" != "Automatic" ]; then
  echo "Error: DEVELOPMENT_TEAM must be set when CODE_SIGN_STYLE is Manual." >&2
  exit 1
fi

log "Building web assets"
(cd "$FRONTEND_DIR" && npm run build)

log "Syncing Capacitor iOS project"
(cd "$FRONTEND_DIR" && npx cap sync ios)

log "Cleaning previous build artifacts"
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR" "$EXPORT_DIR"

log "Archiving (Release)"
xcodebuild \
  -workspace "$IOS_DIR/App/App.xcworkspace" \
  -scheme App \
  -configuration Release \
  -archivePath "$ARCHIVE_PATH" \
  -derivedDataPath "$BUILD_DIR" \
  CODE_SIGN_STYLE="$CODE_SIGN_STYLE" \
  DEVELOPMENT_TEAM="$DEVELOPMENT_TEAM" \
  PROVISIONING_PROFILE_SPECIFIER="$PROVISIONING_PROFILE_SPECIFIER" \
  archive

log "Creating export options plist ($EXPORT_METHOD)"
cat > "$EXPORT_PLIST" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>method</key>
  <string>$EXPORT_METHOD</string>
  <key>teamID</key>
  <string>$DEVELOPMENT_TEAM</string>
  <key>compileBitcode</key>
  <false/>
  <key>destination</key>
  <string>export</string>
</dict>
</plist>
EOF

log "Exporting IPA"
xcodebuild \
  -exportArchive \
  -archivePath "$ARCHIVE_PATH" \
  -exportOptionsPlist "$EXPORT_PLIST" \
  -exportPath "$EXPORT_DIR"

log "Artifacts:"
find "$EXPORT_DIR" -type f -maxdepth 1 -name "*.ipa" -print
log "Done. Upload to TestFlight via Xcode Organizer or altool/Transporter."
