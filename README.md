# Qhitz Development Package for macOS v2.0.0

Complete development environment for macOS.

## 📋 Prerequisites

- macOS (tested on macOS 11+)
- Docker Desktop for Mac (running)
- Homebrew
- Docker Compose

## 🚀 Quick Setup

```bash
# Extract the package
tar -xzf qhitz-dev-macos-v2.0.0.tar.gz
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
- **Auth API**: http://localhost:5000
- **Media API**: http://localhost:5001
- **Cloud API**: http://localhost:5002
- **Dental API**: http://localhost:5003

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

- ✅ Complete backend API services
- ✅ React PWA frontend
- ✅ PostgreSQL databases
- ✅ Media streaming (MP3, MP4, FLAC)
- ✅ Dental management with OCR
- ✅ Document scanning
- ✅ Auto-generated patient IDs
- ✅ Philippine geographic data
- ✅ Hot reload for development

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

See individual service files for endpoint documentation:
- `backend/app.py` - Auth endpoints
- `backend/media_server.py` - Media endpoints
- `backend/cloud_server.py` - Cloud endpoints
- `backend/dental_app.py` - Dental endpoints

## 🔒 Environment Variables

### Backend `.env`
- `FLASK_ENV` - development/production
- `POSTGRES_USER` - Database user
- `POSTGRES_PASSWORD` - Database password
- `CORS_ORIGINS` - Allowed origins

### Frontend `.env.development`
- `REACT_APP_*_API_URL` - API endpoints

## 📞 Support

- Version: 2.0.0
- Platform: macOS
- Build Date: December 2, 2025

---

**Happy Coding! 🎉**
