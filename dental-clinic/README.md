# Compleat Smile Dental Aesthetic - Dental Clinic Application

A comprehensive dental practice management system built with Flask (backend) and React (frontend), containerized with Docker.

## Overview

This is a standalone dental clinic application that includes:
- **Patient Management** - Complete patient records with medical history
- **Dentist Management** - Doctor profiles and specializations
- **Appointment Scheduling** - Calendar-based appointment system
- **Treatment Records** - Procedure tracking with costs
- **Document Management** - Scan and store documents with OCR capability
- **Statistics Dashboard** - Practice analytics and reporting
- **Geographic Data** - Philippine regions, provinces, cities, barangays, and streets

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Nginx (Port 8081)                  │
│              Reverse Proxy & Load Balancer          │
└───────────────────┬─────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
┌───────▼──────────┐    ┌──────▼──────────┐
│  Frontend React  │    │  Backend Flask  │
│  (Port 3001)     │    │  (Port 5015)    │
│  - Material-UI   │    │  - Gunicorn     │
│  - React Router  │    │  - SQLAlchemy   │
└──────────────────┘    └────────┬────────┘
                                 │
                        ┌────────▼────────┐
                        │   PostgreSQL    │
                        │   (Port 5440)   │
                        │ dental_clinic_db│
                        └─────────────────┘
```

## Directory Structure

```
dental-clinic/
├── backend/
│   ├── dental_app.py           # Main Flask application
│   ├── Dockerfile              # Backend container config
│   ├── docker-compose.yml      # Backend-only compose (deprecated)
│   ├── requirements.txt        # Python dependencies
│   ├── .env                    # Environment variables
│   └── .env.example            # Environment template
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── DentalApp.js           # Main dental app component
│   │   │   └── NewPatientForm.js      # Public patient intake form
│   │   ├── components/
│   │   │   └── PatientRegistrationDialog.js
│   │   └── config/
│   │       └── apiConfig.js           # API endpoint configuration
│   ├── public/
│   ├── package.json
│   ├── Dockerfile              # Frontend container config
│   ├── capacitor.config.ts     # Mobile app config
│   └── .env.example
├── nginx/
│   └── nginx.conf              # Reverse proxy configuration
├── assets/                     # Clinic-specific assets (logos, etc.)
├── docker-compose.yml          # Full stack orchestration
└── README.md                   # This file
```

## Prerequisites

- Docker and Docker Compose
- 4GB+ available RAM
- Ports 8081, 5015, 5440, and 3001 available

## Quick Start

### 1. Configure Environment Variables

Create a `.env` file in the root directory (or use the existing one in `backend/`):

```bash
# Database
DENTAL_CLINIC_DB_PASSWORD=dentalpass123

# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=1
SECRET_KEY=dev-secret-key

# CORS
CORS_ORIGIN=*

# Clinic Info
DENTAL_CLINIC_NAME="Compleat Smile Dental Aesthetic"
```

### 2. Start the Application

From the `dental-clinic/` directory:

```bash
docker compose up -d
```

This will start:
- PostgreSQL on port 5440
- Backend API on port 5015
- Frontend on port 3001
- Nginx on port 8081

### 3. Access the Application

- **Main Application**: http://localhost:8081
- **Frontend Direct**: http://localhost:3001
- **Backend API**: http://localhost:5015/api
- **Database**: localhost:5440

### 4. Initial Setup

On first run, the backend will automatically:
- Create database tables
- Set up schema
- Initialize Philippine geographic data (if available)

## API Endpoints

### Base URL
```
http://localhost:5015/api
```

### Available Endpoints

#### Health Check
- `GET /health` - System health status

#### Patients
- `GET /patients` - List all patients
- `GET /patients/<id>` - Get patient details
- `POST /patients` - Create new patient
- `PUT /patients/<id>` - Update patient
- `DELETE /patients/<id>` - Delete patient

#### Dentists
- `GET /dentists` - List all dentists
- `POST /dentists` - Add new dentist
- `PUT /dentists/<id>` - Update dentist
- `DELETE /dentists/<id>` - Remove dentist

#### Appointments
- `GET /appointments` - List appointments
- `POST /appointments` - Schedule appointment
- `PUT /appointments/<id>` - Update appointment
- `DELETE /appointments/<id>` - Cancel appointment

#### Treatments
- `GET /treatments` - List treatments
- `POST /treatments` - Record new treatment
- `GET /treatments/patient/<patient_id>` - Get patient treatments

#### Documents
- `POST /documents/upload` - Upload scanned document
- `GET /documents/<id>` - Get document
- `GET /documents/<id>/ocr` - Get OCR text from document
- `DELETE /documents/<id>` - Delete document
- `GET /documents/types` - List document types

#### Statistics
- `GET /stats` - Practice statistics (patients, appointments, revenue)

#### Geographic Data (Philippine Addresses)
- `GET /ph/regions` - List regions
- `GET /ph/provinces` - List provinces
- `GET /ph/cities` - List cities
- `GET /ph/barangays` - List barangays
- `GET /ph/streets` - List streets

#### New Patient Requests
- `POST /new-patient-request` - Submit new patient form (public)
- `GET /new-patient-requests` - List new patient requests (admin)

## Development

### Backend Development

To run the backend locally without Docker:

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Set environment variables
export DENTAL_DATABASE_URL="postgresql://dental_clinic_user:dentalpass123@localhost:5440/dental_clinic_db"
export FLASK_ENV=development
export FLASK_DEBUG=1

# Run the application
python dental_app.py
# Or with Gunicorn:
gunicorn -w 2 -b 0.0.0.0:5013 dental_app:app
```

### Frontend Development

To run the frontend locally:

```bash
cd frontend
npm install

# Set environment variables
export REACT_APP_DENTAL_API_URL=http://localhost:5015/api

# Start development server
npm start
```

### Database Access

Connect to PostgreSQL:

```bash
# Via Docker
docker exec -it dental-clinic-postgres psql -U dental_clinic_user -d dental_clinic_db

# Via local psql
psql -h localhost -p 5440 -U dental_clinic_user -d dental_clinic_db
```

## Configuration

### Environment Variables

#### Backend (.env)
- `DENTAL_DATABASE_URL` - PostgreSQL connection string
- `FLASK_ENV` - Flask environment (development/production)
- `FLASK_DEBUG` - Enable debug mode (1/0)
- `SECRET_KEY` - Flask secret key for sessions
- `CORS_ORIGIN` - CORS allowed origins
- `DENTAL_CLINIC_NAME` - Clinic name for branding

#### Frontend
- `REACT_APP_DENTAL_API_URL` - Backend API URL

### Port Configuration

Ports can be changed in `docker-compose.yml`:

```yaml
services:
  postgres-dental-clinic:
    ports:
      - "5440:5432"  # Change 5440 to your preferred external port

  backend-dental-clinic:
    ports:
      - "5015:5013"  # Change 5015 to your preferred external port

  frontend-dental-clinic:
    ports:
      - "3001:80"    # Change 3001 to your preferred external port

  nginx-dental-clinic:
    ports:
      - "8081:80"    # Change 8081 to your preferred external port
```

## Features

### Patient Management
- Complete patient profiles with contact information
- Medical and dental history tracking
- Insurance information
- Emergency contacts
- Patient search and filtering

### Appointment System
- Calendar-based scheduling
- Appointment status tracking (scheduled, completed, cancelled)
- Dentist assignment
- Notes and special instructions

### Document Management
- Upload and store scanned documents (PDFs)
- OCR text extraction
- Document categorization (X-Ray, Prescription, Lab Report, etc.)
- Secure document storage with volume persistence

### Treatment Records
- Procedure tracking
- Cost and billing information
- Treatment notes
- Patient treatment history

### Statistics Dashboard
- Total patients
- Upcoming appointments
- Revenue tracking
- Practice analytics

## Volumes and Data Persistence

The application uses Docker volumes for data persistence:

- `dental-clinic-db-data` - PostgreSQL database
- `dental-clinic-scanned-docs` - Scanned document storage

### Backup Database

```bash
docker exec dental-clinic-postgres pg_dump -U dental_clinic_user dental_clinic_db > backup.sql
```

### Restore Database

```bash
cat backup.sql | docker exec -i dental-clinic-postgres psql -U dental_clinic_user -d dental_clinic_db
```

## Troubleshooting

### Containers won't start

Check if ports are already in use:
```bash
lsof -i :8081
lsof -i :5015
lsof -i :5440
lsof -i :3001
```

### Database connection errors

Ensure PostgreSQL is healthy:
```bash
docker logs dental-clinic-postgres
docker exec dental-clinic-postgres pg_isready -U dental_clinic_user
```

### Backend API errors

Check backend logs:
```bash
docker logs dental-clinic-backend
```

### Frontend not loading

Check frontend logs:
```bash
docker logs dental-clinic-frontend
```

Check nginx logs:
```bash
docker logs dental-clinic-nginx
```

## Stopping the Application

```bash
# Stop all services
docker compose down

# Stop and remove volumes (WARNING: This deletes all data)
docker compose down -v
```

## Production Deployment

For production deployment:

1. **Update Environment Variables**
   - Set strong `SECRET_KEY`
   - Set strong `DENTAL_CLINIC_DB_PASSWORD`
   - Set `FLASK_ENV=production`
   - Set `FLASK_DEBUG=0`
   - Configure specific `CORS_ORIGIN`

2. **Enable HTTPS**
   - Update nginx.conf for SSL/TLS
   - Obtain SSL certificates (Let's Encrypt recommended)

3. **Database Security**
   - Remove exposed database port or restrict to localhost
   - Regular backups
   - Enable SSL for database connections

4. **Resource Limits**
   - Add resource limits to docker-compose.yml
   - Configure Gunicorn workers based on CPU cores

5. **Monitoring**
   - Set up logging and monitoring
   - Configure health check endpoints
   - Monitor disk usage for documents volume

## License

Proprietary - Compleat Smile Dental Aesthetic

## Support

For support or questions, contact the development team.
