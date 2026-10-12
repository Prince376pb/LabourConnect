# Labour Connect — Deployment & Production Operations

## 1. Production Architecture
In production, Labour Connect is deployed with separate tiers:
- **Frontend**: Static files built by Vite (`dist/`) hosted on AWS S3 + CloudFront, Vercel, Netlify, or Nginx.
- **Backend**: Containerized Spring Boot service running on Docker / AWS ECS / Render / Fly.io / Kubernetes.
- **Database**: Managed PostgreSQL instance (AWS RDS, Supabase, Neon, or Railway PostgreSQL) with automated backups and SSL enabled.

```mermaid
flowchart LR
    Browser["Client Browser"] --> CDN["CloudFront / CDN (HTTPS)"]
    CDN --> Frontend["React Static Assets"]
    Browser -->|API Calls (HTTPS)| LB["Reverse Proxy / Nginx / Load Balancer"]
    LB --> SpringBoot["Spring Boot Containers (Java 21)"]
    SpringBoot --> RDS[("Managed PostgreSQL (SSL Enforced)")]
```

---

## 2. Production Build Commands

### Frontend Production Build
```bash
cd frontend
npm install --frozen-lockfile
npm run build
```
Generates production-optimized static bundle in `frontend/dist/`.

### Backend Production Build
```bash
cd backend
mvn clean package -DskipTests
```
Generates executable production jar in `backend/target/labourconnect-backend-1.0.0.jar`.

---

## 3. Production Environment Variables
| Variable | Description | Example / Required Value |
|----------|-------------|--------------------------|
| `DB_URL` | PostgreSQL JDBC connection URL | `jdbc:postgresql://db.host.com:5432/labour_connect?sslmode=require` |
| `DB_USERNAME` | Database user | `labour_app_user` |
| `DB_PASSWORD` | Strong database password | `[Secret]` |
| `JWT_SECRET` | 256-bit cryptographically secure key | `[Secret at least 32 characters]` |
| `CORS_ALLOWED_ORIGINS` | Trusted frontend domains | `https://labourconnect.com,https://app.labourconnect.com` |
| `SERVER_PORT` | HTTP port | `8080` |

---

## 4. Security Hardening Checklist for Production
1. Enforce HTTPS across all frontend and API endpoints.
2. Restrict PostgreSQL network access (bind exclusively to internal VPC / private subnets).
3. Disable Swagger UI and management endpoints in production profile (`spring.profiles.active=prod`).
4. Ensure default development seed credentials are never loaded or are replaced before launch.
5. Configure automated database snapshots and WAL archiving for point-in-time recovery.
