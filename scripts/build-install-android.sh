#!/bin/bash
# Build the Capacitor Android debug APK and install it to a running emulator/device.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FRONTEND_DIR="$ROOT_DIR/frontend"
ANDROID_DIR="$FRONTEND_DIR/android"
JAVA_HOME_DEFAULT="/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home"

# Allow overriding the target device id (adb -s). Falls back to the first device.
ADB_TARGET="${ADB_TARGET:-}"

log() { printf "==> %s\n" "$1"; }

ensure_java() {
  if [ -n "${JAVA_HOME:-}" ]; then
    return
  fi
  if [ -d "$JAVA_HOME_DEFAULT" ]; then
    export JAVA_HOME="$JAVA_HOME_DEFAULT"
    export PATH="$JAVA_HOME/bin:$PATH"
    log "JAVA_HOME set to $JAVA_HOME"
  else
    echo "Error: JAVA_HOME not set and $JAVA_HOME_DEFAULT not found." >&2
    exit 1
  fi
}

pick_device() {
  if [ -n "$ADB_TARGET" ]; then
    echo "$ADB_TARGET"
    return
  fi
  local first_device
  first_device="$(adb devices | awk 'NR>1 && $2=="device" {print $1; exit}')" || true
  if [ -z "$first_device" ]; then
    echo "Error: no running emulator/device found for adb install." >&2
    exit 1
  fi
  echo "$first_device"
}

ensure_java

log "Building React app"
(cd "$FRONTEND_DIR" && npm run build)

log "Syncing Capacitor Android project"
(cd "$FRONTEND_DIR" && npx cap sync android)

log "Assembling Android debug APK"
(cd "$ANDROID_DIR" && ./gradlew assembleDebug)

DEVICE_ID="$(pick_device)"
APK_PATH="$ANDROID_DIR/app/build/outputs/apk/debug/app-debug.apk"

log "Installing APK to $DEVICE_ID"
adb -s "$DEVICE_ID" install -r "$APK_PATH"

log "Launching app on $DEVICE_ID"
adb -s "$DEVICE_ID" shell am start -n com.qhitz.mui/.MainActivity

log "Done"
