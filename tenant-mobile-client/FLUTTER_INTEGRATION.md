# Flutter Integration with Native iOS App

## Overview
The Flutter app is available as a standalone module. You have two options:

### Option A: Run Flutter Standalone (Easiest)
```bash
cd /Users/qhitz/Development/project.20251205/tenant-mobile-client
flutter run -d "iPad Air 11-inch (M3)"
```

This will launch the Flutter tenant app directly on the simulator.

### Option B: Embed Flutter in Native Xcode Project
This is more complex. You would need to:

1. Build Flutter as a framework
2. Embed it in the native Xcode project
3. Create platform channels for communication

## Recommended: Use Flutter Standalone

The simplest approach is to run the Flutter module directly:

```bash
cd /Users/qhitz/Development/project.20251205/tenant-mobile-client

# For iPad Air M3 simulator
flutter run -d "iPad Air 11-inch (M3)"

# Or list available devices
flutter devices

# Then run
flutter run -d <device-id>
```

## API Configuration
The Flutter app connects to the backend at **`10.0.2.2:5010`** (Android) or **`localhost:5010`** (iOS simulator).

**Test Credentials:**
- Username: `tenant1`, `tenant2`, or `tenant3`
- Password: `123456`

## Troubleshooting

### Pod Issues
```bash
cd flutter_module/ios
pod install --repo-update
```

### Clean Build
```bash
flutter clean
cd flutter_module
flutter pub get
flutter build ios
```

### Check iOS Deployment Target
Ensure both projects use iOS 13.0 or higher.

## File Locations
- Flutter App: `/tenant-mobile-client/flutter_module/lib/main.dart`
- Firebase Config: `/tenant-mobile-client/flutter_module/lib/firebase_options.dart`
- Native Project: `/tenant-mobile-client/tenant-mobile-app/tenant-mobile-app.xcodeproj`
