# Qhitz Inc., - Rebuild & Deployment Guide

This guide explains how to use the rebuild scripts to manage your Qhitz Inc., application.

## Available Scripts

### 1. `./rebuild-all.sh` - Complete Rebuild
**Use when:** You want a fresh start or major changes were made.

**What it does:**
- Stops all Docker containers (backend, frontend, reverse proxy)
- Cleans up unused Docker containers and images
- Rebuilds all backend services (4 APIs + 4 databases)
- Rebuilds frontend application
- Updates reverse proxy
- Syncs Capacitor for mobile app
- Runs health checks on all services

**Usage:**
```bash
./rebuild-all.sh
```

**Time:** ~3-5 minutes

---

### 2. `./quick-rebuild.sh` - Quick Frontend Rebuild
**Use when:** You only changed frontend code.

**What it does:**
- Rebuilds frontend application only
- Updates reverse proxy
- Syncs Capacitor for mobile app
- Keeps backend services running

**Usage:**
```bash
./quick-rebuild.sh
```

**Time:** ~30 seconds

---

### 3. `./build-android.sh` - Build Android APK
**Use when:** You want to create a new mobile app installer.

**What it does:**
- Checks/installs OpenJDK 21 if needed
- Syncs Capacitor with latest frontend build
- Builds Android release APK
- Shows APK location and installation instructions

**Usage:**
```bash
./build-android.sh
```

**Time:** ~30 seconds

**Output:** `frontend/android/app/build/outputs/apk/release/app-release-unsigned.apk`

---

## Access Information

### Web Access (Computer)
- **Localhost:** `http://localhost` or `http://localhost:3000`
- **Reverse Proxy:** `http://localhost` (serves on port 80)

### Homelab Network Access
- **From any device on your network:** `http://192.168.2.28` or `http://192.168.2.28:3000`
- **Replace** `192.168.2.28` with your actual machine IP if different

### Mobile App
- **APK connects to:** `http://192.168.2.28:3000` (configured in capacitor.config.ts)
- **Installation:** Transfer APK to phone, enable "Unknown Sources", install

---

## Service Ports

| Service | Port | Health Check |
|---------|------|-------------|
| Auth API | 5010 | http://localhost:5010/api/health |
| Media API | 5011 | http://localhost:5011/api/health |
| Cloud API | 5012 | http://localhost:5012/api/health |
| Dental API | 5013 | http://localhost:5013/api/health |
| Frontend | 3000 | http://localhost:3000 |
| Reverse Proxy | 80 | http://localhost |

---

## Database Ports

| Database | Port | Container Name |
|----------|------|----------------|
| Auth DB | 5432 | qhitz-postgres-auth |
| Media DB | 5433 | qhitz-postgres-media |
| Cloud DB | 5434 | qhitz-postgres-cloud |

---

## Troubleshooting

### Services not starting?
```bash
# Check Docker logs
docker logs qhitz-backend-api
docker logs qhitz-frontend
docker logs qhitz-reverse-proxy

# Check all containers
docker ps -a
```

### Database connection issues?
```bash
# Wait for databases to be healthy
docker ps --filter "name=qhitz-postgres" --filter "health=healthy"

# Check database logs
docker logs qhitz-postgres-auth
```

### Frontend not updating?
```bash
# Force rebuild without cache
cd frontend
docker compose build --no-cache
docker compose up -d

# Copy new build
docker cp qhitz-frontend:/usr/share/nginx/html/. build/

# Restart reverse proxy
cd ../reverse-proxy
docker compose restart
```

### Android build fails?
```bash
# Make sure Java 21 is installed
brew install openjdk@21

# Set Java home
export JAVA_HOME=/opt/homebrew/opt/openjdk@21

# Clean and rebuild
cd frontend/android
./gradlew clean
./gradlew assembleRelease
```

---

## Development Workflow

### Making Frontend Changes
1. Edit files in `frontend/src/`
2. Run `./quick-rebuild.sh`
3. Test at `http://localhost:3000`
4. Build mobile app: `./build-android.sh`

### Making Backend Changes
1. Edit files in `backend/`
2. Run `./rebuild-all.sh` (or just rebuild backend)
3. Test APIs at `http://localhost:501X/api/health`

### Deploying Mobile App
1. Make sure frontend is updated: `./quick-rebuild.sh`
2. Build APK: `./build-android.sh`
3. Transfer APK from `frontend/android/app/build/outputs/apk/release/`
4. Install on Android device

---

## Environment Configuration

### Homelab IP Address
If your machine IP changes, update these files:
- `frontend/capacitor.config.ts` - Update `server.url`
- Then run `./build-android.sh` to rebuild the mobile app

### API URLs
Frontend uses dynamic API configuration:
- **From localhost:** APIs at `localhost:5010-5013`
- **From IP address:** APIs at same IP with ports 5010-5013
- See `frontend/src/config/apiConfig.js` for implementation

---

## Quick Commands

```bash
# Full rebuild from scratch
./rebuild-all.sh

# Quick frontend update
./quick-rebuild.sh

# Build mobile app
./build-android.sh

# View all services
docker ps

# Stop everything
cd backend && docker compose down
cd ../frontend && docker compose down
cd ../reverse-proxy && docker compose down

# Check service health
curl http://localhost:5010/api/health
curl http://localhost:5011/api/health
curl http://localhost:5012/api/health
curl http://localhost:5013/api/health
```

---

## Notes

- All scripts are located in the project root directory
- Scripts use colored output for better visibility
- Health checks are automatic after rebuilds
- Mobile app configuration is in `frontend/capacitor.config.ts`
- Docker compose files are in each service directory
