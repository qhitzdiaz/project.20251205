#!/bin/bash
# Build Android release APK and iOS (iPad) simulator .app via Capacitor.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FRONTEND_DIR="$ROOT_DIR/frontend"
ANDROID_DIR="$FRONTEND_DIR/android"
IOS_DIR="$FRONTEND_DIR/ios"
IOS_BUILD_DIR="$IOS_DIR/build-sim"
JAVA_HOME_DEFAULT="/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home"
SIM_DEVICE="${SIM_DEVICE:-iPad Pro (11-inch) (4th generation)}"
ANDROID_AVD="${ANDROID_AVD:-}"
ANDROID_EMULATOR_BIN="${ANDROID_EMULATOR_BIN:-emulator}"
ANDROID_PACKAGE_ID="${ANDROID_PACKAGE_ID:-com.qhitz.mui}"
IOS_BUNDLE_ID="${IOS_BUNDLE_ID:-com.qhitz.mui}"

log() { printf "==> %s\n" "$1"; }

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Error: $1 is required but not installed." >&2
    exit 1
  fi
}

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

require_cmd npm
require_cmd npx
require_cmd xcodebuild
require_cmd xcrun
require_cmd adb

ensure_java

export LANG="${LANG:-en_US.UTF-8}"
export LC_ALL="${LC_ALL:-en_US.UTF-8}"

boot_ios_simulator() {
  if ! xcrun simctl list devices available | grep -q "$SIM_DEVICE"; then
    log "Simulator '$SIM_DEVICE' not found; will use currently booted device instead."
    SIM_DEVICE="booted"
  fi

  if [ "$SIM_DEVICE" = "booted" ]; then
    # If nothing booted, try booting the default iPad device.
    if ! xcrun simctl list devices available | grep -q "(Booted)"; then
      log "No booted simulators found; booting default iPad simulator: iPad Pro (11-inch) (4th generation)"
      xcrun simctl boot "iPad Pro (11-inch) (4th generation)" || true
    fi
    return
  fi

  local state
  set +e
  state="$(xcrun simctl list devices available | grep "$SIM_DEVICE" | sed -E 's/.*\((Booted|Shutdown)\).*/\1/' | head -n1 2>/dev/null)"
  set -e
  if [ "$state" != "Booted" ]; then
    log "Booting iOS simulator: $SIM_DEVICE"
    xcrun simctl boot "$SIM_DEVICE" || true
  fi
}

start_android_emulator() {
  if [ -z "$ANDROID_AVD" ]; then
    log "ANDROID_AVD not set; skipping Android emulator auto-start."
    return
  fi

  if adb devices | grep -q "emulator-"; then
    log "Android emulator already running."
    return
  fi

  if ! command -v "$ANDROID_EMULATOR_BIN" >/dev/null 2>&1; then
    log "Android emulator binary '$ANDROID_EMULATOR_BIN' not found; skipping emulator launch."
    return
  fi

  log "Starting Android emulator AVD: $ANDROID_AVD"
  nohup "$ANDROID_EMULATOR_BIN" -avd "$ANDROID_AVD" -netdelay none -netspeed full >/tmp/android-emulator.log 2>&1 &
  log "Waiting for Android emulator to boot..."
  adb wait-for-device
  # Wait for sys.boot_completed=1
  for _ in {1..60}; do
    if adb shell getprop sys.boot_completed 2>/dev/null | grep -q "1"; then
      log "Android emulator boot completed."
      return
    fi
    sleep 2
  done
  log "Warning: emulator may not have fully booted; continuing."
}

log "Building web assets"
(cd "$FRONTEND_DIR" && npm run build)

log "Syncing Capacitor (android, ios)"
(cd "$FRONTEND_DIR" && npx cap sync android)
(cd "$FRONTEND_DIR" && npx cap sync ios)

start_android_emulator

log "Building Android release APK"
(cd "$ANDROID_DIR" && ./gradlew assembleRelease assembleDebug)
# Use debug APK (pre-signed by Gradle) instead of unsigned release APK
# Debug APK is suitable for development/testing on emulator
if [ -f "$ANDROID_DIR/app/build/outputs/apk/debug/app-debug.apk" ]; then
  ANDROID_APK_PATH="$ANDROID_DIR/app/build/outputs/apk/debug/app-debug.apk"
  log "Using debug APK (pre-signed)"
elif [ -f "$ANDROID_DIR/app/build/outputs/apk/release/app-release.apk" ]; then
  ANDROID_APK_PATH="$ANDROID_DIR/app/build/outputs/apk/release/app-release.apk"
elif [ -f "$ANDROID_DIR/app/build/outputs/apk/release/app-release-unsigned.apk" ]; then
  ANDROID_APK_PATH="$ANDROID_DIR/app/build/outputs/apk/release/app-release-unsigned.apk"
  log "Using unsigned APK (will fail on emulator - requires signing)"
else
  log "Error: Android APK not found"
  exit 1
fi
log "Android APK: $ANDROID_APK_PATH"

if adb devices | grep -q "emulator-"; then
  log "Installing APK to Android emulator"
  adb install -r "$ANDROID_APK_PATH" || log "Warning: Android install failed; try manually: adb install -r \"$ANDROID_APK_PATH\""
  log "Launching $ANDROID_PACKAGE_ID on emulator"
  adb shell monkey -p "$ANDROID_PACKAGE_ID" -c android.intent.category.LAUNCHER 1 || log "Warning: launch failed; start manually from the emulator."
else
  log "No Android emulator detected; skip auto-install."
fi

log "Building iOS simulator (iPad) .app"
rm -rf "$IOS_BUILD_DIR"
mkdir -p "$IOS_BUILD_DIR"
xcodebuild \
  -workspace "$IOS_DIR/App/App.xcworkspace" \
  -scheme App \
  -configuration Debug \
  -sdk iphonesimulator \
  -destination "generic/platform=iOS Simulator" \
  -derivedDataPath "$IOS_BUILD_DIR" \
  build

SIM_APP_PATH="$IOS_BUILD_DIR/Build/Products/Debug-iphonesimulator/App.app"
log "iOS simulator app built at: $SIM_APP_PATH"

boot_ios_simulator

log "Installing to iOS simulator target: $SIM_DEVICE"
set +e
xcrun simctl install "$SIM_DEVICE" "$SIM_APP_PATH"
install_status=$?
set -e
if [ "$install_status" -ne 0 ]; then
  log "Warning: auto-install failed; ensure a simulator is booted. Manual command:"
  printf "   xcrun simctl install \"%s\" \"%s\" && xcrun simctl launch \"%s\" %s\n" "$SIM_DEVICE" "$SIM_APP_PATH" "$SIM_DEVICE" "$IOS_BUNDLE_ID"
else
  log "Installed to simulator ($SIM_DEVICE). Launching app..."
  set +e
  xcrun simctl launch "$SIM_DEVICE" "$IOS_BUNDLE_ID"
  launch_status=$?
  set -e
  if [ "$launch_status" -ne 0 ]; then
    log "Warning: launch failed; try manually:"
    printf "   xcrun simctl launch \"%s\" %s\n" "$SIM_DEVICE" "$IOS_BUNDLE_ID"
  else
    log "App launched on simulator ($SIM_DEVICE)."
  fi
fi

log "Done."
