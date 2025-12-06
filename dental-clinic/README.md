# Compleat Smile Dental Aesthetic - Practice Management System

A comprehensive dental practice management system with patient records, appointment scheduling, document scanning, and more.

## 🦷 Features

- **Patient Management**: Complete patient records and history
- **Appointment Scheduling**: Easy-to-use calendar interface
- **Document Scanning**: OCR-enabled document processing
- **Treatment Plans**: Create and manage treatment plans
- **Responsive Design**: Works on desktop and mobile devices
- **Dark Mode**: Support for light and dark themes

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose installed
- Ports 3001, 5015, 5440, and 8081 available

### Running the Application

1. **Clone or navigate to the directory**:
   ```bash
   cd dental-clinic
   ```

2. **Build and start all services**:
   ```bash
   docker compose up -d
   ```

3. **Access the application**:
   - **Frontend**: http://localhost:3001
   - **Nginx Proxy**: http://localhost:8081
   - **Backend API**: http://localhost:5015
   - **Database**: localhost:5440

### Rebuild Script

For a complete rebuild of all services:

```bash
./rebuild.sh
```

This script will:
- Stop all running containers
- Rebuild all Docker images
- Start fresh containers
- Display the status

## 📦 Services

### Frontend (Port 3001)
- React application with Material-UI
- Progressive Web App (PWA) enabled
- Responsive design for all devices

### Backend API (Port 5015)
- Flask REST API
- PostgreSQL database integration
- OCR document processing
- Gunicorn WSGI server

### Database (Port 5440)
- PostgreSQL 15
- Persistent data storage
- Health checks enabled

### Nginx Proxy (Port 8081)
- Reverse proxy for frontend and API
- Load balancing
- Static file serving

## 🛠️ Development

### Project Structure

```
dental-clinic/
├── backend/              # Flask backend API
│   ├── dental_app.py     # Main application
│   ├── ocr_utils.py      # OCR utilities
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/             # React frontend
│   ├── src/
│   │   ├── pages/        # Page components
│   │   ├── config/       # Configuration files
│   │   └── App.js        # Main app component
│   ├── public/
│   ├── Dockerfile
│   └── package.json
├── nginx/                # Nginx configuration
│   └── nginx.conf
├── docker-compose.yml    # Docker orchestration
└── rebuild.sh            # Rebuild script
```

### Environment Variables

The frontend build uses these API URLs (configured in docker-compose.yml):
- `REACT_APP_AUTH_API_URL`: Authentication API endpoint
- `REACT_APP_MEDIA_API_URL`: Media API endpoint
- `REACT_APP_CLOUD_API_URL`: Cloud storage API endpoint
- `REACT_APP_DENTAL_API_URL`: Dental API endpoint

### Database Credentials

Default credentials (change in production):
- User: `dentaluser`
- Password: `dentalpass`
- Database: `dental_clinic`

## 🔧 Useful Commands

### View Logs
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f frontend-dental-clinic
```

### Stop Services
```bash
docker compose down
```

### Stop and Remove Volumes
```bash
docker compose down -v
```

### Rebuild Specific Service
```bash
docker compose build frontend-dental-clinic
docker compose up -d frontend-dental-clinic
```

## 📱 Progressive Web App (PWA)

The frontend is configured as a PWA and can be installed on:
- Desktop browsers (Chrome, Edge, Safari)
- Mobile devices (iOS, Android)

Features:
- Offline capability
- App-like experience
- Push notifications (future)

## 🔒 Security Notes

- Change default database credentials in production
- Configure HTTPS/SSL in nginx for production
- Update CORS settings as needed
- Secure API endpoints with proper authentication

## 📄 License

Copyright © 2025 Compleat Smile Dental Aesthetic. All rights reserved.
