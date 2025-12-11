#!/usr/bin/env bash
set -euo pipefail

# Build Flutter tenant client for Android APK and Web.
# Requires Flutter SDK installed and on PATH.
# Optional: override API base URL via --dart-define API_BASE.

API_BASE=${API_BASE:-http://localhost:8000}

echo "=== flutter pub get"
flutter pub get

echo "=== flutter build apk"
flutter build apk --dart-define=API_BASE="$API_BASE"

echo "=== flutter build web"
flutter build web --dart-define=API_BASE="$API_BASE"

echo "Done. APK: build/app/outputs/flutter-apk/app-release.apk | Web: build/web/"
