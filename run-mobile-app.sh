#!/bin/bash
# Run the Flutter tenant mobile app on Android emulator

cd "$(dirname "$0")/tenant-mobile-client"

echo "Starting Flutter app on Android emulator..."
echo "Make sure:"
echo "  ✓ Backend auth service is running on port 5010"
echo "  ✓ Android emulator is running (emulator-5554)"
echo ""

# Run Flutter
flutter run -d emulator-5554

echo ""
echo "Done!"
