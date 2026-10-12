# Labour Connect — REST API Documentation

Base URL: `http://localhost:8080/api/v1`

All responses follow standard HTTP semantics and return JSON bodies. Protected routes require the `Authorization: Bearer <token>` header.

---

## 1. Authentication & Account Management (`/auth`)
| Method | Endpoint | Description | Role Required |
|--------|----------|-------------|---------------|
| `POST` | `/auth/register` | Register a new user with chosen role | Public |
| `POST` | `/auth/login` | Authenticate with email/password; returns JWT | Public |
| `GET`  | `/auth/me` | Fetch authenticated user profile and roles | Any Authenticated |
| `POST` | `/auth/logout` | Client token invalidation acknowledgement | Any Authenticated |

---

## 2. Profiles (`/profiles`)
| Method | Endpoint | Description | Role Required |
|--------|----------|-------------|---------------|
| `GET`  | `/profiles/worker` | Get current worker's profile | `ROLE_WORKER` |
| `PUT`  | `/profiles/worker` | Create/update worker profile & skills | `ROLE_WORKER` |
| `GET`  | `/profiles/employer` | Get current employer's profile | `ROLE_EMPLOYER` |
| `PUT`  | `/profiles/employer` | Create/update employer profile | `ROLE_EMPLOYER` |
| `GET`  | `/profiles/provider` | Get current service provider profile | `ROLE_PROVIDER` |
| `PUT`  | `/profiles/provider` | Create/update provider profile & categories | `ROLE_PROVIDER` |
| `GET`  | `/profiles/customer` | Get current customer's profile | `ROLE_CUSTOMER` |
| `PUT`  | `/profiles/customer` | Create/update customer profile | `ROLE_CUSTOMER` |

---

## 3. Metadata: Skills & Categories
| Method | Endpoint | Description | Role Required |
|--------|----------|-------------|---------------|
| `GET`  | `/skills` | List all available worker skills | Public |
| `GET`  | `/categories` | List all active on-demand service categories | Public |
| `POST` | `/categories` | Create a new service category | `ROLE_ADMIN` |
| `PUT`  | `/categories/{id}` | Update an existing service category | `ROLE_ADMIN` |

---

## 4. Employment Connect: Jobs & Applications (`/jobs`, `/applications`)
| Method | Endpoint | Description | Role Required |
|--------|----------|-------------|---------------|
| `GET`  | `/jobs` | Search & filter open jobs (query, skill, city) | Public / Any |
| `GET`  | `/jobs/{id}` | View job details | Public / Any |
| `POST` | `/jobs` | Post a new job | `ROLE_EMPLOYER` |
| `PUT`  | `/jobs/{id}` | Update job details | `ROLE_EMPLOYER` (Owner) |
| `DELETE`| `/jobs/{id}` | Close or cancel job | `ROLE_EMPLOYER` (Owner) |
| `GET`  | `/jobs/my-jobs` | List employer's posted jobs | `ROLE_EMPLOYER` |
| `GET`  | `/jobs/{id}/applications` | View applicants for a specific job | `ROLE_EMPLOYER` (Owner) |
| `POST` | `/jobs/{id}/apply` | Submit job application | `ROLE_WORKER` |
| `GET`  | `/applications/my-applications` | Worker's job application history | `ROLE_WORKER` |
| `PUT`  | `/applications/{id}/status` | Update applicant status (Shortlist, Accept, Reject) | `ROLE_EMPLOYER` (Owner) |
| `POST` | `/applications/{id}/withdraw` | Withdraw application | `ROLE_WORKER` (Applicant) |

---

## 5. Worker Search (`/workers`)
| Method | Endpoint | Description | Role Required |
|--------|----------|-------------|---------------|
| `GET`  | `/workers` | Search skilled workers (by skill, city, availability) | `ROLE_EMPLOYER`, `ROLE_ADMIN` |
| `GET`  | `/workers/{id}` | View worker public profile | `ROLE_EMPLOYER`, `ROLE_ADMIN` |

---

## 6. On-Demand Service Connect (`/services`, `/requests`)
| Method | Endpoint | Description | Role Required |
|--------|----------|-------------|---------------|
| `GET`  | `/services/providers` | Search providers (category, city, lat, lng, radius) | Public / Customer |
| `GET`  | `/services/providers/{id}` | View provider public profile & verified badge | Public / Customer |
| `POST` | `/requests` | Create service request to a provider | `ROLE_CUSTOMER` |
| `GET`  | `/requests/my-requests` | View customer's service request history | `ROLE_CUSTOMER` |
| `GET`  | `/requests/provider-requests` | View provider's incoming requests | `ROLE_PROVIDER` |
| `GET`  | `/requests/{id}` | Get service request details | Customer / Provider / Admin |
| `PUT`  | `/requests/{id}/status` | Transition status (`ACCEPTED`, `ON_THE_WAY`, `SERVICE_STARTED`, `COMPLETED`, `REJECTED`) | `ROLE_PROVIDER` (Assigned) |
| `POST` | `/requests/{id}/cancel` | Cancel service request | `ROLE_CUSTOMER` (Requester) |

---

## 7. Trust, Verification, Reviews & Complaints (`/verification`, `/reviews`, `/complaints`)
| Method | Endpoint | Description | Role Required |
|--------|----------|-------------|---------------|
| `POST` | `/verification/submit` | Provider submits verification docs/details | `ROLE_PROVIDER` |
| `GET`  | `/verification/status` | Provider checks verification status | `ROLE_PROVIDER` |
| `GET`  | `/admin/verifications` | Admin lists pending verifications | `ROLE_ADMIN` |
| `PUT`  | `/admin/verifications/{id}` | Admin approves or rejects verification | `ROLE_ADMIN` |
| `POST` | `/reviews` | Submit review after job/service completion | Customer / Employer / Worker |
| `GET`  | `/reviews/user/{userId}` | Get public reviews for a user | Public / Any |
| `POST` | `/complaints` | File complaint regarding an interaction | Any Authenticated |
| `GET`  | `/complaints/my` | View user's filed complaints | Any Authenticated |
| `GET`  | `/admin/complaints` | List all complaints for mediation | `ROLE_ADMIN` |
| `PUT`  | `/admin/complaints/{id}` | Resolve or dismiss complaint | `ROLE_ADMIN` |

---

## 8. Administrative Management (`/admin`)
| Method | Endpoint | Description | Role Required |
|--------|----------|-------------|---------------|
| `GET`  | `/admin/stats` | Platform statistics (users, jobs, requests, revenue) | `ROLE_ADMIN` |
| `GET`  | `/admin/users` | List platform users with filter/search | `ROLE_ADMIN` |
| `PUT`  | `/admin/users/{id}/status` | Suspend or reactivate user account | `ROLE_ADMIN` |
| `GET`  | `/admin/audit-logs` | Query security audit events | `ROLE_ADMIN` |
