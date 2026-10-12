# Labour Connect — Testing Strategy & Verification Guide

## 1. Testing Philosophy
The application employs automated testing across multiple layers:
1. **Unit Testing**: Tests domain services, DTO validations, security token utilities, and business calculations in isolation using JUnit 5, Mockito, and AssertJ.
2. **Integration Testing**: Uses `@SpringBootTest` and MockMvc to test API endpoints, HTTP status codes, security filters, role authorizations, and transaction rollbacks.
3. **Database Integrity Testing**: Tests database constraints (duplicate application prevention, unique email constraint, check constraints on ratings).

---

## 2. Backend Automated Test Suite
Test cases in `backend/src/test/java/com/labourconnect/`:
- `AuthServiceTest`: Verifies user registration, password hashing, duplicate email detection, and JWT generation.
- `SecurityAuthorizationTest`: Verifies public vs role-protected endpoint access, 401 Unauthorized, and 403 Forbidden scenarios.
- `JobServiceTest`: Verifies job creation, editing by owner vs non-owner, and application status transitions.
- `ServiceRequestServiceTest`: Verifies the on-demand service request lifecycle (REQUESTED → ACCEPTED → ON_THE_WAY → SERVICE_STARTED → COMPLETED).
- `ReviewServiceTest`: Verifies that only completed jobs and requests can be reviewed and prevents duplicate reviews.

### Running Backend Tests
```bash
cd backend
mvn test
```

---

## 3. Frontend Quality Assurance
- **Component & Integration Testing**: Form validation checks (email syntax, password criteria, required fields).
- **Role-Based Route Guards**: Verifies that unauthenticated users are redirected to login and unauthorized roles to the 403 Forbidden view.
- **Production Bundle Verification**:
  ```bash
  cd frontend
  npm run build
  ```
