# Qhitz Application Deployment Instructions

**Server IP:** 192.168.2.98

## Package Contents

Three deployment packages have been created:

1. **qhitz-app-192.168.2.98.apk** (4.9 MB) - Android application
2. **qhitz-backend-192.168.2.98.tar.gz** (11 MB) - Backend services
3. **qhitz-frontend-192.168.2.98.tar.gz** (869 KB) - Frontend build

---

## Backend Deployment (Server: 192.168.2.98)

### 1. Extract Backend Package

```bash
tar -xzf qhitz-backend-192.168.2.98.tar.gz
cd backend
```

### 2. Start Backend Services

```bash
docker compose up -d --build
```

This will start:
- **Auth API** on port 5010
- **Media Server** on port 5011
- **Cloud Storage** on port 5012
- PostgreSQL databases on ports 5432-5434

### 3. Verify Backend Services

```bash
docker ps
```

You should see 6 containers running:
- qhitz-backend-api
- qhitz-backend-media
- qhitz-backend-cloud
- qhitz-postgres-auth
- qhitz-postgres-media
- qhitz-postgres-cloud

### 4. Test Backend APIs

```bash
curl http://192.168.2.98:5010/api/health
curl http://192.168.2.98:5011/api/media/music
curl http://192.168.2.98:5012/api/cloud/files
```

---

## Frontend Deployment (Server: 192.168.2.98)

The frontend package contains pre-built static files in the `build/` directory.

### Option A: Using Simple HTTP Server (Quick Test)

```bash
# Extract package
tar -xzf qhitz-frontend-192.168.2.98.tar.gz

# Serve with Python
cd build
python3 -m http.server 3000
```

Access at: `http://192.168.2.98:3000`

### Option B: Using Nginx (Production - Recommended)

```bash
# Extract package
tar -xzf qhitz-frontend-192.168.2.98.tar.gz

# Install nginx (if not installed)
sudo apt-get update && sudo apt-get install nginx  # Ubuntu/Debian

# Copy files to nginx directory
sudo mkdir -p /var/www/qhitz
sudo cp -r build/* /var/www/qhitz/

# Create nginx configuration
sudo tee /etc/nginx/sites-available/qhitz <<'EOF'
server {
    listen 3000;
    server_name 192.168.2.98;
    root /var/www/qhitz;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/qhitz /etc/nginx/sites-enabled/

# Test and restart nginx
sudo nginx -t
sudo systemctl restart nginx
```

Access at: `http://192.168.2.98:3000`

### Option C: Using Docker (From Source)

If you have the full source directory with Dockerfile and nginx.conf:

```bash
cd /path/to/frontend
docker build -t qhitz-frontend .
docker run -d --name qhitz-frontend -p 3000:80 qhitz-frontend
```

Access at: `http://192.168.2.98:3000`

---

## Android App Installation

### 1. Transfer APK to Phone

Transfer `qhitz-app-192.168.2.98.apk` to your Android phone via:
- USB cable
- Email attachment
- Cloud storage
- ADB: `adb install qhitz-app-192.168.2.98.apk`

### 2. Enable Unknown Sources

On your Android phone:
1. Go to **Settings** → **Security**
2. Enable **Install from Unknown Sources** (or **Install Unknown Apps**)

### 3. Install APK

1. Open the APK file on your phone
2. Tap **Install**
3. Wait for installation to complete
4. Tap **Open**

### 4. Configure Backend Connection

The app is pre-configured to connect to: `http://192.168.2.98:5010-5013`

**Note:** Ensure your phone is on the same network (192.168.2.x) as the server.

---

## Application Features

### 1. Music Player (`/media`)
- Upload music files
- Cassette tape visualization
- Grid/List view toggle
- Search functionality
- Play, pause, shuffle controls

### 2. Cloud Storage (`/cloud`)
- File upload/download
- Folder management
- Multiple file selection
- File preview

### 3. Authentication (`/`)
- User registration
- User login
- Session management

---

## Network Requirements

### Server Requirements
- **IP Address:** 192.168.2.98
- **Open Ports:**
  - 3000 (Frontend)
  - 5010 (Auth API)
  - 5011 (Media Server)
  - 5012 (Cloud Storage)
  - 5013 (Dental App)

### Client Requirements
- Must be on the same network (192.168.2.x)
- Browser: Chrome, Firefox, Safari (latest versions)
- Android: Version 7.0 or higher

---

## Troubleshooting

### Backend Not Responding

```bash
# Check container logs
docker logs qhitz-backend-api
docker logs qhitz-backend-media
docker logs qhitz-backend-cloud

# Restart services
docker restart qhitz-backend-api qhitz-backend-media qhitz-backend-cloud
```

### Frontend Not Loading

```bash
# Check frontend logs
docker logs qhitz-frontend

# Rebuild and restart
docker stop qhitz-frontend
docker rm qhitz-frontend
docker build -t qhitz-frontend .
docker run -d --name qhitz-frontend -p 3000:3000 qhitz-frontend
```

### Android App Connection Issues

1. Check if phone is on 192.168.2.x network
2. Verify backend services are running on server
3. Test API endpoints from phone browser:
   - http://192.168.2.98:5010/api/health
   - http://192.168.2.98:3000

### Database Issues

```bash
# Reset databases
docker compose down -v
docker compose up -d
```

---

## Stopping Services

### Stop All Backend Services

```bash
cd backend
docker compose down
```

### Stop Frontend

```bash
docker stop qhitz-frontend
```

### Stop Everything

```bash
docker compose down
docker stop qhitz-frontend
```

---

## Backup and Restore

### Backup Database

```bash
docker exec qhitz-postgres-auth pg_dump -U postgres auth_db > auth_backup.sql
docker exec qhitz-postgres-auth pg_dump -U postgres auth_db > auth_backup.sql
docker exec qhitz-postgres-media pg_dump -U postgres media_db > media_backup.sql
docker exec qhitz-postgres-cloud pg_dump -U postgres cloud_db > cloud_backup.sql
```

### Restore Database

```bash
cat auth_backup.sql | docker exec -i qhitz-postgres-auth psql -U postgres auth_db
cat auth_backup.sql | docker exec -i qhitz-postgres-auth psql -U postgres auth_db
cat media_backup.sql | docker exec -i qhitz-postgres-media psql -U postgres media_db
cat cloud_backup.sql | docker exec -i qhitz-postgres-cloud psql -U postgres cloud_db
```

---

## Support

For issues or questions, contact: qhitz@qhitz.com

## Version

- **Build Date:** December 3, 2025
- **Server IP:** 192.168.2.98
- **Frontend Version:** 1.0.0
- **Backend Version:** 1.0.0
