#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
FRONTEND_DIR="$ROOT_DIR/../frontend"
TARGET_BUILD_DIR="$ROOT_DIR/frontend/build"

echo "1/3 Building frontend in $FRONTEND_DIR"
cd "$FRONTEND_DIR"
npm ci
npm run build

echo "2/3 Preparing reverse-proxy build dir $TARGET_BUILD_DIR"
mkdir -p "$TARGET_BUILD_DIR"
rm -rf "$TARGET_BUILD_DIR"/*
cp -r "$FRONTEND_DIR/build"/* "$TARGET_BUILD_DIR"/

echo "3/3 Starting docker-compose (reverse-proxy)"
cd "$ROOT_DIR"
docker-compose up -d --build

echo "Deploy complete. Check 'docker-compose ps' and 'docker-compose logs nginx' for status."
