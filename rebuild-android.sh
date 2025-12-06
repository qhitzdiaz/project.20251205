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

# Ensure Java 21 is available (Capacitor 7 requires source/target 21)
if ! java -version 2>&1 | grep -q 'version "21'; then
  JAVA_21_HOME=""
  # Prefer macOS java_home if available
  if command -v /usr/libexec/java_home >/dev/null 2>&1; then
    JAVA_21_HOME="$(/usr/libexec/java_home -v 21 2>/dev/null || true)"
  fi
  # Fallback to Homebrew path (full JDK home)
  if [ -z "$JAVA_21_HOME" ] && [ -d "/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home" ]; then
    JAVA_21_HOME="/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home"
  fi
  if [ -z "$JAVA_21_HOME" ] && [ -d "/usr/local/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home" ]; then
    JAVA_21_HOME="/usr/local/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home"
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

# Quick sanity check that the API URLs point at the expected host
EXPECTED_HOST="192.168.2.98"
ENV_FILE="$FRONTEND_DIR/.env"
if [ -f "$ENV_FILE" ]; then
  BAD_URLS="$(grep -E '^REACT_APP_.*_API_URL=' "$ENV_FILE" | grep -v "$EXPECTED_HOST" || true)"
  if [ -n "$BAD_URLS" ]; then
    log "Warning: Some API URLs in $ENV_FILE are not pointing at $EXPECTED_HOST:"
    echo "$BAD_URLS"
  fi
else
  log "Warning: $ENV_FILE not found; build will rely on defaults/environment."
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

# Signing config (override via env: SIGNING_KEYSTORE, SIGNING_KEY_ALIAS, SIGNING_KEY_PASS, SIGNING_STORE_PASS, BUILD_TOOLS_VERSION)
KEYSTORE_PATH="${SIGNING_KEYSTORE:-$ANDROID_DIR/android-release.jks}"
KEY_ALIAS="${SIGNING_KEY_ALIAS:-qhitz-release}"
KEY_PASS="${SIGNING_KEY_PASS:-qhitzRelease123}"
STORE_PASS="${SIGNING_STORE_PASS:-$KEY_PASS}"
SDK_ROOT="${ANDROID_SDK_ROOT:-$HOME/Library/Android/sdk}"
BUILD_TOOLS_VERSION="${BUILD_TOOLS_VERSION:-36.0.0}"
BUILD_TOOLS_BIN="$SDK_ROOT/build-tools/$BUILD_TOOLS_VERSION"

if [ ! -f "$KEYSTORE_PATH" ]; then
  echo "Error: keystore not found at $KEYSTORE_PATH. Set SIGNING_KEYSTORE or place android-release.jks in $ANDROID_DIR." >&2
  exit 1
fi

if [ ! -x "$BUILD_TOOLS_BIN/apksigner" ] || [ ! -x "$BUILD_TOOLS_BIN/zipalign" ]; then
  echo "Error: Build-tools $BUILD_TOOLS_VERSION not found under $SDK_ROOT/build-tools. Set BUILD_TOOLS_VERSION or install via Android SDK Manager." >&2
  exit 1
fi

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

SIGNED_APK=""

if [ -f "$APK_SRC" ] || [ -f "$APK_UNSIGNED_SRC" ]; then
  # Prefer unsigned for signing if present; otherwise use already-signed release
  RELEASE_INPUT="${APK_UNSIGNED_SRC}"
  [ -f "$RELEASE_INPUT" ] || RELEASE_INPUT="${APK_SRC}"

  APK_ALIGNED="$DIST_DIR/${BASE_NAME}-aligned.apk"
  SIGNED_APK="$DIST_DIR/${BASE_NAME}-signed.apk"

  log "Aligning release APK"
  "$BUILD_TOOLS_BIN/zipalign" -f 4 "$RELEASE_INPUT" "$APK_ALIGNED"

  log "Signing release APK"
  "$BUILD_TOOLS_BIN/apksigner" sign \
    --ks "$KEYSTORE_PATH" \
    --ks-pass "pass:$STORE_PASS" \
    --key-pass "pass:$KEY_PASS" \
    --out "$SIGNED_APK" \
    "$APK_ALIGNED"

  log "Signed APK packaged: $SIGNED_APK"
else
  log "Release APK not found at $APK_SRC or $APK_UNSIGNED_SRC"
fi

if [ -f "$APK_DEBUG_SRC" ]; then
  APK_DEBUG_DEST="$DIST_DIR/${BASE_NAME}-debug.apk"
  cp -f "$APK_DEBUG_SRC" "$APK_DEBUG_DEST"
  log "Debug APK packaged: $APK_DEBUG_DEST (debug-signed by debug keystore)"
fi

if [ -n "$SIGNED_APK" ] && [ -f "$SIGNED_APK" ]; then
  APK_FINAL="$PACKAGE_DIR/$(basename "$SIGNED_APK")"
  cp -f "$SIGNED_APK" "$APK_FINAL"
  log "Signed APK copied to package directory: $APK_FINAL"
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
