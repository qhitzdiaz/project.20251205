#!/bin/bash
# Rebuild Android package (APK & AAB) for the Capacitor frontend

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$ROOT_DIR/frontend"
ANDROID_DIR="$FRONTEND_DIR/android"

log() { printf "==> %s\n" "$1"; }
require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Error: $1 is required but not installed." >&2
    exit 1
  fi
}

log "Checking prerequisites"
require_cmd node
require_cmd npm
require_cmd npx
[ -x "$ANDROID_DIR/gradlew" ] || { echo "Error: gradlew not found in $ANDROID_DIR"; exit 1; }

# Ensure Java 21 is available (macOS + Homebrew helper)
if ! java -version 2>&1 | grep -q 'version "21'; then
  JAVA_21_HOME=""
  # Prefer macOS java_home if available
  if command -v /usr/libexec/java_home >/dev/null 2>&1; then
    JAVA_21_HOME="$(/usr/libexec/java_home -v 21 2>/dev/null || true)"
  fi
  # Fallback to Homebrew path
  if [ -z "$JAVA_21_HOME" ] && [ -d "/opt/homebrew/opt/openjdk@21" ]; then
    JAVA_21_HOME="/opt/homebrew/opt/openjdk@21"
  fi
  if [ -n "$JAVA_21_HOME" ]; then
    export JAVA_HOME="$JAVA_21_HOME"
    export PATH="$JAVA_HOME/bin:$PATH"
    log "JAVA_HOME set to $JAVA_HOME"
  else
    echo "Error: Java 21 not found. Install a Java 21 JDK (e.g., via Homebrew: brew install openjdk@21)." >&2
    exit 1
  fi
fi

# Use a project-local Gradle cache to avoid permission issues
export GRADLE_USER_HOME="${ROOT_DIR}/.gradle"
mkdir -p "$GRADLE_USER_HOME"
log "GRADLE_USER_HOME set to $GRADLE_USER_HOME"

log "Ensuring frontend dependencies"
if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
  (cd "$FRONTEND_DIR" && npm ci)
else
  log "node_modules already present, skipping npm ci"
fi

log "Building React app"
(cd "$FRONTEND_DIR" && npm run build)

log "Syncing Capacitor Android project"
(cd "$FRONTEND_DIR" && npx cap sync android)

log "Building Android release artifacts (APK & AAB)"
(cd "$ANDROID_DIR" && ./gradlew clean assembleRelease bundleRelease)

log "Building Android debug APK (signed with debug keystore)"
(cd "$ANDROID_DIR" && ./gradlew assembleDebug)

log "Packaging artifacts"
DIST_DIR="$FRONTEND_DIR/android/dist"
PACKAGE_DIR="$ROOT_DIR/package/android"
mkdir -p "$DIST_DIR"
mkdir -p "$PACKAGE_DIR"

BASE_NAME="qhitz-android-package"
APK_SRC="$ANDROID_DIR/app/build/outputs/apk/release/app-release.apk"
APK_UNSIGNED_SRC="$ANDROID_DIR/app/build/outputs/apk/release/app-release-unsigned.apk"
APK_DEBUG_SRC="$ANDROID_DIR/app/build/outputs/apk/debug/app-debug.apk"
AAB_SRC="$ANDROID_DIR/app/build/outputs/bundle/release/app-release.aab"
APK_FINAL=""

if [ -f "$APK_SRC" ]; then
  APK_DEST="$DIST_DIR/${BASE_NAME}.apk"
  cp -f "$APK_SRC" "$APK_DEST"
  log "APK packaged: $APK_DEST"
elif [ -f "$APK_UNSIGNED_SRC" ]; then
  APK_DEST="$DIST_DIR/${BASE_NAME}-unsigned.apk"
  cp -f "$APK_UNSIGNED_SRC" "$APK_DEST"
  log "Unsigned APK packaged: $APK_DEST (sign before distribution)"
else
  log "APK not found at $APK_SRC or $APK_UNSIGNED_SRC"
  APK_DEST=""
fi

if [ -f "$APK_DEBUG_SRC" ]; then
  APK_DEBUG_DEST="$DIST_DIR/${BASE_NAME}-debug.apk"
  cp -f "$APK_DEBUG_SRC" "$APK_DEBUG_DEST"
  log "Debug APK packaged: $APK_DEBUG_DEST (debug-signed)"
fi

if [ -n "${APK_DEST:-}" ] && [ -f "$APK_DEST" ]; then
  APK_FINAL="$PACKAGE_DIR/$(basename "$APK_DEST")"
  cp -f "$APK_DEST" "$APK_FINAL"
  log "APK copied to package directory: $APK_FINAL"
fi

if [ -n "${APK_DEBUG_DEST:-}" ] && [ -f "$APK_DEBUG_DEST" ]; then
  APK_DEBUG_FINAL="$PACKAGE_DIR/$(basename "$APK_DEBUG_DEST")"
  cp -f "$APK_DEBUG_DEST" "$APK_DEBUG_FINAL"
  log "Debug APK copied to package directory: $APK_DEBUG_FINAL"
fi

if [ -f "$AAB_SRC" ]; then
  AAB_DEST="$DIST_DIR/${BASE_NAME}.aab"
  cp -f "$AAB_SRC" "$AAB_DEST"
  log "AAB packaged: $AAB_DEST"
else
  log "AAB not found at $AAB_SRC"
fi

log "Artifacts created:"
find "$ANDROID_DIR/app/build/outputs" -type f \( -name "*.apk" -o -name "*.aab" \) -print

log "Rebuild complete"
