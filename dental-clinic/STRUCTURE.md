# Dental Clinic Application Structure

## Directory Overview

```
dental-clinic/
├── README.md                   # Complete documentation
├── STRUCTURE.md               # This file
├── .gitignore                 # Git ignore patterns
├── docker-compose.yml         # Full stack orchestration
├── start.sh                   # Quick start script
├── stop.sh                    # Stop script
│
├── backend/                   # Flask Backend
│   ├── dental_app.py         # Main application (1,296 lines)
│   ├── Dockerfile            # Backend container config
│   ├── docker-compose.yml    # Standalone backend compose
│   ├── requirements.txt      # Python dependencies
│   ├── .env                  # Environment variables
│   └── .env.example          # Environment template
│
├── frontend/                  # React Frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── DentalApp.js           # Main dental app (~30KB)
│   │   │   ├── NewPatientForm.js      # Patient intake form
│   │   │   ├── MediaPlayerApp.js
│   │   │   ├── CloudStorageApp.js
│   │   │   ├── AboutUs.js
│   │   │   ├── Documentation.js
│   │   │   └── Support.js
│   │   ├── components/
│   │   │   ├── PatientRegistrationDialog.js
│   │   │   └── FilePreviewList.js
│   │   ├── config/
│   │   │   └── apiConfig.js          # API configuration
│   │   ├── utils/
│   │   │   └── currency.js
│   │   ├── App.js
│   │   ├── index.js
│   │   ├── service-worker.js
│   │   └── serviceWorkerRegistration.js
│   ├── public/
│   │   ├── images/
│   │   └── manifest.json
│   ├── package.json
│   ├── package-lock.json
│   ├── Dockerfile
│   ├── capacitor.config.ts
│   ├── README.md
│   └── .env.example
│
├── nginx/                     # Reverse Proxy
│   └── nginx.conf            # Nginx configuration
│
└── assets/                    # Clinic-specific assets
```

## Services

### Backend (Port 5015 -> 5013)
- **Framework**: Flask with Gunicorn
- **Database**: PostgreSQL 15
- **API**: RESTful endpoints
- **Features**:
  - Patient management
  - Dentist management
  - Appointment scheduling
  - Treatment records
  - Document scanning with OCR
  - Statistics & reporting
  - Philippine geographic data

### Frontend (Port 3001)
- **Framework**: React with Material-UI
- **Features**:
  - Patient registration
  - Appointment booking
  - Document upload
  - Statistics dashboard
  - Mobile-ready (Capacitor)

### Database (Port 5440)
- **Engine**: PostgreSQL 15-alpine
- **Database**: dental_clinic_db
- **User**: dental_clinic_user
- **Tables**:
  - patients
  - dentists
  - appointments
  - treatments
  - scanned_documents
  - new_patient_requests
  - ph_regions, ph_provinces, ph_cities, ph_barangays, ph_streets

### Nginx (Port 8081)
- **Purpose**: Reverse proxy and load balancer
- **Routes**:
  - `/api/*` -> Backend
  - `/*` -> Frontend

## Docker Volumes

1. **dental-clinic-db-data** - PostgreSQL data persistence
2. **dental-clinic-scanned-docs** - Document storage

## Networks

- **dental-clinic-net** - Bridge network for all services

## Environment Variables

### Backend
- `DENTAL_DATABASE_URL` - PostgreSQL connection
- `FLASK_ENV` - Environment (development/production)
- `FLASK_DEBUG` - Debug mode (1/0)
- `SECRET_KEY` - Flask secret key
- `CORS_ORIGIN` - CORS settings
- `DENTAL_CLINIC_NAME` - Clinic name

### Frontend
- `REACT_APP_DENTAL_API_URL` - Backend API URL

## Quick Commands

```bash
# Start the application
./start.sh

# Stop the application
./stop.sh

# View logs
docker compose logs -f

# Rebuild and restart
docker compose up -d --build

# Access database
docker exec -it dental-clinic-postgres psql -U dental_clinic_user -d dental_clinic_db

# Backup database
docker exec dental-clinic-postgres pg_dump -U dental_clinic_user dental_clinic_db > backup.sql

# Restore database
cat backup.sql | docker exec -i dental-clinic-postgres psql -U dental_clinic_user -d dental_clinic_db
```

## Source Files Copied From

All files were copied from the main project:
- Backend: `/backend/dental_app.py`
- Frontend: `/frontend/src/pages/DentalApp.js`, `/frontend/src/pages/NewPatientForm.js`
- Component: `/frontend/src/components/PatientRegistrationDialog.js`
- Config: `/frontend/src/config/apiConfig.js`
- Docker: `/backend/Dockerfile`, `/frontend/Dockerfile`
- Nginx: `/reverse-proxy/nginx.conf`
