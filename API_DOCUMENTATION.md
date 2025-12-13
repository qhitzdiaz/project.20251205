# Qhitz Application - API Documentation

**Version:** 2.1.0
**Last Updated:** December 7, 2025

This document provides comprehensive API documentation for all services in the Qhitz application ecosystem.

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication Service](#authentication-service)
3. [Media Service](#media-service)
4. [Cloud Storage Service](#cloud-storage-service)
5. [Property Management Service](#property-management-service)
6. [Supply Chain Service](#supply-chain-service)
7. [Error Handling](#error-handling)
8. [Authentication](#authentication)

---

## Overview

The Qhitz application consists of multiple microservices, each running independently with its own database:

| Service | Port | Database | Technology | Description |
|---------|------|----------|------------|-------------|
| Auth API | 50010 | auth_db | FastAPI | User authentication and authorization |
| Media Server | 50011 | media_db | FastAPI | Music and video file management |
| Cloud Storage | 50012 | cloud_db | FastAPI | File storage and sharing |
| Property Management | 50050 | property_db | FastAPI | Property and lease management |
| Supply Chain | 50070 | supplychain_db | FastAPI | Supply chain and inventory |

### Base URLs

**Development (via Reverse Proxy):**
- Auth: `http://localhost/api/auth`
- Media: `http://localhost/api/media`
- Cloud: `http://localhost/api/cloud`
- Property: `http://localhost/api/property`
- Supply Chain: `http://localhost/api/supply`

**Direct Access (if needed):**
- Auth: `http://192.168.2.98:50010/api`
- Media: `http://192.168.2.98:50011/api`
- Cloud: `http://192.168.2.98:50012/api`
- Property: `http://192.168.2.98:50050/api`
- Supply Chain: `http://192.168.2.98:50070/api`

---

## Authentication Service

**Base URL:** `http://localhost/api/auth` (via Reverse Proxy) or `http://192.168.2.98:50010/api`
**Database:** auth_db
**Technology:** FastAPI + PostgreSQL

### Endpoints

#### Health Check

```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "service": "Main API Server",
  "timestamp": "2025-12-07T10:30:00.000Z",
  "database": "connected"
}
```

---

#### Register User

```http
POST /auth/register
```

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response (201 Created):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "created_at": "2025-12-07T10:30:00.000Z",
    "is_active": true
  }
}
```

---

#### Login

```http
POST /auth/login
```

**Request Body:**
```json
{
  "username": "johndoe",
  "password": "SecurePass123"
}
```

**Response (200 OK):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "last_login": "2025-12-07T10:30:00.000Z"
  }
}
```

---

#### Verify Token

```http
GET /auth/verify
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "valid": true,
  "user_id": 1
}
```

---

#### Get Profile

```http
GET /auth/profile
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "created_at": "2025-12-07T10:30:00.000Z",
  "last_login": "2025-12-07T10:30:00.000Z",
  "is_active": true
}
```

---

#### Update Profile

```http
PUT /auth/profile
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "email": "newemail@example.com"
}
```

**Response (200 OK):**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "newemail@example.com"
  }
}
```

---

#### Change Password

```http
POST /auth/change-password
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "old_password": "OldPass123",
  "new_password": "NewPass456"
}
```

**Response (200 OK):**
```json
{
  "message": "Password changed successfully"
}
```

---

## Media Service

**Base URL:** `http://localhost:50011/api`
**Database:** media_db
**Technology:** FastAPI + PostgreSQL

### Endpoints

#### Health Check

```http
GET /health
```

---

#### Upload Media File

```http
POST /media/upload
```

**Request:** Multipart form data
```
file: <binary>
title: "Song Title"
artist: "Artist Name" (optional)
album: "Album Name" (optional)
```

**Response (201 Created):**
```json
{
  "message": "File uploaded successfully",
  "file": {
    "id": 1,
    "filename": "song.mp3",
    "original_filename": "song.mp3",
    "title": "Song Title",
    "artist": "Artist Name",
    "album": "Album Name",
    "file_type": "audio",
    "mime_type": "audio/mpeg",
    "file_size": 5242880,
    "uploaded_at": "2025-12-07T10:30:00.000Z"
  }
}
```

---

#### Get All Media Files

```http
GET /media/files
```

**Query Parameters:**
- `type` (optional): Filter by file type (audio, video, other)
- `search` (optional): Search by title or artist

**Response (200 OK):**
```json
{
  "files": [
    {
      "id": 1,
      "title": "Song Title",
      "artist": "Artist Name",
      "album": "Album Name",
      "file_type": "audio",
      "file_size": 5242880,
      "uploaded_at": "2025-12-07T10:30:00.000Z"
    }
  ],
  "total": 1
}
```

---

#### Get Music Files

```http
GET /media/music
```

**Response (200 OK):**
```json
{
  "music": [
    {
      "id": 1,
      "title": "Song Title",
      "artist": "Artist Name",
      "album": "Album Name",
      "duration": null,
      "file_size": 5242880
    }
  ],
  "total": 1
}
```

---

#### Get Video Files

```http
GET /media/videos
```

**Response (200 OK):**
```json
{
  "videos": [
    {
      "id": 2,
      "title": "Video Title",
      "file_size": 52428800,
      "uploaded_at": "2025-12-07T10:30:00.000Z"
    }
  ],
  "total": 1
}
```

---

#### Get File Details

```http
GET /media/file/{file_id}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "filename": "song.mp3",
  "title": "Song Title",
  "artist": "Artist Name",
  "album": "Album Name",
  "file_type": "audio",
  "mime_type": "audio/mpeg",
  "file_size": 5242880,
  "uploaded_at": "2025-12-07T10:30:00.000Z"
}
```

---

#### Download File

```http
GET /media/download/{file_id}
```

**Response:** Binary file download

---

#### Delete File

```http
DELETE /media/file/{file_id}
```

**Response (200 OK):**
```json
{
  "message": "File deleted successfully"
}
```

---

#### Get Media Stats

```http
GET /media/stats
```

**Response (200 OK):**
```json
{
  "total_files": 10,
  "total_size_mb": 125.5,
  "audio_files": 7,
  "video_files": 2,
  "other_files": 1
}
```

---

## Cloud Storage Service

**Base URL:** `http://localhost:50012/api`
**Database:** cloud_db
**Technology:** FastAPI + PostgreSQL

### Endpoints

#### Health Check

```http
GET /health
```

---

#### Create Folder

```http
POST /cloud/folders
```

**Request Body:**
```json
{
  "name": "Documents",
  "parent_id": null
}
```

**Response (201 Created):**
```json
{
  "message": "Folder created successfully",
  "folder": {
    "id": 1,
    "name": "Documents",
    "parent_id": null,
    "created_at": "2025-12-07T10:30:00.000Z"
  }
}
```

---

#### Get All Folders

```http
GET /cloud/folders
```

**Response (200 OK):**
```json
{
  "folders": [
    {
      "id": 1,
      "name": "Documents",
      "parent_id": null,
      "created_at": "2025-12-07T10:30:00.000Z"
    }
  ]
}
```

---

#### Get Folder Contents

```http
GET /cloud/folder/{folder_id}
```

**Response (200 OK):**
```json
{
  "folder": {
    "id": 1,
    "name": "Documents",
    "parent_id": null
  },
  "files": [
    {
      "id": 1,
      "filename": "report.pdf",
      "file_size": 1048576,
      "uploaded_at": "2025-12-07T10:30:00.000Z"
    }
  ]
}
```

---

#### Delete Folder

```http
DELETE /cloud/folder/{folder_id}
```

**Response (200 OK):**
```json
{
  "message": "Folder deleted successfully"
}
```

---

#### Upload File

```http
POST /cloud/upload
```

**Request:** Multipart form data
```
file: <binary>
folder_id: 1 (optional)
```

**Response (201 Created):**
```json
{
  "message": "File uploaded successfully",
  "file": {
    "id": 1,
    "filename": "report.pdf",
    "original_filename": "report.pdf",
    "mime_type": "application/pdf",
    "file_size": 1048576,
    "folder_id": 1,
    "uploaded_at": "2025-12-07T10:30:00.000Z"
  }
}
```

---

#### Get All Files

```http
GET /cloud/files
```

**Query Parameters:**
- `folder_id` (optional): Filter by folder

**Response (200 OK):**
```json
{
  "files": [
    {
      "id": 1,
      "filename": "report.pdf",
      "file_size": 1048576,
      "folder_id": 1,
      "uploaded_at": "2025-12-07T10:30:00.000Z"
    }
  ],
  "total": 1
}
```

---

#### Download File

```http
GET /cloud/download/{file_id}
```

**Response:** Binary file download

---

#### Delete File

```http
DELETE /cloud/file/{file_id}
```

**Response (200 OK):**
```json
{
  "message": "File deleted successfully"
}
```

---

#### Share File

```http
POST /cloud/share/{file_id}
```

**Response (200 OK):**
```json
{
  "message": "File shared successfully",
  "share_link": "abc123def456"
}
```

---

#### Get Shared File

```http
GET /cloud/shared/{share_link}
```

**Response (200 OK):**
```json
{
  "file": {
    "id": 1,
    "filename": "report.pdf",
    "file_size": 1048576
  }
}
```

---

#### Get Storage Stats

```http
GET /cloud/stats
```

**Response (200 OK):**
```json
{
  "total_files": 25,
  "total_size_mb": 512.5,
  "total_folders": 5
}
```

---

## Dental Clinic Service

This service has been removed from the monorepo and is no longer deployed with the core stack.

## Property Management Service

**Base URL:** `http://localhost:50050/api`
**Database:** property_db
**Technology:** FastAPI + PostgreSQL

### Endpoints

#### Health Check

```http
GET /health
```

---

#### Get All Properties

```http
GET /api/properties
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Sunset Apartments",
    "address": "123 Main Street",
    "city": "Manila",
    "province": "Metro Manila",
    "country": "Philippines",
    "units_total": 20,
    "created_at": "2025-12-07T10:30:00.000Z"
  }
]
```

---

#### Create Property

```http
POST /api/properties
```

**Request Body:**
```json
{
  "name": "Sunset Apartments",
  "address": "123 Main Street",
  "city": "Manila",
  "province": "Metro Manila",
  "country": "Philippines",
  "units_total": 20
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "name": "Sunset Apartments",
  "address": "123 Main Street",
  "city": "Manila",
  "province": "Metro Manila",
  "country": "Philippines",
  "units_total": 20,
  "created_at": "2025-12-07T10:30:00.000Z"
}
```

---

#### Get All Tenants

```http
GET /api/tenants
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "full_name": "Maria Santos",
    "email": "maria@example.com",
    "phone": "+639171234567",
    "notes": null,
    "created_at": "2025-12-07T10:30:00.000Z"
  }
]
```

---

#### Create Tenant

```http
POST /api/tenants
```

**Request Body:**
```json
{
  "full_name": "Maria Santos",
  "email": "maria@example.com",
  "phone": "+639171234567",
  "notes": "Good tenant"
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "full_name": "Maria Santos",
  "email": "maria@example.com",
  "phone": "+639171234567",
  "notes": "Good tenant",
  "created_at": "2025-12-07T10:30:00.000Z"
}
```

---

#### Get All Leases

```http
GET /api/leases
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "property_id": 1,
    "tenant_id": 1,
    "unit": "A-101",
    "start_date": "2025-01-01",
    "end_date": "2025-12-31",
    "rent": 15000.00,
    "status": "active",
    "created_at": "2025-12-07T10:30:00.000Z",
    "property": {
      "id": 1,
      "name": "Sunset Apartments"
    },
    "tenant": {
      "id": 1,
      "full_name": "Maria Santos"
    }
  }
]
```

---

#### Create Lease

```http
POST /api/leases
```

**Request Body:**
```json
{
  "property_id": 1,
  "tenant_id": 1,
  "unit": "A-101",
  "start_date": "2025-01-01",
  "end_date": "2025-12-31",
  "rent": 15000.00,
  "status": "active"
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "property_id": 1,
  "tenant_id": 1,
  "unit": "A-101",
  "start_date": "2025-01-01",
  "end_date": "2025-12-31",
  "rent": 15000.00,
  "status": "active",
  "created_at": "2025-12-07T10:30:00.000Z"
}
```

---

#### Get All Maintenance Requests

```http
GET /api/maintenance
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "property_id": 1,
    "tenant_id": 1,
    "title": "Leaking faucet",
    "description": "Kitchen sink is leaking",
    "priority": "high",
    "status": "open",
    "created_at": "2025-12-07T10:30:00.000Z"
  }
]
```

---

#### Create Maintenance Request

```http
POST /api/maintenance
```

**Request Body:**
```json
{
  "property_id": 1,
  "tenant_id": 1,
  "title": "Leaking faucet",
  "description": "Kitchen sink is leaking",
  "priority": "high",
  "status": "open"
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "property_id": 1,
  "tenant_id": 1,
  "title": "Leaking faucet",
  "description": "Kitchen sink is leaking",
  "priority": "high",
  "status": "open",
  "created_at": "2025-12-07T10:30:00.000Z"
}
```

---

#### Get Dashboard Stats

```http
GET /api/dashboard
```

**Response (200 OK):**
```json
{
  "total_properties": 5,
  "total_tenants": 18,
  "active_leases": 15,
  "open_maintenance": 3,
  "total_monthly_rent": 270000.00
}
```

---

## Supply Chain Service

**Base URL:** `http://localhost:50070/api`
**Database:** supplychain_db
**Technology:** FastAPI + PostgreSQL

### Endpoints

#### Health Check

```http
GET /health
```

---

#### Get All Suppliers

```http
GET /api/suppliers
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "ABC Supplies Inc.",
    "contact_name": "John Smith",
    "phone": "+639171234567",
    "email": "john@abcsupplies.com",
    "address": "456 Industrial Ave, Quezon City",
    "created_at": "2025-12-07T10:30:00.000Z"
  }
]
```

---

#### Create Supplier

```http
POST /api/suppliers
```

**Request Body:**
```json
{
  "name": "ABC Supplies Inc.",
  "contact_name": "John Smith",
  "phone": "+639171234567",
  "email": "john@abcsupplies.com",
  "address": "456 Industrial Ave, Quezon City"
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "name": "ABC Supplies Inc.",
  "contact_name": "John Smith",
  "phone": "+639171234567",
  "email": "john@abcsupplies.com",
  "address": "456 Industrial Ave, Quezon City",
  "created_at": "2025-12-07T10:30:00.000Z"
}
```

---

#### Get All Products

```http
GET /api/products
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "sku": "PROD-001",
    "name": "Widget A",
    "description": "High quality widget",
    "supplier_id": 1,
    "unit_cost": 250.00,
    "unit": "piece",
    "reorder_level": 50,
    "reorder_quantity": 100,
    "current_stock": 75,
    "created_at": "2025-12-07T10:30:00.000Z"
  }
]
```

---

#### Create Product

```http
POST /api/products
```

**Request Body:**
```json
{
  "sku": "PROD-001",
  "name": "Widget A",
  "description": "High quality widget",
  "supplier_id": 1,
  "unit_cost": 250.00,
  "unit": "piece",
  "reorder_level": 50,
  "reorder_quantity": 100
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "sku": "PROD-001",
  "name": "Widget A",
  "description": "High quality widget",
  "supplier_id": 1,
  "unit_cost": 250.00,
  "unit": "piece",
  "reorder_level": 50,
  "reorder_quantity": 100,
  "current_stock": 0,
  "created_at": "2025-12-07T10:30:00.000Z"
}
```

---

#### Get All Purchase Orders

```http
GET /api/purchase-orders
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "reference": "PO-2025-001",
    "supplier_id": 1,
    "status": "ordered",
    "expected_date": "2025-12-20",
    "notes": "Urgent order",
    "total_amount": 25000.00,
    "created_at": "2025-12-07T10:30:00.000Z",
    "items": [
      {
        "id": 1,
        "product_id": 1,
        "quantity": 100,
        "unit_cost": 250.00
      }
    ]
  }
]
```

---

#### Create Purchase Order

```http
POST /api/purchase-orders
```

**Request Body:**
```json
{
  "reference": "PO-2025-001",
  "supplier_id": 1,
  "status": "draft",
  "expected_date": "2025-12-20",
  "notes": "Urgent order",
  "items": [
    {
      "product_id": 1,
      "quantity": 100,
      "unit_cost": 250.00
    }
  ]
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "reference": "PO-2025-001",
  "supplier_id": 1,
  "status": "draft",
  "expected_date": "2025-12-20",
  "notes": "Urgent order",
  "total_amount": 25000.00,
  "created_at": "2025-12-07T10:30:00.000Z"
}
```

---

#### Get All Shipments

```http
GET /api/shipments
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "purchase_order_id": 1,
    "carrier": "LBC",
    "tracking_number": "123456789",
    "eta": "2025-12-20",
    "status": "in_transit",
    "notes": "On the way",
    "created_at": "2025-12-07T10:30:00.000Z"
  }
]
```

---

#### Create Shipment

```http
POST /api/shipments
```

**Request Body:**
```json
{
  "purchase_order_id": 1,
  "carrier": "LBC",
  "tracking_number": "123456789",
  "eta": "2025-12-20",
  "status": "pending",
  "notes": "Standard shipping"
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "purchase_order_id": 1,
  "carrier": "LBC",
  "tracking_number": "123456789",
  "eta": "2025-12-20",
  "status": "pending",
  "notes": "Standard shipping",
  "created_at": "2025-12-07T10:30:00.000Z"
}
```

---

#### Get Inventory Movements

```http
GET /api/inventory
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "product_id": 1,
    "movement_type": "inbound",
    "quantity": 100,
    "reason": "Purchase order received",
    "reference": "PO-2025-001",
    "created_at": "2025-12-07T10:30:00.000Z"
  }
]
```

---

#### Create Inventory Movement

```http
POST /api/inventory
```

**Request Body:**
```json
{
  "product_id": 1,
  "movement_type": "inbound",
  "quantity": 100,
  "reason": "Purchase order received",
  "reference": "PO-2025-001"
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "product_id": 1,
  "movement_type": "inbound",
  "quantity": 100,
  "reason": "Purchase order received",
  "reference": "PO-2025-001",
  "created_at": "2025-12-07T10:30:00.000Z"
}
```

---

#### Get Dashboard Stats

```http
GET /api/dashboard
```

**Response (200 OK):**
```json
{
  "total_products": 25,
  "total_suppliers": 5,
  "active_purchase_orders": 3,
  "pending_shipments": 2,
  "low_stock_products": 4,
  "total_inventory_value": 500000.00
}
```

---

## Error Handling

All APIs use consistent error response format:

### Common Error Responses

#### 400 Bad Request
```json
{
  "error": "Bad Request",
  "message": "Missing required field: email"
}
```

#### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

#### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Resource not found"
}
```

#### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

---

## Authentication

### JWT Token Authentication

Most endpoints require JWT token authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Token Lifecycle

1. **Obtain Token:** Login via `/api/auth/login`
2. **Use Token:** Include in Authorization header for protected endpoints
3. **Verify Token:** Check token validity with `/api/auth/verify`
4. **Token Expiration:** Tokens expire after 24 hours
5. **Refresh:** Login again to get a new token

### Protected Endpoints

The following endpoints require authentication:
- All `/api/auth/profile` endpoints
- All `/api/auth/change-password` endpoints
- Most data modification endpoints (POST, PUT, DELETE)

### Public Endpoints

The following endpoints are public:
- `/health` (all services)
- `/api/auth/register`
- `/api/auth/login`
- `/api/cloud/shared/{share_link}`

---

## Rate Limiting

Currently, there are no rate limits implemented. However, it's recommended to implement rate limiting in production environments.

---

## CORS Configuration

All services support CORS and accept requests from any origin in development mode. Configure `ALLOWED_ORIGINS` environment variable in production.

---

## File Upload Limits

- **Media Service:** 100 MB per file
- **Cloud Service:** 100 MB per file

Supported file types vary by service. Check individual endpoint documentation for details.

---

## Database Schema

Each service has its own PostgreSQL database with the following naming convention:

- `auth_db` - Authentication service
- `media_db` - Media service
- `cloud_db` - Cloud storage service
- `property_db` - Property management service
- `supplychain_db` - Supply chain service

---

## Support

For API support or to report issues:
- Email: qhitz@qhitz.com
- GitHub: https://github.com/qhitz/qhitz-app

---

**Copyright © 2025 Qhitz. All rights reserved.**
