# AES CRM API Documentation

## Overview

The AES CRM API provides comprehensive endpoints for managing dental practices, patients, appointments, leads, and multi-tenant client organizations. This RESTful API is built with Node.js/Express and uses Supabase for authentication and data storage.

## Base URL

```
Production: https://api.aescrm.com
Development: http://localhost:3001
```

## Authentication

All API endpoints require authentication using JWT tokens from Supabase Auth.

### Headers Required

```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Getting an Access Token

```javascript
// Client-side authentication
import { supabase } from './lib/supabase';

const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
});

const token = data.session.access_token;
```

## Rate Limiting

- **Standard endpoints**: 100 requests per minute per user
- **Bulk operations**: 10 requests per minute per user
- **File uploads**: 5 requests per minute per user

## Error Handling

All errors follow a consistent format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": "Additional error details",
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `UNAUTHORIZED` | 401 | Invalid or missing authentication token |
| `FORBIDDEN` | 403 | Insufficient permissions for this operation |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `RATE_LIMITED` | 429 | Rate limit exceeded |
| `SERVER_ERROR` | 500 | Internal server error |

## Endpoints

### Authentication

#### POST /auth/login
Authenticate a user and return access token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "role": "dentist",
      "organization_id": "uuid"
    },
    "access_token": "jwt_token",
    "expires_at": "2024-01-01T00:00:00Z"
  }
}
```

#### POST /auth/logout
Logout current user and invalidate token.

**Response:**
```json
{
  "message": "Successfully logged out"
}
```

### User Management

#### GET /users
Get all users in the organization (admin only).

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `role` (optional): Filter by role
- `search` (optional): Search by name or email

**Response:**
```json
{
  "data": {
    "users": [
      {
        "id": "uuid",
        "email": "user@example.com",
        "first_name": "John",
        "last_name": "Doe",
        "role": "dentist",
        "status": "active",
        "created_at": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "pages": 5
    }
  }
}
```

#### POST /users
Create a new user (admin only).

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "first_name": "Jane",
  "last_name": "Smith",
  "role": "receptionist",
  "permissions": ["patients:read", "appointments:read"]
}
```

#### PUT /users/:id
Update user information (admin or self).

**Request Body:**
```json
{
  "first_name": "Updated Name",
  "role": "dentist",
  "permissions": ["patients:read", "patients:write"]
}
```

#### DELETE /users/:id
Delete a user (admin only).

### Patient Management

#### GET /patients
Get all patients in the organization.

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `search` (optional): Search by name, email, or phone
- `status` (optional): Filter by status (active, inactive, archived)
- `sort` (optional): Sort field (name, created_at, last_visit)
- `order` (optional): Sort order (asc, desc)

**Response:**
```json
{
  "data": {
    "patients": [
      {
        "id": "uuid",
        "first_name": "John",
        "last_name": "Doe",
        "email": "john@example.com",
        "phone": "+1234567890",
        "date_of_birth": "1990-01-01",
        "status": "active",
        "created_at": "2024-01-01T00:00:00Z",
        "last_visit": "2024-01-15T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 500,
      "pages": 25
    }
  }
}
```

#### POST /patients
Create a new patient.

**Request Body:**
```json
{
  "first_name": "Jane",
  "last_name": "Smith",
  "email": "jane@example.com",
  "phone": "+1234567890",
  "date_of_birth": "1985-05-15",
  "address": {
    "street": "123 Main St",
    "city": "London",
    "postcode": "SW1A 1AA",
    "country": "UK"
  },
  "emergency_contact": {
    "name": "Emergency Contact",
    "phone": "+1234567890",
    "relationship": "Spouse"
  },
  "medical_history": "No known allergies",
  "notes": "Patient notes"
}
```

#### GET /patients/:id
Get patient details by ID.

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "date_of_birth": "1990-01-01",
    "address": {
      "street": "123 Main St",
      "city": "London",
      "postcode": "SW1A 1AA",
      "country": "UK"
    },
    "emergency_contact": {
      "name": "Emergency Contact",
      "phone": "+1234567890",
      "relationship": "Spouse"
    },
    "medical_history": "No known allergies",
    "notes": "Patient notes",
    "status": "active",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-15T00:00:00Z",
    "appointments": [
      {
        "id": "uuid",
        "date": "2024-01-20T10:00:00Z",
        "duration": 60,
        "status": "scheduled",
        "treatment": "Cleaning"
      }
    ]
  }
}
```

#### PUT /patients/:id
Update patient information.

#### DELETE /patients/:id
Archive a patient (soft delete).

### Appointment Management

#### GET /appointments
Get all appointments.

**Query Parameters:**
- `date_from` (optional): Start date filter
- `date_to` (optional): End date filter
- `status` (optional): Filter by status
- `patient_id` (optional): Filter by patient
- `staff_id` (optional): Filter by staff member

**Response:**
```json
{
  "data": {
    "appointments": [
      {
        "id": "uuid",
        "patient_id": "uuid",
        "staff_id": "uuid",
        "date": "2024-01-20T10:00:00Z",
        "duration": 60,
        "status": "scheduled",
        "treatment": "Cleaning",
        "notes": "Regular cleaning appointment",
        "created_at": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

#### POST /appointments
Create a new appointment.

**Request Body:**
```json
{
  "patient_id": "uuid",
  "staff_id": "uuid",
  "date": "2024-01-20T10:00:00Z",
  "duration": 60,
  "treatment": "Cleaning",
  "notes": "Regular cleaning appointment"
}
```

#### PUT /appointments/:id
Update an appointment.

#### DELETE /appointments/:id
Cancel an appointment.

### Lead Management

#### GET /leads
Get all leads.

**Query Parameters:**
- `status` (optional): Filter by status
- `source` (optional): Filter by source
- `assigned_to` (optional): Filter by assigned staff

**Response:**
```json
{
  "data": {
    "leads": [
      {
        "id": "uuid",
        "first_name": "Jane",
        "last_name": "Smith",
        "email": "jane@example.com",
        "phone": "+1234567890",
        "source": "website",
        "status": "new",
        "assigned_to": "uuid",
        "estimated_value": 5000,
        "notes": "Interested in cosmetic dentistry",
        "created_at": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

#### POST /leads
Create a new lead.

#### PUT /leads/:id
Update lead information.

#### POST /leads/:id/convert
Convert a lead to a patient.

### Analytics & Reporting

#### GET /analytics/dashboard
Get dashboard analytics.

**Response:**
```json
{
  "data": {
    "total_patients": 500,
    "total_appointments": 1200,
    "total_revenue": 150000,
    "conversion_rate": 0.15,
    "monthly_stats": {
      "new_patients": 25,
      "appointments": 100,
      "revenue": 25000
    }
  }
}
```

#### GET /analytics/reports/:type
Get specific reports.

**Types:**
- `revenue`
- `patients`
- `appointments`
- `leads`
- `performance`

### Client Organization Management (System Owner)

#### GET /admin/clients
Get all client organizations (system owner only).

**Response:**
```json
{
  "data": {
    "clients": [
      {
        "id": "uuid",
        "name": "Dental Practice Ltd",
        "status": "active",
        "total_users": 5,
        "pricing_info": {
          "installation_fee": 1000,
          "monthly_cost": 150,
          "included_seats": 2,
          "additional_seats": 3
        },
        "created_at": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

#### POST /admin/clients
Create a new client organization.

**Request Body:**
```json
{
  "name": "New Dental Practice",
  "contact_email": "admin@practice.com",
  "total_users": 3,
  "modules": ["patients", "appointments", "leads"],
  "billing_info": {
    "billing_email": "billing@practice.com",
    "billing_address": "123 Practice St, London"
  }
}
```

#### PUT /admin/clients/:id
Update client organization.

#### DELETE /admin/clients/:id
Deactivate client organization.

### File Upload

#### POST /upload
Upload files (images, documents).

**Request:** Multipart form data
- `file`: File to upload
- `type`: File type (patient_photo, document, etc.)
- `patient_id`: Associated patient ID (optional)

**Response:**
```json
{
  "data": {
    "file_id": "uuid",
    "url": "https://storage.supabase.co/object/public/files/uuid",
    "filename": "original_filename.jpg",
    "size": 1024000,
    "type": "image/jpeg"
  }
}
```

## Webhooks

### Payment Webhooks

#### POST /webhooks/stripe
Handle Stripe payment events.

**Headers:**
```http
Stripe-Signature: t=timestamp,v1=signature
```

### Calendar Webhooks

#### POST /webhooks/calendar
Handle calendar sync events.

## SDKs and Libraries

### JavaScript/TypeScript

```bash
npm install @aescrm/sdk
```

```javascript
import { AesCrmClient } from '@aescrm/sdk';

const client = new AesCrmClient({
  apiKey: 'your_api_key',
  baseUrl: 'https://api.aescrm.com'
});

// Get patients
const patients = await client.patients.list();
```

### Python

```bash
pip install aescrm-sdk
```

```python
from aescrm import AesCrmClient

client = AesCrmClient(
    api_key='your_api_key',
    base_url='https://api.aescrm.com'
)

# Get patients
patients = client.patients.list()
```

## Support

- **Documentation**: https://docs.aescrm.com
- **Support Email**: hello@postino.cc
- **Status Page**: https://status.aescrm.com
- **API Status**: https://api.aescrm.com/health

## Changelog

### v1.0.0 (2024-01-01)
- Initial API release
- Patient management
- Appointment scheduling
- Lead management
- Analytics dashboard
- Multi-tenant support
