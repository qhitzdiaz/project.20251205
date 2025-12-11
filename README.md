# Qhitz Development Package for macOS v2.4.0

Complete development environment for macOS using FastAPI microservices.

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

# Run setup script (installs deps, creates env files, starts Docker)
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
- **Property API**: http://localhost:5050
- **Supply Chain API**: http://localhost:5070
- **Serbisyo24x7 API**: http://localhost:5080
- **Reverse Proxy**: http://localhost (routes `/api/auth`, `/api/media`, `/api/cloud`, `/api/property`, `/api/supply`, `/api/serbisyo`)

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
├── backend/                          # FastAPI services: auth, media, cloud
│   ├── fastapi_app.py                # Authentication service (JWT auth)
│   ├── fastapi_media.py              # Media management service
│   ├── fastapi_cloud.py              # Cloud storage service
│   ├── requirements.txt              # Shared deps (FastAPI/SQLAlchemy/etc.)
│   └── docker-compose.yml            # Core services only
├── frontend/                         # React application (main PWA)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── PropertyManagement/   # Property Mgmt pages (dashboard, CRUD, contracts)
│   │   │   ├── SupplyChain/          # Supply Chain pages
│   │   │   ├── Serbisyo24x7/         # Service/jobs pages
│   │   │   └── ...other feature pages
│   │   ├── config/apiConfig.js       # Centralized API URLs
│   │   └── App.js                    # Main app shell
│   ├── public/
│   └── package.json
├── property-management/              # Property management app (FastAPI + Postgres)
│   ├── backend/
│   │   ├── fastapi_property.py       # Property API (leases, maintenance, contracts)
│   │   ├── docker-compose.yml
│   │   └── requirements.txt
│   └── frontend/                     # Dedicated PM frontend (MUI)
│       ├── src/
│       │   ├── pages/                # Dashboard + PM UI
│       │   ├── components/
│       │   └── App.js
│       └── package.json
├── supply-chain/
│   └── backend/                      # Supply Chain API (FastAPI + Postgres)
│       ├── fastapi_supply.py
│       ├── docker-compose.yml
│       └── requirements.txt
├── serbisyo24x7/                     # Services/jobs API (FastAPI + Postgres)
│   └── backend/
│       ├── fastapi_serbisyo.py
│       ├── docker-compose.yml
│       └── requirements.txt
├── reverse-proxy/                    # Nginx reverse proxy
├── scripts/                          # Helper scripts (start/stop/rebuild)
├── logs/
├── start-backend.sh
├── start-frontend.sh
├── stop-all.sh
├── status.sh
└── README.md
```


## 🔧 Manual Setup (if needed)

### Backend (FastAPI services)

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn fastapi_app:app --host 0.0.0.0 --port 5010
```

Use analogous uvicorn commands for `fastapi_media.py` (5011) and `fastapi_cloud.py` (5012). Property/Supply/Serbisyo backends run from their own folders with their respective `fastapi_*.py` entry points.

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
- ✅ Complete backend API services (FastAPI)
- ✅ React PWA frontend with Material-UI
- ✅ PostgreSQL databases for each service
- ✅ JWT authentication and authorization
- ✅ Hot reload for development
- ✅ Modern, responsive UI with dark/light theme support
- ✅ Organized sidebar navigation with application sections
- ✅ Clean, minimalist header design

### Media Management
- ✅ Media streaming (MP3, MP4, FLAC)
- ✅ Music player with cassette visualization
- ✅ Video player support
- ✅ Album art and metadata

### Business Applications
- ✅ **Property Management (FastAPI + React)**
  - Modern dashboard with real-time statistics
  - Full CRUD for properties, tenants, and maintenance
  - **Interactive Maps & Geocoding**
    - Automatic address geocoding using OpenStreetMap
    - Side-by-side property list and map view
    - Multiple map provider links (Google Maps, Apple Maps, OpenStreetMap, Waze)
    - Visual property location tracking with embedded maps
  - **Contracts & Agreements**
    - Generate Philippine lease contracts and property management agreements with printable/PDF templates
    - Required field validation with placeholders to guide completion
    - Save generated agreements directly to the Property API for tracking
    - Auto-detection of coordinates when entering addresses
  - Property and tenant tracking with detailed forms
  - Lease management with active/inactive status
  - Maintenance request tracking with priority levels
  - Staff management with department and role tracking
  - Theme-aware UI with responsive design

- ✅ **Supply Chain Management (FastAPI + React)**
  - Comprehensive dashboard with inventory insights
  - Supplier management with rating system
  - Product catalog with SKU and stock level tracking
  - Purchase order lifecycle management
  - Auto-generated order numbers
  - Stock status indicators (In Stock, Low, Critical, Out of Stock)
  - Theme-aware UI with responsive design

### Cloud & Storage
- ✅ Cloud file storage
- ✅ Folder organization
- ✅ File sharing
- ✅ Document management

## 🎨 User Interface

### Modern Design
- **Clean Header**: Minimalist design with logo, theme toggle, and login/logout button
- **Organized Sidebar**: Section-based navigation with Applications and Resources categories
- **Dark/Light Themes**: Full theme support across all pages with smooth transitions
- **Responsive Layout**: Mobile-first design that adapts to all screen sizes
- **Material-UI Components**: Professional, accessible UI components

### Application Navigation
- **Applications Section**:
  - Media Player
  - Cloud Storage
  - Property Management
  - Supply Chain

- **Resources Section**:
  - Documentation
  - Support

### Dashboard Features
Each application includes a dedicated dashboard with:
- Real-time statistics cards
- Quick action buttons
- System status indicators
- Visual data representation with color-coded metrics

## 🎨 Development

### Backend Development

Backend services use FastAPI with auto-reload enabled. Changes to Python files will automatically restart the service.

### Frontend Development

React development server with hot module replacement. Changes will appear instantly in the browser.

### Database Access

```bash
# Connect to PostgreSQL
docker exec -it qhitz-postgres-auth psql -U qhitz_user -d auth_db

# List tables
\dt

# View data
SELECT * FROM users;
```

## 📚 API Documentation

**Complete API documentation is available in [API_DOCUMENTATION.md](API_DOCUMENTATION.md)**

For quick reference, see individual service files:
- `backend/app.py` - Auth endpoints
- `backend/media.py` - Media endpoints
- `backend/cloud.py` - Cloud endpoints
- `property-management/backend/app.py` - Property management endpoints
- `supply-chain/backend/app.py` - Supply chain endpoints
- `serbisyo24x7/backend/app.py` - Serbisyo24x7 endpoints

## 🔒 Environment Variables

### Backend `.env`
- `SECRET_KEY` - JWT signing key
- `POSTGRES_USER` / `POSTGRES_PASSWORD` - Database credentials (per service)
- `CORS_ORIGIN` - Allowed origins
 - `FIREBASE_ENABLED` - Set to `1` to enable Firebase ID token verification in backend
 - `GOOGLE_APPLICATION_CREDENTIALS` - Path to Firebase service account JSON (required when `FIREBASE_ENABLED=1`)

### Frontend `.env.development`
- `REACT_APP_*_API_URL` - API endpoints

## 📚 Additional Documentation

- [API Documentation](API_DOCUMENTATION.md) - Complete API reference for all services
- [Deployment Instructions](DEPLOYMENT_INSTRUCTIONS.md) - Production deployment guide
- [Rebuild Guide](REBUILD-GUIDE.md) - Build and rebuild instructions

## 📞 Support

- Version: 2.4.0
- Platform: macOS
- Build Date: December 8, 2025
- Last Updated: December 8, 2025
- Email: qhitz@qhitz.com

## 🎉 Recent Updates (v2.4.0)

### New Features
- 📄 **Contracts Management Module**
  - Service contracts, vendor agreements, and lease tracking
  - Contract status management (active, pending, expired, terminated)
  - Contract value and date range tracking
  - Integrated into Property Management Dashboard as 6th stat card
  - Full CRUD operations with detail dialogs
  - Status filtering and searchability

- 🎯 **Serbisyo24x7 Service Module**
  - 24/7 service management system
  - Service catalog management
  - Job request tracking
  - Scheduling and status tracking
  - Dedicated dashboard and services page
  - Full PostgreSQL backend integration

- 🔄 **Enhanced Rebuild System**
  - Automatic backup cleanup (retains only 10 most recent backups)
  - Improved backup management to prevent disk space issues
  - Command-line options: `--quick`, `--no-backup`, `--no-prune`
  - Automatic latest backup restoration on rebuild

- ✅ **Selectable Lists Across Property Management**
  - All lists now clickable with detail dialogs
  - Properties, Tenants, Maintenance, Staff, Invoices, Expenses all enhanced
  - Consistent hover effects and visual feedback
  - Quick actions accessible from list items

### Previous Features (v2.3.0)
- 🗺️ **Interactive Maps & Geocoding for Property Management**
  - Automatic address geocoding using free OpenStreetMap API
  - Real-time coordinate detection when entering property addresses
  - Side-by-side scrollable property list and interactive map view
  - Visual map markers for all properties with location data
  - Multiple map provider integration (Google Maps, Apple Maps, OpenStreetMap, Waze)
  - Smart debouncing to prevent excessive API calls
  - Auto-centering map based on property locations
  - Location status indicators ("On Map" badges)

- 👥 **Staff Management Module**
  - Staff member tracking with roles and departments
  - Assignment to properties
  - Contact information and employment dates
  - Active/inactive status tracking

### Improvements
- ✨ Expanded Property Management dashboard to 6 cards (2 rows × 3 columns)
- ✨ Modernized UI with clean header and organized sidebar
- ✨ Complete Property Management application with full CRUD operations
- ✨ Complete Supply Chain Management application with full CRUD operations
- ✨ Enhanced dark/light theme support across all pages
- ✨ Responsive design improvements for mobile devices
- ✨ Centralized API configuration for easier maintenance
- 🔧 Fixed CORS configuration for Supply Chain API
- 🔧 Improved navigation structure with section headers
- 🔧 Database backup automation with retention policies

### Upcoming (v2.5.0)
- 🔐 Firebase Auth integration for Tenant Mobile App
  - Mobile app uses Firebase email/password
  - Backend can verify Firebase ID tokens (optional)
  - Property Management Tenants UI shows linked Firebase UID when available
  - Username or email supported for identification; email recommended for Firebase sign-in

---

**Happy Coding! 🎉**
