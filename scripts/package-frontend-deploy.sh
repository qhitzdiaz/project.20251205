#!/usr/bin/env bash
set -euo pipefail

# Build and package frontend for Linux Docker Compose deployment
# Output: package/frontend-deploy-$(date +%Y%m%d_%H%M%S).tar.gz

FRONTEND_DIR="$(cd "$(dirname "$0")/../frontend" && pwd)"
PACKAGE_DIR="$(cd "$(dirname "$0")/../package" && pwd)"
DEPLOY_TMP="$PACKAGE_DIR/frontend-deploy-tmp-$$"
STAMP=$(date +%Y%m%d_%H%M%S)
TAR_NAME="frontend-deploy-${STAMP}.tar.gz"
TAR_PATH="$PACKAGE_DIR/$TAR_NAME"

# Clean up temp on exit
trap 'rm -rf "$DEPLOY_TMP"' EXIT

mkdir -p "$DEPLOY_TMP"

# 1. Build frontend
cd "$FRONTEND_DIR"
echo "Building frontend..."
npm install
npm run build

# 2. Copy build, docker-compose, nginx config
cp -r build "$DEPLOY_TMP/"
cp docker-compose.yml "$DEPLOY_TMP/"
cp nginx.conf "$DEPLOY_TMP/"

# 3. Package
cd "$PACKAGE_DIR"
tar -czf "$TAR_NAME" -C "$DEPLOY_TMP" \
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
  .
echo "Created deployment package: $TAR_PATH"

# 4. List contents
ls -lh "$TAR_PATH"
