#!/bin/bash

# Qhitz Inc - Build Android APK Script
# This script builds the Android mobile app

set -e  # Exit on any error

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$SCRIPT_DIR/frontend"
ANDROID_DIR="$FRONTEND_DIR/android"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Qhitz Inc - Build Android APK${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if Java is installed
if [ ! -d "/opt/homebrew/opt/openjdk@21" ]; then
    echo -e "${RED}✗ OpenJDK 21 not found${NC}"
    echo -e "${YELLOW}Installing OpenJDK 21...${NC}"
    brew install openjdk@21
fi

# Set Java home
export JAVA_HOME=/opt/homebrew/opt/openjdk@21
echo -e "${GREEN}✓ Using Java:${NC} $($JAVA_HOME/bin/java -version 2>&1 | head -1)"
echo ""

# Sync Capacitor
echo -e "${YELLOW}[1/2] Syncing Capacitor...${NC}"
cd "$FRONTEND_DIR"
npx cap sync android
echo -e "${GREEN}✓ Capacitor synced${NC}"
echo ""

# Build APK
echo -e "${YELLOW}[2/2] Building Android APK...${NC}"
cd "$ANDROID_DIR"
./gradlew assembleRelease

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}  ✓ Build Successful!${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""

    APK_PATH="$ANDROID_DIR/app/build/outputs/apk/release/app-release-unsigned.apk"
    APK_SIZE=$(ls -lh "$APK_PATH" | awk '{print $5}')

    echo -e "${GREEN}APK Location:${NC}"
    echo "  $APK_PATH"
    echo ""
    echo -e "${GREEN}APK Size:${NC} $APK_SIZE"
    echo ""
    echo -e "${YELLOW}To install on your phone:${NC}"
    echo "  1. Transfer the APK to your Android device"
    echo "  2. Enable 'Install from Unknown Sources' in Settings"
    echo "  3. Open the APK file to install"
    echo "  4. Make sure your phone is on the same Wi-Fi network"
    echo ""
    echo -e "${GREEN}The app will connect to your homelab server automatically! 📱${NC}"
else
    echo -e "${RED}✗ Build failed${NC}"
    exit 1
fi
