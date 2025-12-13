#!/usr/bin/env bash
set -euo pipefail

# Build the frontend and create a Linux deployment tarball.
# Mobile builds are excluded; this packages static web assets only.

REPO_ROOT="$(cd "$(dirname "$0")"/.. && pwd)"
FRONTEND_DIR="$REPO_ROOT/frontend"
OUT_DIR="$REPO_ROOT/package"
TS="$(date +%Y%m%d_%H%M%S)"
PKG_NAME="frontend-static-${TS}.tar.gz"

if [[ ! -d "$FRONTEND_DIR" ]]; then
  echo "Frontend directory not found at $FRONTEND_DIR" >&2
  exit 1
fi

echo "Using frontend at: $FRONTEND_DIR"
mkdir -p "$OUT_DIR"

echo "Installing dependencies (npm/yarn/pnpm)..."
if command -v pnpm >/dev/null 2>&1; then
  (cd "$FRONTEND_DIR" && pnpm install)
elif command -v yarn >/dev/null 2>&1; then
  (cd "$FRONTEND_DIR" && yarn install)
else
  (cd "$FRONTEND_DIR" && npm install)
fi

echo "Building frontend..."
if command -v pnpm >/dev/null 2>&1; then
  (cd "$FRONTEND_DIR" && pnpm build)
elif command -v yarn >/dev/null 2>&1; then
  (cd "$FRONTEND_DIR" && yarn build)
else
  (cd "$FRONTEND_DIR" && npm run build)
fi

BUILD_DIR="$FRONTEND_DIR/dist"
if [[ ! -d "$BUILD_DIR" ]]; then
  BUILD_DIR="$FRONTEND_DIR/build"
fi
if [[ ! -d "$BUILD_DIR" ]]; then
  echo "Build output not found (checked dist/ and build/) in $FRONTEND_DIR" >&2
  exit 2
fi

echo "Creating tarball: $OUT_DIR/$PKG_NAME"
tar -C "$BUILD_DIR" -czf "$OUT_DIR/$PKG_NAME" \
  --exclude='*.apk' \
  --exclude='*.aab' \
  --exclude='*.ipa' \
  --exclude='*.exe' \
  --exclude='*.dll' \
  --exclude='*.so' \
  --exclude='*.dylib' \
  --exclude='*.o' \
  --exclude='*.a' \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='.gradle' \
  --exclude='build' \
  .

echo "Package created: $OUT_DIR/$PKG_NAME"
echo "Deploy on Linux by uploading and extracting to your web root or Nginx/Reverse Proxy static root."
