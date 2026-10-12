# Labour Connect — Security, Privacy & Authorization Architecture

## 1. Security Overview
Security is an architectural pillar of Labour Connect. The application implements defense-in-depth across the presentation, application, and persistence layers.

---

## 2. Authentication & Credential Storage
- **Password Hashing**: Passwords are never stored in plaintext. Passwords are salted and hashed using **BCrypt** with an adaptive work factor (12 rounds).
- **JWT (JSON Web Token)**:
  - Cryptographically signed with HMAC-SHA256 using a minimum 256-bit secure key.
  - Secret keys are injected strictly via environment variable `JWT_SECRET` and are never committed to version control.
  - Short token expiry (24 hours default, configurable) with mandatory expiration validation on every request.
- **Account State Verification**:
  - Suspended (`is_suspended = true`) or inactive (`is_active = false`) users are strictly rejected at authentication and filter levels.

---

## 3. Role-Based & Object-Level Access Control (RBAC & ABAC)
1. **Never Trust Public Registration**:
   - The public registration endpoint only accepts legitimate client roles: `ROLE_EMPLOYER`, `ROLE_WORKER`, `ROLE_CUSTOMER`, or `ROLE_PROVIDER`.
   - The `ROLE_ADMIN` cannot be registered publicly. Attempting to pass `ROLE_ADMIN` in public registration triggers a validation rejection.
2. **Method-Level Security**:
   - Every protected Spring controller method is annotated with `@PreAuthorize("hasRole('...')")`.
3. **Object-Level Authorization**:
   - When updating or deleting an entity (e.g. updating a job post, approving an application, modifying a service request), the service layer validates that the authenticated principal matches the entity owner or possesses `ROLE_ADMIN` authority.
   - Workers cannot view or modify other workers' private data or advance their own applications.
   - Customers cannot view other customers' private requests.
   - Providers cannot accept or modify requests not assigned to them.

---

## 4. Initial Secure Admin Provisioning
- The initial platform administrator is **NOT** pre-packaged with hardcoded, predictable default credentials.
- Provisioning is performed via an automated startup runner or administrative CLI script (`database/scripts/init-admin.bat` or environment parameters `ADMIN_INIT_EMAIL` and `ADMIN_INIT_PASSWORD`).
- When provided, the setup runner creates the administrator, assigns `ROLE_ADMIN`, and logs confirmation without outputting the plaintext password to persistent logs.

---

## 5. Input Validation & Injection Prevention
- **SQL Injection**: Handled by Spring Data JPA and Hibernate using parameterized queries and prepared statements exclusively. No raw concatenated dynamic SQL is used.
- **Cross-Site Scripting (XSS)**: Handled by React's built-in JSX context escaping and backend Bean Validation sanitization.
- **CORS Protection**: CORS headers explicitly allow designated trusted origins (`http://localhost:5173`, etc.). Wildcard origins (`*`) with credentials are prohibited.

---

## 6. Privacy & Sensitive Data
- Identity documents submitted for service provider verification are restricted exclusively to authorized administrators and the submitting provider.
- Public profile endpoints redact phone numbers, exact residential coordinates, and private identification numbers, exposing only necessary business information, public reviews, and verification badges.
