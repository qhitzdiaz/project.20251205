# Qhitz Development Package for macOS v2.1.0

Complete development environment for macOS.

## 📋 Prerequisites

- macOS (tested on macOS 11+)
- Docker Desktop for Mac (running)
- Homebrew
- Docker Compose

## 🚀 Quick Setup

```bash
# Extract the package
tar -xzf qhitz-dev-macos-v2.1.0.tar.gz
cd qhitz-dev-macos

# Run setup script
bash setup-macos.sh

# This will:
# - Install Node.js and Python (if needed)
# - Create Python virtual environment
# - Install all dependencies
# - Create .env files
# - Start Docker containers
# - Create convenience scripts
```

## 🎯 Usage

### Start Development

```bash
# Terminal 1: Start backend services
./start-backend.sh

# Terminal 2: Start frontend
./start-frontend.sh
```

### Access the Application

- **Frontend**: http://localhost:3000
- **Auth API**: http://localhost:5010
- **Media API**: http://localhost:5011
- **Cloud API**: http://localhost:5012
- ~~**Dental API**~~ (optional/legacy): http://localhost:5013
- **Property API**: http://localhost:5050
- **Supply Chain API**: http://localhost:5060
- **Reverse Proxy**: http://localhost (routes `/api/auth`, `/api/media`, `/api/cloud`, `/api/property`, `/api/supply`)

### Start/Stop Property & Supply stacks

Use the helper scripts in `scripts/`:

```bash
./scripts/start-property-supply.sh          # start property + supply stacks
./scripts/start-property-supply.sh --build  # rebuild then start
./scripts/stop-property-supply.sh           # stop both stacks
./scripts/restart-property-supply.sh        # stop then start (use --build to rebuild)
```

### Other Commands

```bash
./status.sh      # Check what's running
./stop-all.sh    # Stop all services
```

## 📂 Project Structure

```
qhitz-dev-macos/
├── backend/                  # Flask APIs: auth, media, cloud (dental code retained but not default)
│   ├── app.py
│   ├── media_server.py
│   ├── cloud_server.py
│   ├── dental_app.py
│   ├── requirements.txt
│   └── docker-compose.yml
├── frontend/                 # React application
│   ├── src/
│   ├── public/
│   └── package.json
├── reverse-proxy/            # Nginx reverse proxy
├── property-management/      # Property management app (FastAPI + Postgres)
├── supply-chain/             # Supply chain app (FastAPI + Postgres)
├── dental-clinic/            # Separate dental clinic app (branch)
├── user-admin/               # Admin UI
├── scripts/                  # Helper scripts (start/stop/restart property+supply; cleanup .DS_Store)
├── logs/
├── start-backend.sh
├── start-frontend.sh
├── stop-all.sh
├── status.sh
└── README.md
```

## 🔧 Manual Setup (if needed)

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
docker-compose up -d
python app.py  # Start one service
```

### Frontend

```bash
cd frontend
npm install
npm start
```

## 🛠️ Troubleshooting

### Docker issues
```bash
# Restart Docker Desktop from Applications
# Wait for it to fully start
docker info  # Verify it's running
```

### Port conflicts
```bash
# Kill processes on specific port
lsof -ti:3000 | xargs kill
lsof -ti:5000 | xargs kill
```

### Python issues
```bash
cd backend
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Node issues
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

## 📝 Features

### Core Services
- ✅ Complete backend API services (Flask + FastAPI)
- ✅ React PWA frontend with Material-UI
- ✅ PostgreSQL databases for each service
- ✅ JWT authentication and authorization
- ✅ Hot reload for development

### Media Management
- ✅ Media streaming (MP3, MP4, FLAC)
- ✅ Music player with cassette visualization
- ✅ Video player support
- ✅ Album art and metadata

### Business Applications
- ✅ Property Management (FastAPI)
  - Property and tenant tracking
  - Lease management
  - Maintenance requests
- ✅ Supply Chain Management (FastAPI)
  - Supplier and product management
  - Purchase orders and shipments
  - Inventory tracking
- ✅ Dental Clinic (separate app)
  - Patient management with OCR
  - Appointment scheduling
  - Treatment records
  - Philippine geographic data
  - Document scanning

### Cloud & Storage
- ✅ Cloud file storage
- ✅ Folder organization
- ✅ File sharing
- ✅ Document management

## 🎨 Development

### Backend Development

Backend services use Flask with auto-reload enabled. Changes to Python files will automatically restart the service.

### Frontend Development

React development server with hot module replacement. Changes will appear instantly in the browser.

### Database Access

```bash
# Connect to PostgreSQL
docker exec -it qhitz-postgres-dental psql -U qhitz_user -d dental_db

# List tables
\dt

# View data
SELECT * FROM patients;
```

## 📚 API Documentation

**Complete API documentation is available in [API_DOCUMENTATION.md](API_DOCUMENTATION.md)**

For quick reference, see individual service files:
- `backend/app.py` - Auth endpoints
- `backend/media_server.py` - Media endpoints
- `backend/cloud_server.py` - Cloud endpoints
- `backend/dental_app.py` - Dental endpoints (legacy)
- `property-management/backend/app.py` - Property management endpoints
- `supply-chain/backend/app.py` - Supply chain endpoints
- `dental-clinic/backend/dental_app.py` - Dental clinic endpoints (separate app)

## 🔒 Environment Variables

### Backend `.env`
- `FLASK_ENV` - development/production
- `POSTGRES_USER` - Database user
- `POSTGRES_PASSWORD` - Database password
- `CORS_ORIGINS` - Allowed origins

### Frontend `.env.development`
- `REACT_APP_*_API_URL` - API endpoints

## 📚 Additional Documentation

- [API Documentation](API_DOCUMENTATION.md) - Complete API reference for all services
- [Deployment Instructions](DEPLOYMENT_INSTRUCTIONS.md) - Production deployment guide
- [Rebuild Guide](REBUILD-GUIDE.md) - Build and rebuild instructions

## 📞 Support

- Version: 2.1.0
- Platform: macOS
- Build Date: December 7, 2025
- Email: qhitz@qhitz.com

---

**Happy Coding! 🎉**
