# Labour Connect — Digital Platform for Skilled Employment and On-Demand Local Services

Labour Connect is a production-grade, full-stack enterprise web application engineered to bridge daily wage skilled workers, employers/contractors, local customers, and verified on-demand service providers within localized urban and semi-urban communities.

---

## 1. System Architecture

The project is structured as a maintainable monorepo adhering strictly to clean architecture principles:

```
LabourConnectProject/
├── backend/                  # Java 21 LTS + Spring Boot 3.3.4 Enterprise REST API
│   ├── src/main/java/com/labourconnect/
│   │   ├── config/           # CORS, Security, Swagger OpenAPI, Seed Runner
│   │   ├── controller/       # 11 Thin REST Controllers (/api/v1/*)
│   │   ├── dto/              # 27 DTOs with Jakarta Bean Validation
│   │   ├── entity/           # 14 JPA Hibernate Entities
│   │   ├── exception/        # Custom Exception Hierarchy & Global Handler
│   │   ├── repository/       # 14 Spring Data JPA Repositories
│   │   ├── security/         # JWT Provider, Auth Filter, SecurityConfig
│   │   └── service/          # Business logic, transactional workflows
│   ├── src/main/resources/
│   │   ├── application.yml   # Production-ready configuration
│   │   └── db/migration/     # Flyway SQL migrations (V1__init, V2__seed)
│   ├── pom.xml               # Maven configuration
│   └── .env.example          # Environment variables template
├── frontend/                 # React 18 + Vite + Tailwind CSS SPA
│   ├── src/
│   │   ├── components/common/# Reusable UI library (Button, Modal, Card, etc.)
│   │   ├── context/          # AuthContext (JWT) and ToastContext (alerts)
│   │   ├── features/         # Modular feature pages by business domain
│   │   │   ├── admin/        # Admin dashboard, users, verifications, audit
│   │   │   ├── employers/    # Job posting, applicant review, worker search
│   │   │   ├── workers/      # Application tracking, profile & skill setup
│   │   │   ├── customers/    # Service booking, request tracking, complaints
│   │   │   ├── providers/    # Dispatch incoming, lifecycle management, badge
│   │   │   ├── jobs/         # Public job board, search, details
│   │   │   ├── services/     # Category discovery, provider cards, booking
│   │   │   ├── reviews/      # 5-star rating & review modal
│   │   │   └── complaints/   # Dispute resolution modal
│   │   ├── layouts/          # MainLayout (public) and DashboardLayout (sidebar)
│   │   ├── routes/           # ProtectedRoute and AppRoutes
│   │   └── services/         # Axios client with automatic bearer interceptor
│   ├── package.json
│   └── vite.config.js
├── database/                 # Database administration scripts
│   ├── init-db.sql           # Database & user creation script
│   ├── setup-db.ps1          # Automated PowerShell database setup
│   ├── backup-db.ps1         # Logical pg_dump backup script
│   └── restore-db.ps1        # Database restore script
└── docs/                     # Comprehensive architecture documentation
    ├── architecture.md       # High-level architecture & sequence flows
    ├── database-design.md    # Normalized ER schema & constraints
    ├── api-documentation.md  # Complete REST API specification
    ├── security.md           # JWT auth, RBAC & security checklist
    ├── local-setup.md        # Step-by-step developer setup guide
    ├── deployment.md         # Production deployment guidelines
    ├── testing.md            # Automated & manual testing plans
    └── implementation-status.md # Complete milestone tracking checklist
```

---

## 2. Core Functional Modules & Roles

### Five Principal Roles
1. **Admin (`ROLE_ADMIN`)**: System-wide governance, user activation/suspension, service provider credential verification decisions, service catalog management, dispute resolution, and security audit logs.
2. **Employer / Shopkeeper (`ROLE_EMPLOYER`)**: Posts short-term or daily jobs, sets wage budgets (Daily/Hourly/Fixed), reviews applicant applications, hires workers, marks jobs completed, and leaves worker performance reviews.
3. **Skilled Worker (`ROLE_WORKER`)**: Maintains skills profile, sets daily wage rates, browses open jobs with keyword/location filtering, submits job applications with notes, and tracks application statuses.
4. **Customer (`ROLE_CUSTOMER`)**: Discovers localized service categories (Plumbing, Electrical, Carpentry, etc.), books on-demand service requests with schedule & address, tracks provider dispatch, submits reviews, and files complaints if disputes arise.
5. **Service Provider (`ROLE_PROVIDER`)**: Manages hourly rates and service categories, receives real-time service requests, transitions status (`ACCEPTED` → `ON_THE_WAY` → `SERVICE_STARTED` → `COMPLETED`), uploads government ID and certification for Admin verification badge.

---

## 3. Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS 3.4, React Router v6, Axios, Lucide Icons.
- **Backend**: Java 21 LTS, Spring Boot 3.3.4, Spring Security 6 (stateless JWT), Spring Data JPA, Hibernate, Flyway Migration, Jakarta Bean Validation.
- **Database**: PostgreSQL 16 on `localhost:5432`, database: `labour_connect`.
- **API Documentation**: OpenAPI 3.0 / Swagger UI (`/swagger-ui.html`).
- **Build Tools**: Apache Maven 3.9.6 (embedded in `.tools/apache-maven-3.9.6/` for Windows reliability), Node.js v24.18.0 / npm v11.16.0.

---

## 4. Local Setup & Installation

### Step 1: PostgreSQL Database Initialization
Ensure PostgreSQL is running locally on port 5432.
Run the PowerShell setup script or use `psql`:

```powershell
# Option A: Run the automated helper (prompts securely for PostgreSQL superuser password)
cd database
.\setup-db.ps1

# Option B: Run manually via psql
psql -U postgres -h localhost -p 5432 -f database/init-db.sql
```

### Step 2: Configure Backend Environment
Create `backend/.env` (or set environment variables):
```env
DB_URL=jdbc:postgresql://localhost:5432/labour_connect
DB_USERNAME=postgres
DB_PASSWORD=your_actual_postgres_password
JWT_SECRET=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
JWT_EXPIRATION_MS=86400000
SERVER_PORT=8080
```

### Step 3: Start the Spring Boot Backend
From the workspace root, run the bundled Maven wrapper:
```powershell
cd backend
..\.tools\apache-maven-3.9.6\bin\mvn.cmd spring-boot:run
```
*Note: Flyway automatically applies all database schema migrations (`V1__init_schema.sql`, `V2__seed_reference_data.sql`), and `DataInitializerRunner` seeds default demo accounts on first boot.*

### Step 4: Start the React Frontend
In a separate terminal:
```powershell
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 5. Pre-Configured Demo Accounts

For rapid end-to-end evaluation, the system automatically initializes the following verified test accounts with pre-populated demo data:

| Role | Email Address | Password | Description |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin@labourconnect.com` | `Admin@12345` | Governance, dispute resolution, verifications |
| **Employer** | `employer@greenbuild.com` | `Employer@12345` | GreenBuild Constructions, active job postings |
| **Worker** | `worker.rajesh@gmail.com` | `Worker@12345` | Rajesh Kumar, Master Mason & Tiler (5 yrs exp) |
| **Customer** | `customer.anita@gmail.com` | `Customer@12345` | Anita Sharma, residential homeowner |
| **Service Provider** | `provider.suresh@gmail.com` | `Provider@12345` | Suresh Electrician & Repairs, Verified Badge |

*(The login page includes convenient 1-click "Quick Fill" demo buttons for all roles).*

---

## 6. Running Automated Tests & Verification

### Backend Automated Unit & Integration Tests:
```powershell
cd backend
..\.tools\apache-maven-3.9.6\bin\mvn.cmd test
```
*Executes unit and integration test suites covering authentication, job workflows, on-demand dispatch lifecycles, and review computations (9 tests run, 0 failures, 0 errors).*

### Frontend Production Build Verification:
```powershell
cd frontend
npm run build
```
*Validates zero TypeScript/JSX errors, Tailwind tree-shaking, and bundling efficiency.*

---

## 7. Database Backups and Recovery

PowerShell automation scripts are included under `database/`:
```powershell
# Create logical backup
.\database\backup-db.ps1 -BackupDir ".\database\backups"

# Restore from a backup archive
.\database\restore-db.ps1 -BackupFile ".\database\backups\labour_connect_YYYYMMDD_HHMMSS.sql"
```

---

## 8. License & Commercial Readiness

This software is developed for commercial deployment under proprietary license. All database entities, API endpoints, role safeguards, and input validation schemas comply with standard digital platform security regulations.
