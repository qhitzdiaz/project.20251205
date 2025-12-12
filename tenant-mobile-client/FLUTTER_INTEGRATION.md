# Flutter Integration with Native iOS App

## Overview
The Flutter app has been converted to a **Flutter Module** that can be embedded in the native `tenant-mobile-app` Xcode project.

## Structure
- **`flutter_module/`**: Flutter module containing the tenant mobile app code
- **`tenant-mobile-app/`**: Native Swift/Xcode project
- **`ios/`**: Original Flutter iOS build directory (for reference)

## Integration Steps

### Step 1: Add Flutter Module as Dependency
In the `tenant-mobile-app` Xcode project:

1. Open `tenant-mobile-app.xcodeproj` in Xcode
2. Go to **File → Add Packages**
3. Add the Flutter module path: `../flutter_module`

### Step 2: Embed Flutter in ContentView
Replace the native `ContentView.swift` with Flutter:

```swift
import SwiftUI
import flutter_module

struct ContentView: View {
    var body: some View {
        FlutterModuleView()
            .ignoresSafeArea()
    }
}
```

### Step 3: Update AppDelegate
In `tenant_mobile_appApp.swift`:

```swift
import UIKit
import flutter_module

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
    ) -> Bool {
        // Initialize Flutter engine
        GeneratedPluginRegistrant.register(with: self)
        return true
    }
}
```

### Step 4: Build from Command Line
```bash
cd tenant-mobile-client/flutter_module
flutter build ios --release
```

Then in Xcode:
```bash
cd tenant-mobile-app
xcodebuild -workspace tenant-mobile-app.xcworkspace -scheme tenant-mobile-app -configuration Release
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
