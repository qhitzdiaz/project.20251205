#!/usr/bin/env bash
set -euo pipefail

# Directory to clean; defaults to repo root if not provided
TARGET_DIR="${1:-/Users/qhitz/Development/project.20251205}"

echo "Removing .DS_Store files under $TARGET_DIR ..."
find "$TARGET_DIR" -name ".DS_Store" -delete 2>/dev/null || true
echo "Done."
