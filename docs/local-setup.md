# Labour Connect — Local Setup & Development Guide

## Prerequisites
1. **Operating System**: Windows 10/11, macOS, or Linux.
2. **Java Runtime**: JDK 21 (Microsoft OpenJDK 21 or Eclipse Temurin 21).
3. **Node.js**: v18.x, v20.x, or v24.x and npm (v10+).
4. **PostgreSQL**: PostgreSQL 15 or 16 running locally on port 5432.
5. **Maven**: Maven 3.9+ (or use the workspace Maven binary `.tools/apache-maven-3.9.6/bin/mvn.cmd`).

---

## 1. Database Setup

### Create Database
Ensure the PostgreSQL server is running. You can create the database using `psql` or pgAdmin:

```sql
CREATE DATABASE labour_connect;
```

Or run the provided setup script from PowerShell:
```powershell
.\database\scripts\setup-db.ps1
```

### Schema Initialization
Schema creation is automated via **Flyway Migrations** on backend startup. When the Spring Boot application launches, it executes:
- `V1__init_schema.sql` (Creates all tables, constraints, foreign keys, indexes)
- `V2__seed_reference_data.sql` (Inserts initial skills, service categories, and sample seed profiles)

---

## 2. Environment Configuration

### Backend Configuration
Create `backend/.env` (or set environment variables in your terminal) using `backend/.env.example`:
```ini
DB_URL=jdbc:postgresql://localhost:5432/labour_connect
DB_USERNAME=postgres
DB_PASSWORD=your_actual_postgres_password
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long_12345
SERVER_PORT=8080
```

### Frontend Configuration
Create `frontend/.env` using `frontend/.env.example`:
```ini
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

---

## 3. Running the Backend

From the project root:
```powershell
# Using the workspace Maven
cd backend
..\.tools\apache-maven-3.9.6\bin\mvn.cmd spring-boot:run
```

Or from `backend/`:
```bash
mvn spring-boot:run
```
The backend starts at `http://localhost:8080`.
API documentation is accessible at `http://localhost:8080/swagger-ui/index.html` (when enabled).

---

## 4. Running the Frontend

From the `frontend/` directory:
```powershell
cd frontend
npm install
npm run dev
```
The frontend starts at `http://localhost:5173`. Open this URL in your web browser.

---

## 5. Development Seed Accounts
For convenient local testing, sample seed accounts are provisioned via `V2__seed_reference_data.sql`:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@labourconnect.com` | `Admin@1234` |
| **Employer** | `employer@labourconnect.com` | `Employer@1234` |
| **Worker** | `worker@labourconnect.com` | `Worker@1234` |
| **Customer** | `customer@labourconnect.com` | `Customer@1234` |
| **Provider** | `provider@labourconnect.com` | `Provider@1234` |

*(Note: Change these passwords immediately in production environments!)*
