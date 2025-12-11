# Tenant Client Flutter

Standalone Flutter app for tenants to log in against the Flask/FastAPI backend, submit service requests, and view their request list.

## Features
- Firebase Auth (email + password) for tenant login
- Backend API calls can include Firebase ID token via `Authorization: Bearer <idToken>`
- Dashboard with request list and status chips (currently in-memory; swap to backend when ready)
- New Request bottom sheet with validation
- Logout back to login

## Project structure
- `lib/main.dart`: UI (login, dashboard, request sheet) with HTTP login and in-memory requests
- `pubspec.yaml`: Flutter deps including `http`
- `build.sh`: Convenience builder for APK and Web with `API_BASE` override

## Run locally
```bash
cd tenant-mobile-client
flutter pub get
flutter run --dart-define=API_BASE=http://localhost:8000 -d chrome   # or -d ios/android/macos
```

## Configure backend
- Set API base URL at build/run time: `--dart-define=API_BASE=https://api.yourdomain.com`
- Tenants sign in with Firebase Auth (email + password). After sign-in, the app uses the Firebase ID token as `Authorization: Bearer <idToken>` for backend calls.
- Backend options:
	- Keep existing JWT endpoints, or
	- Enable Firebase token verification (set `FIREBASE_ENABLED=1` and configure `GOOGLE_APPLICATION_CREDENTIALS`).
- Requests list/create are currently local; replace TODOs in `main.dart` to call your backend and notify Property Management on submit.

## Hooking to backend
- After Firebase sign-in, include the ID token in backend requests: `Authorization: Bearer <idToken>`.
- If `FIREBASE_ENABLED=1`, the backend can verify the token and map the email to a local user/tenant record.
- On submit, call your Property Management notification/emit endpoint so it gets the new request.

## Build
With helper script:
```bash
cd tenant-mobile-client
API_BASE=http://localhost:8000 ./build.sh
```

Manual:
```bash
flutter build apk --dart-define=API_BASE=http://localhost:8000    # Android
flutter build ios --dart-define=API_BASE=http://localhost:8000    # iOS (requires Xcode setup)
flutter build macos --dart-define=API_BASE=http://localhost:8000  # macOS desktop
flutter build web --dart-define=API_BASE=http://localhost:8000    # Web (outputs to build/web)
```
