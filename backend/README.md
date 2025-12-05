# Qhitz Complete Backend System v1.0.0

Complete microservices architecture with 4 separate Flask applications and 4 PostgreSQL databases.

**Version:** 1.0.0  
**Architecture:** Microservices  
**Databases:** 4 separate PostgreSQL instances

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Backend VM (192.168.2.98)             │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Main API   │  │ Media Server │  │ Cloud Server │ │
│  │   Port 5000  │  │  Port 5001   │  │  Port 5002   │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘ │
│         │                  │                  │          │
│  ┌──────▼───────┐  ┌──────▼───────┐  ┌──────▼───────┐ │
│  │   auth_db    │  │  media_db    │  │  cloud_db    │ │
│  │  PostgreSQL  │  │  PostgreSQL  │  │  PostgreSQL  │ │
│  │   Port 5432  │  │   Port 5433  │  │   Port 5434  │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                          │
│  ┌──────────────┐                                       │
│  │  Dental App  │                                       │
│  │  Port 5003   │                                       │
│  └──────┬───────┘                                       │
│         │                                                │
│  ┌──────▼───────┐                                       │
│  │  dental_db   │                                       │
│  │  PostgreSQL  │                                       │
│  │   Port 5435  │                                       │
│  └──────────────┘                                       │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Services

### **1. Main API Server (Port 5000)**
- **Database:** auth_db
- **Features:**
  - User authentication
  - JWT token management
  - Password encryption (PBKDF2-SHA256)
  - User registration/login
  - Profile management

### **2. Media Server (Port 5001)**
- **Database:** media_db
- **Features:**
  - File upload (images, videos, documents, audio)
  - File management
  - Download/delete files
  - File statistics
  - Support for 100MB files

### **3. Cloud Storage Server (Port 5002)**
- **Database:** cloud_db
- **Features:**
  - Folder management
  - File storage with folders
  - File sharing with links
  - User storage quotas
  - Support for 500MB files

### **4. Dental Appointment System (Port 5003)**
- **Database:** dental_db
- **Features:**
  - Patient management
  - Dentist management
  - Appointment scheduling
  - Treatment records
  - Billing/payments
  - Practice statistics

---

## 📦 Quick Start

### **Step 1: Extract Package**

```bash
cd ~/
unzip qhitz-complete-v1.0.0.zip
cd qhitz-complete-v1.0.0/backend
```

### **Step 2: Configure**

```bash
# Copy environment template
cp .env.example .env

# Already configured for development
# No changes needed
```

### **Step 3: Start All Services**

```bash
# Build and start (takes 2-3 minutes)
docker-compose up -d

# Wait for all databases to be healthy
sleep 30

# Check status
docker-compose ps
```

You should see 8 containers running:
- 4 PostgreSQL databases
- 4 Flask API services

### **Step 4: Test Services**

```bash
# Main API
curl http://localhost:5000/api/health

# Media Server
curl http://localhost:5001/api/health

# Cloud Storage
curl http://localhost:5002/api/health

# Dental App
curl http://localhost:5003/api/health
```

---

## 📋 API Endpoints

### **Main API (Port 5000)**

#### **Authentication:**
```bash
# Register
POST /api/auth/register
Body: {"username": "user", "email": "user@test.com", "password": "pass123"}

# Login
POST /api/auth/login
Body: {"email": "user@test.com", "password": "pass123"}

# Verify Token
GET /api/auth/verify
Headers: Authorization: Bearer <token>

# Get Profile
GET /api/auth/profile
Headers: Authorization: Bearer <token>

# Update Profile
PUT /api/auth/profile
Headers: Authorization: Bearer <token>
Body: {"username": "newname", "email": "new@email.com"}

# Change Password
POST /api/auth/change-password
Headers: Authorization: Bearer <token>
Body: {"current_password": "old", "new_password": "new"}
```

### **Media Server (Port 5001)**

```bash
# Upload File
POST /api/media/upload
Form-data: file, description, tags, is_public, user_id

# Get Files
GET /api/media/files?page=1&per_page=50&type=images&user_id=1

# Get File Details
GET /api/media/file/<file_id>

# Download File
GET /api/media/download/<file_id>

# Delete File
DELETE /api/media/file/<file_id>

# Get Statistics
GET /api/media/stats
```

### **Cloud Storage (Port 5002)**

```bash
# Create Folder
POST /api/cloud/folders
Body: {"name": "Documents", "parent_id": null, "owner_id": 1}

# Get Folders
GET /api/cloud/folders?user_id=1&parent_id=null

# Get Folder Details
GET /api/cloud/folder/<folder_id>

# Delete Folder
DELETE /api/cloud/folder/<folder_id>

# Upload File
POST /api/cloud/upload
Form-data: file, owner_id, folder_id

# Get Files
GET /api/cloud/files?user_id=1&folder_id=null

# Download File
GET /api/cloud/download/<file_id>

# Delete File
DELETE /api/cloud/file/<file_id>

# Share File
POST /api/cloud/share/<file_id>

# Access Shared File
GET /api/cloud/shared/<share_link>

# Get Storage Stats
GET /api/cloud/stats?user_id=1
```

### **Dental App (Port 5003)**

```bash
# ===== Patients =====
# Create Patient
POST /api/dental/patients
Body: {
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@email.com",
  "phone": "555-0100",
  "date_of_birth": "1990-01-15",
  "address": "123 Main St",
  "insurance_provider": "Delta Dental",
  "medical_notes": "No allergies",
  "allergies": "None"
}

# Get All Patients
GET /api/dental/patients?search=john&active_only=true

# Get Patient Details
GET /api/dental/patient/<patient_id>

# Update Patient
PUT /api/dental/patient/<patient_id>
Body: {patient fields}

# ===== Dentists =====
# Create Dentist
POST /api/dental/dentists
Body: {
  "first_name": "Jane",
  "last_name": "Smith",
  "email": "dr.smith@dental.com",
  "phone": "555-0200",
  "specialization": "Orthodontics",
  "license_number": "DDS12345"
}

# Get All Dentists
GET /api/dental/dentists?active_only=true

# ===== Appointments =====
# Create Appointment
POST /api/dental/appointments
Body: {
  "patient_id": 1,
  "dentist_id": 1,
  "appointment_date": "2024-12-15T10:00:00",
  "duration": 30,
  "appointment_type": "checkup",
  "reason": "Regular checkup"
}

# Get Appointments
GET /api/dental/appointments?date_from=2024-12-01&date_to=2024-12-31&patient_id=1

# Update Appointment
PUT /api/dental/appointment/<appointment_id>
Body: {"status": "confirmed"}

# Cancel Appointment
DELETE /api/dental/appointment/<appointment_id>

# ===== Treatments =====
# Create Treatment
POST /api/dental/treatments
Body: {
  "patient_id": 1,
  "appointment_id": 1,
  "treatment_name": "Cavity Filling",
  "description": "Filled cavity on tooth #14",
  "tooth_number": "14",
  "treatment_date": "2024-12-01T14:00:00",
  "cost": 250.00,
  "payment_status": "paid"
}

# Get Treatments
GET /api/dental/treatments?patient_id=1

# ===== Statistics =====
# Get Practice Stats
GET /api/dental/stats
```

---

## 🗄️ Database Schemas

### **1. auth_db (Main API)**

**users table:**
- id, username, email, password_hash
- created_at, last_login, is_active

### **2. media_db (Media Server)**

**media_files table:**
- id, filename, original_filename, file_type
- file_extension, file_size, file_path, mime_type
- uploaded_by, uploaded_at, description, tags
- is_public

### **3. cloud_db (Cloud Storage)**

**folders table:**
- id, name, parent_id, owner_id
- created_at, updated_at, is_shared

**cloud_files table:**
- id, filename, original_filename, file_extension
- file_size, file_path, mime_type, folder_id
- owner_id, uploaded_at, modified_at, version
- is_shared, shared_link

### **4. dental_db (Dental App)**

**patients table:**
- id, first_name, last_name, email, phone
- date_of_birth, address, emergency_contact
- insurance_provider, medical_notes, allergies
- created_at, is_active

**dentists table:**
- id, first_name, last_name, email, phone
- specialization, license_number, is_active

**appointments table:**
- id, patient_id, dentist_id, appointment_date
- duration, appointment_type, status, reason, notes

**treatments table:**
- id, patient_id, appointment_id, treatment_name
- description, tooth_number, treatment_date
- cost, payment_status, notes

---

## 🔧 Management

### **View Logs:**

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend-api
docker-compose logs -f backend-media
docker-compose logs -f backend-cloud
docker-compose logs -f backend-dental
```

### **Restart Services:**

```bash
# All services
docker-compose restart

# Specific service
docker-compose restart backend-api
```

### **Stop Services:**

```bash
docker-compose down
```

### **Check Database:**

```bash
# Connect to auth database
docker-compose exec postgres-auth psql -U qhitz_user -d auth_db

# Connect to media database
docker-compose exec postgres-media psql -U qhitz_user -d media_db

# Connect to cloud database
docker-compose exec postgres-cloud psql -U qhitz_user -d cloud_db

# Connect to dental database
docker-compose exec postgres-dental psql -U qhitz_user -d dental_db

# List tables
\dt

# Exit
\q
```

---

## 🧪 Testing

### **Test Script:**

```bash
#!/bin/bash

echo "🧪 Testing Complete Backend System..."

# Test Main API
echo "1. Main API..."
curl -s http://localhost:5000/api/health

# Test Media Server
echo "2. Media Server..."
curl -s http://localhost:5001/api/health

# Test Cloud Storage
echo "3. Cloud Storage..."
curl -s http://localhost:5002/api/health

# Test Dental App
echo "4. Dental App..."
curl -s http://localhost:5003/api/health

echo "✅ All services tested!"
```

---

## 📊 Service Ports

| Service | Port | Database | Database Port |
|---------|------|----------|---------------|
| Main API | 5000 | auth_db | 5432 |
| Media | 5001 | media_db | 5433 |
| Cloud | 5002 | cloud_db | 5434 |
| Dental | 5003 | dental_db | 5435 |

---

## ✅ Deployment Checklist

- [ ] Package extracted
- [ ] .env configured
- [ ] Docker Compose built
- [ ] 8 containers running (4 DB + 4 API)
- [ ] All databases healthy
- [ ] All health checks pass
- [ ] Firewall allows ports 5000-5003
- [ ] Frontend can connect

---

## 🎯 Use Cases

### **Main API:**
- User authentication for all services
- Centralized user management

### **Media Server:**
- Image galleries
- Video hosting
- Document libraries

### **Cloud Storage:**
- Personal file storage
- Team collaboration
- File sharing

### **Dental App:**
- Dental practice management
- Patient records
- Appointment scheduling
- Treatment tracking
- Billing

---

**Complete Backend System - 4 Services, 4 Databases, Production Ready!** 🚀

**VM:** 192.168.2.98  
**Ports:** 5000, 5001, 5002, 5003  
**Databases:** 4 separate PostgreSQL instances  
**Deploy:** 10 minutes
