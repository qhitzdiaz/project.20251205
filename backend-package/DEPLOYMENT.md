# Backend Services Deployment Guide

## Overview

This package contains all backend services for the qhitz platform, optimized for deployment in a Linux VM with Docker and Docker Compose.

**Services Included:**
- **Auth API** (port 5010) - JWT authentication and user management
- **Media API** (port 5011) - Image/document processing, OCR
- **Cloud API** (port 5012) - Cloud storage and file management

## Quick Start (Docker Compose)

### Prerequisites
- Docker (version 20.10+)
- Docker Compose (version 2.0+)
- 4GB+ RAM
- 20GB+ disk space

### Installation Steps

```bash
# 1. Navigate to the backend package directory
cd backend-package

# 2. Copy and configure environment
cp .env.example .env
# Edit .env with your desired settings
nano .env

# 3. Start all services
docker-compose up -d

# 4. Verify services are running
docker-compose ps

# 5. Check service health
curl http://localhost:5010/health
curl http://localhost:5011/health
curl http://localhost:5012/health
```

### Stop Services
```bash
docker-compose down
```

### View Logs
```bash
# All services
docker-compose logs -f

- The `backend-api` (Auth) service now auto-initializes database tables on startup via a FastAPI startup hook. Manual init with `create_tables()` is no longer required.
# Specific service
docker-compose logs -f backend-api
docker-compose logs -f backend-media
docker-compose logs -f backend-cloud
```

---

## Manual Installation (Without Docker)

For systems where Docker is not available or not preferred.

### Prerequisites
- Python 3.9+
- PostgreSQL 13+
- Property: `GET /health`
- Supply: `GET /health`
- Serbisyo: `GET /health`

### Linux Installation

#### Ubuntu/Debian
```bash
# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Run automated setup
sudo chmod +x setup-linux.sh
sudo ./setup-linux.sh

# Or manually install dependencies:
sudo apt-get install -y \
    python3 python3-pip python3-venv \
    postgresql postgresql-contrib \
    tesseract-ocr tesseract-ocr-eng \
    ffmpeg libsndfile1 libffi-dev

# Install Python packages
pip install -r requirements.txt
```

#### RHEL/CentOS/Fedora
```bash
# Update system
sudo yum update -y

# Install dependencies
sudo yum install -y \
    python3 python3-pip \
    postgresql postgresql-server \
    tesseract tesseract-langpack-eng \
    ffmpeg libsndfile

# Install Python packages
pip install -r requirements.txt
```

### Database Setup

```bash
# Create databases
sudo -u postgres psql -c "CREATE DATABASE auth_db;"
sudo -u postgres psql -c "CREATE DATABASE media_db;"
sudo -u postgres psql -c "CREATE DATABASE cloud_db;"

# Create user (if not exists)
sudo -u postgres psql -c "CREATE USER qhitz_user WITH PASSWORD 'devpass123';"

# Grant privileges
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE auth_db TO qhitz_user;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE media_db TO qhitz_user;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE cloud_db TO qhitz_user;"
```

### Run Services

```bash
# Configure environment
cp .env.example .env
nano .env

# Create directories
mkdir -p uploads scanned_documents storage logs

# Run each service in a separate terminal or use screen/tmux:

# Terminal 1: Auth API
uvicorn app:app --host 0.0.0.0 --port 5010 --reload

# Terminal 2: Media API
uvicorn media:app --host 0.0.0.0 --port 5011 --reload

# Terminal 3: Cloud API
uvicorn cloud:app --host 0.0.0.0 --port 5012 --reload
```

---

## Configuration

### Environment Variables

Key configuration options in `.env`:

| Variable | Default | Description |
|----------|---------|-------------|
| `POSTGRES_USER` | qhitz_user | PostgreSQL username |
| `POSTGRES_PASSWORD` | devpass123 | PostgreSQL password |
| `AUTH_DB_PORT` | 5432 | Auth database port |
| `AUTH_API_PORT` | 5010 | Auth API port |
| `MEDIA_API_PORT` | 5011 | Media API port |
| `CLOUD_API_PORT` | 5012 | Cloud API port |
| `SECRET_KEY` | dev-secret-key... | JWT secret (change in production!) |
| `ACCESS_TOKEN_EXPIRES_MINUTES` | 60 | Token expiration time |
| `CORS_ORIGIN` | * | CORS allowed origins |
| `FIREBASE_ENABLED` | 0 | Enable Firebase auth (0/1) |
| `FIREBASE_PROJECT_ID` | | Firebase project ID |

### Production Settings

⚠️ **Important for Production:**

1. **Change default credentials** in `.env`
   ```
   POSTGRES_PASSWORD=YOUR_SECURE_PASSWORD
   SECRET_KEY=YOUR_SECURE_SECRET_KEY
   ```

2. **Update CORS settings**
   ```
   CORS_ORIGIN=https://yourdomain.com
   ```

3. **Enable HTTPS** (use reverse proxy with SSL)

4. **Set resource limits** in docker-compose.yml
   ```yaml
   resources:
     limits:
       cpus: '2'
       memory: 2G
   ```

5. **Configure backup strategy**
   - Regular PostgreSQL backups
   - File storage backups (uploads, scanned_documents)

---

## API Endpoints

### Auth API (5010)

```bash
# Health check
curl http://localhost:5010/health

# Register
curl -X POST http://localhost:5010/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "secure_password"
  }'

# Login
curl -X POST http://localhost:5010/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "secure_password"
  }'

# Verify token
curl -X POST http://localhost:5010/auth/verify \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Media API (5011)

```bash
# Upload image
curl -X POST http://localhost:5011/media/upload \
  -F "file=@image.jpg" \
  -H "Authorization: Bearer YOUR_TOKEN"

# List files
curl http://localhost:5011/media/list \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Cloud API (5012)

```bash
# Upload file
curl -X POST http://localhost:5012/cloud/upload \
  -F "file=@document.pdf" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Database Management

### Backup

```bash
# Backup all databases
mkdir -p backups
for db in auth_db media_db cloud_db; do
  pg_dump -U qhitz_user $db > backups/${db}_$(date +%Y%m%d_%H%M%S).sql
done
```

### Restore

```bash
# Restore database
psql -U qhitz_user auth_db < backups/auth_db_20251212_120000.sql
```

### Database Maintenance

```bash
# Connect to database
psql -U qhitz_user -d auth_db

# Useful commands
\dt              # List tables
\du              # List users
\l               # List databases
\q               # Quit
```

---

## Monitoring

### Check Service Status

```bash
# Docker Compose
docker-compose ps

# Manual services
ps aux | grep uvicorn
```

### View Logs

```bash
# Docker Compose
docker-compose logs backend-api
docker-compose logs backend-media
docker-compose logs backend-cloud

# Manual (stdout)
# Check terminal where services are running
```

### Monitor Resources

```bash
# Docker
docker stats

# System (Linux)
top
htop
free -h
df -h
```

---

## Troubleshooting

### Services won't start

**Issue:** "Port already in use"
```bash
# Find and kill process on port
lsof -i :5010
kill -9 <PID>
```

**Issue:** "Connection refused"
- Verify PostgreSQL is running
- Check `.env` database credentials
- Ensure firewall allows connections

### Database connection errors

```bash
# Test PostgreSQL connection
psql -U qhitz_user -d auth_db -h localhost

# Check PostgreSQL service
sudo systemctl status postgresql
sudo systemctl restart postgresql
```

### Permission errors on uploads

```bash
# Fix directory permissions
chmod -R 755 uploads scanned_documents storage
chown -R $USER:$USER uploads scanned_documents storage
```

---

## Scaling Considerations

### For Production with Higher Load:

1. **Use managed PostgreSQL service**
   - AWS RDS, Azure Database, Google Cloud SQL
   - Automatic backups and replication

2. **Reverse proxy (Nginx)**
   - Load balancing across multiple API instances
   - SSL/TLS termination

3. **Message queue (Redis/RabbitMQ)**
   - Async job processing
   - Cache layer

4. **File storage**
   - S3-compatible object storage (MinIO, AWS S3)
   - CDN for file delivery

5. **Monitoring stack**
   - Prometheus + Grafana for metrics
   - ELK Stack or similar for logging

---

## Support & Documentation

For more information:
- [FastAPI Documentation](https://fastapi.tiangolo.com)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)
- [Docker Documentation](https://docs.docker.com)

For issues with this deployment, check the main project repository documentation.
