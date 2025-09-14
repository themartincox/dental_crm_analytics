# AES CRM System Architecture

## High-Level System Overview

```mermaid
graph TB
    subgraph "Client Layer"
        A[Marketing Website<br/>aescrm.com] --> B[Pricing Page<br/>/pricing]
        A --> C[Waitlist Form<br/>Lead Capture]
        A --> D[Get Started Gateway<br/>/get-started]
    end
    
    subgraph "Authentication & Authorization"
        E[Supabase Auth<br/>JWT Tokens] --> F[Role-Based Access Control<br/>RBAC]
        F --> G[Permission System<br/>Module Access]
    end
    
    subgraph "Multi-Tenant SaaS Platform"
        H[System Owner Admin<br/>/admin] --> I[Client Management<br/>Organizations]
        I --> J[User Management<br/>Seat Allocation]
        J --> K[Module Permissions<br/>Feature Access]
    end
    
    subgraph "Core CRM Application"
        L[Dental CRM Dashboard<br/>/dashboard] --> M[Patient Management]
        L --> N[Appointment Scheduling]
        L --> O[Lead Management]
        L --> P[Analytics & Reporting]
    end
    
    subgraph "Data Layer"
        Q[Supabase PostgreSQL<br/>Multi-tenant DB] --> R[Client Organizations]
        Q --> S[User Profiles]
        Q --> T[Patient Records]
        Q --> U[Appointments]
        Q --> V[Leads & Marketing]
    end
    
    subgraph "External Integrations"
        W[Payment Processing<br/>Stripe/PayPal] --> X[Billing System]
        Y[Email/SMS Services<br/>Twilio/SendGrid] --> Z[Communication Hub]
        AA[Calendar Integration<br/>Google/Outlook] --> BB[Scheduling Sync]
    end
    
    A --> E
    D --> E
    E --> H
    E --> L
    H --> Q
    L --> Q
    L --> W
    L --> Y
    L --> AA
```

## Detailed Component Architecture

```mermaid
graph TB
    subgraph "Frontend Application (React + Vite)"
        subgraph "Public Pages"
            A1[Marketing Landing<br/>AES CRM Branding]
            A2[Pricing Calculator<br/>Interactive Tool]
            A3[Waitlist Form<br/>Lead Capture]
            A4[Get Started Gateway<br/>Onboarding]
        end
        
        subgraph "Authentication"
            B1[Login Page<br/>Supabase Auth]
            B2[OAuth Callback<br/>Social Login]
            B3[Auth Context<br/>State Management]
        end
        
        subgraph "Admin Dashboard (System Owner)"
            C1[Client Management<br/>CRUD Operations]
            C2[User Management<br/>Seat Allocation]
            C3[Permission Management<br/>Module Access]
            C4[Revenue Analytics<br/>Pricing Calculator]
            C5[System Metrics<br/>Health Monitoring]
        end
        
        subgraph "Client CRM Application"
            D1[Dental Dashboard<br/>Practice Overview]
            D2[Patient Management<br/>Records & History]
            D3[Appointment Scheduler<br/>Calendar Integration]
            D4[Lead Management<br/>Conversion Tracking]
            D5[Analytics Dashboards<br/>Performance Metrics]
            D6[Membership Management<br/>Programs & Benefits]
            D7[Widget Configuration<br/>Embeddable Tools]
            D8[Compliance Monitoring<br/>GDPR & Security]
        end
        
        subgraph "Shared Components"
            E1[Error Boundaries<br/>Error Handling]
            E2[Virtualized Lists<br/>Performance]
            E3[Form Validation<br/>Data Sanitization]
            E4[Pricing Calculator<br/>Cost Estimation]
        end
    end
    
    subgraph "Backend Services (Node.js + Express)"
        F1[API Gateway<br/>Request Routing]
        F2[Authentication Middleware<br/>JWT Validation]
        F3[RBAC Middleware<br/>Permission Checking]
        F4[Validation Middleware<br/>Input Sanitization]
        F5[Rate Limiting<br/>Security Protection]
    end
    
    subgraph "Database Layer (Supabase PostgreSQL)"
        G1[Client Organizations<br/>Multi-tenant Data]
        G2[User Profiles<br/>Role & Permissions]
        G3[Patient Records<br/>Clinical Data]
        G4[Appointments<br/>Scheduling Data]
        G5[Leads & Marketing<br/>Conversion Data]
        G6[System Modules<br/>Feature Registry]
        G7[Audit Logs<br/>Security Tracking]
        G8[Pricing Data<br/>Billing Information]
    end
    
    subgraph "External Services"
        H1[Supabase Auth<br/>Authentication]
        H2[Payment Gateway<br/>Billing Processing]
        H3[Email Service<br/>Communication]
        H4[SMS Service<br/>Notifications]
        H5[Calendar APIs<br/>Scheduling Sync]
    end
    
    A1 --> B1
    A2 --> B1
    A3 --> B1
    A4 --> B1
    B1 --> B3
    B3 --> C1
    B3 --> D1
    C1 --> F1
    D1 --> F1
    F1 --> G1
    F1 --> H1
    D1 --> H2
    D1 --> H3
    D1 --> H4
    D3 --> H5
```

## Data Flow Architecture

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as Auth Service
    participant M as Middleware
    participant D as Database
    participant E as External Services
    
    Note over U,E: User Registration & Onboarding
    U->>F: Visit Marketing Site
    F->>U: Show Pricing Calculator
    U->>F: Submit Waitlist Form
    F->>D: Store Lead Data
    U->>F: Request Demo/Quote
    F->>E: Send Email Notification
    
    Note over U,E: Client Onboarding (System Owner)
    U->>F: Login as System Owner
    F->>A: Authenticate User
    A->>F: Return JWT Token
    F->>M: Create New Client
    M->>D: Store Client Organization
    M->>D: Set Module Permissions
    M->>D: Create Initial Users
    M->>E: Send Welcome Email
    
    Note over U,E: Client User Login
    U->>F: Login as Client User
    F->>A: Authenticate with Supabase
    A->>F: Return User Profile + Role
    F->>M: Check Module Permissions
    M->>D: Validate Access Rights
    M->>F: Return Authorized Features
    F->>U: Show CRM Dashboard
    
    Note over U,E: Daily CRM Operations
    U->>F: Manage Patients/Appointments
    F->>M: Validate Request
    M->>D: Update Database
    M->>E: Send Notifications (if needed)
    F->>U: Show Updated Data
    
    Note over U,E: Billing & Analytics
    F->>M: Calculate Monthly Billing
    M->>D: Query Usage Data
    M->>E: Process Payment
    M->>D: Update Billing Records
    F->>U: Show Revenue Analytics
```

## Multi-Tenant Data Architecture

```mermaid
erDiagram
    CLIENT_ORGANIZATIONS {
        uuid id PK
        string organization_name
        string organization_type
        string status
        string subscription_tier
        string contact_email
        string contact_phone
        jsonb billing_address
        integer max_users
        integer total_users
        jsonb pricing_info
        decimal installation_fee
        decimal monthly_cost
        timestamp free_trial_ends_at
        timestamp created_at
        timestamp updated_at
    }
    
    USER_PROFILES {
        uuid id PK
        string email
        string full_name
        string role
        boolean is_active
        string phone
        uuid client_organization_id FK
        timestamp created_at
        timestamp updated_at
    }
    
    CLIENT_MODULE_PERMISSIONS {
        uuid id PK
        uuid client_organization_id FK
        string module_name
        string permission_level
        boolean is_enabled
        integer usage_quota
        integer usage_count
        timestamp expires_at
        timestamp granted_at
    }
    
    PATIENTS {
        uuid id PK
        string first_name
        string last_name
        string email
        string phone
        date date_of_birth
        string patient_status
        uuid practice_location_id FK
        uuid assigned_dentist_id FK
        uuid client_organization_id FK
        timestamp created_at
        timestamp updated_at
    }
    
    APPOINTMENTS {
        uuid id PK
        date appointment_date
        time start_time
        time end_time
        string status
        string treatment_type
        text notes
        uuid patient_id FK
        uuid dentist_id FK
        uuid practice_location_id FK
        uuid client_organization_id FK
        timestamp created_at
        timestamp updated_at
    }
    
    LEADS {
        uuid id PK
        string first_name
        string last_name
        string email
        string phone
        string lead_source
        string lead_status
        string interest_level
        decimal estimated_value
        text notes
        uuid client_organization_id FK
        timestamp created_at
        timestamp updated_at
    }
    
    SYSTEM_OWNER_AUDIT_LOG {
        uuid id PK
        string action_type
        uuid performed_by_id FK
        uuid target_client_id FK
        uuid target_user_id FK
        jsonb details
        timestamp created_at
    }
    
    CLIENT_ORGANIZATIONS ||--o{ USER_PROFILES : "has users"
    CLIENT_ORGANIZATIONS ||--o{ CLIENT_MODULE_PERMISSIONS : "has permissions"
    CLIENT_ORGANIZATIONS ||--o{ PATIENTS : "manages"
    CLIENT_ORGANIZATIONS ||--o{ APPOINTMENTS : "schedules"
    CLIENT_ORGANIZATIONS ||--o{ LEADS : "tracks"
    USER_PROFILES ||--o{ SYSTEM_OWNER_AUDIT_LOG : "performs actions"
```

## Security & Access Control Flow

```mermaid
graph TB
    subgraph "Authentication Layer"
        A[User Login] --> B[Supabase Auth]
        B --> C[JWT Token Generation]
        C --> D[Token Validation]
    end
    
    subgraph "Authorization Layer"
        D --> E[Role Extraction]
        E --> F[Permission Lookup]
        F --> G[Module Access Check]
        G --> H[Client Organization Validation]
    end
    
    subgraph "Data Access Layer"
        H --> I[Row Level Security]
        I --> J[Client Data Isolation]
        J --> K[Feature Access Control]
        K --> L[API Response]
    end
    
    subgraph "Audit & Monitoring"
        M[Action Logging] --> N[Security Events]
        N --> O[Compliance Tracking]
        O --> P[System Health Monitoring]
    end
    
    L --> M
    H --> M
```

## Pricing & Billing Architecture

```mermaid
graph TB
    subgraph "Pricing Engine"
        A[Pricing Service] --> B[Seat Calculator]
        B --> C[Installation Fee: £1,000]
        B --> D[Included Seats: 2 Free]
        B --> E[Additional Seats: £50/month]
    end
    
    subgraph "Billing System"
        F[Client Creation] --> G[Pricing Calculation]
        G --> H[Free Trial Setup]
        H --> I[Monthly Billing Cycle]
        I --> J[Payment Processing]
    end
    
    subgraph "Revenue Analytics"
        K[Usage Tracking] --> L[Revenue Calculation]
        L --> M[ROI Analysis]
        M --> N[System Metrics]
    end
    
    A --> F
    F --> K
    J --> K
```

## Integration Points

```mermaid
graph LR
    subgraph "AES CRM Core"
        A[React Frontend]
        B[Node.js Backend]
        C[Supabase Database]
    end
    
    subgraph "External Integrations"
        D[Supabase Auth]
        E[Payment Gateway]
        F[Email Service]
        G[SMS Service]
        H[Calendar APIs]
        I[Analytics Tools]
    end
    
    subgraph "Client Systems"
        J[Practice Websites]
        K[Existing PMS]
        L[Accounting Software]
        M[Marketing Tools]
    end
    
    A --> D
    A --> E
    A --> F
    A --> G
    A --> H
    B --> C
    B --> D
    A --> J
    A --> K
    A --> L
    A --> M
```

## System Deployment Architecture

```mermaid
graph TB
    subgraph "Production Environment"
        A[CDN<br/>Static Assets] --> B[Load Balancer]
        B --> C[React App<br/>Vite Build]
        B --> D[API Server<br/>Node.js/Express]
        D --> E[Supabase<br/>PostgreSQL + Auth]
    end
    
    subgraph "Development Environment"
        F[Local Development<br/>Vite Dev Server]
        G[Supabase Local<br/>Development DB]
        H[Testing Suite<br/>Vitest + Jest]
    end
    
    subgraph "CI/CD Pipeline"
        I[GitHub Actions<br/>Automated Testing]
        J[Build Process<br/>Vite Production Build]
        K[Deployment<br/>Automatic Deploy]
    end
    
    F --> G
    F --> H
    I --> J
    J --> K
    K --> A
```

## Key Integration Points

1. **Authentication**: Supabase Auth with JWT tokens
2. **Database**: PostgreSQL with Row Level Security
3. **Payments**: Stripe/PayPal integration
4. **Communications**: Email/SMS services
5. **Scheduling**: Calendar API integrations
6. **Analytics**: Built-in reporting and external tools
7. **Multi-tenancy**: Client data isolation
8. **Security**: RBAC, audit logging, encryption

This architecture provides a scalable, secure, and maintainable SaaS platform for dental practices with comprehensive client management capabilities.
