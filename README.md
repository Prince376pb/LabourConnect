
# Labour Connect

## A Full-Stack Platform for Employment and Local Services

Labour Connect is a full-stack web application that connects employers with workers and customers with local service providers. It combines employment opportunities and on-demand services on a single platform.

## About the Project

Finding suitable workers and reliable local service providers can be challenging. Labour Connect simplifies this process through two main modules.

### 1. Employment Connect

- Post and manage job opportunities.
- Browse and filter available jobs.
- Support daily wage, contract, and regular employment.
- Apply for jobs with expected compensation and cover notes.
- Review applications and search for workers.

### 2. On-Demand Service Connect

- Discover local service providers by category.
- Manage service offerings, rates, and service areas.
- Request services and track booking progress.
- Submit ratings and raise complaints or disputes.

## User Roles

| Role | Responsibilities |
|---|---|
| Admin | User management, provider verification, categories, and complaints |
| Employer | Job posting, applicant review, and worker search |
| Worker | Profile management, job search, and applications |
| Customer | Service discovery, bookings, and request tracking |
| Service Provider | Service listings, pricing, and booking management |

## Technology Stack

| Component | Technologies |
|---|---|
| Frontend | React.js, Vite, Tailwind CSS |
| Backend | Java 21, Spring Boot |
| Security | Spring Security, JWT |
| Database | PostgreSQL |
| ORM | Spring Data JPA, Hibernate |
| Migrations | Flyway |
| API Documentation | SpringDoc OpenAPI, Swagger UI |
| Tools | Maven, npm, Git, GitHub |

## Application Architecture

```text
                 +------------------+
                 |       User       |
                 +------------------+
                          |
                          v
                 +------------------+
                 |  React Frontend  |
                 | Vite + Tailwind  |
                 +------------------+
                          |
                       REST API
                          |
                          v
                 +------------------+
                 | Spring Boot      |
                 | Backend          |
                 +------------------+
                          |
             +------------+------------+
             |            |            |
             v            v            v
       +-----------+ +-----------+ +-----------+
       | Auth and  | |Employment | | On-Demand |
       | Security  | | Module    | | Services  |
       +-----------+ +-----------+ +-----------+
                          |
                          v
                 +------------------+
                 |   PostgreSQL     |
                 |    Database      |
                 +------------------+
```

## Project Structure

```text
LabourConnect/
├── backend/
├── frontend/
├── database/
├── .gitignore
└── README.md
```

## Key Features

- Role-based authentication and authorization.
- Job posting and application management.
- Local service discovery and booking.
- User and service provider management.
- Ratings, complaints, and dispute handling.
- REST API communication between frontend and backend.
- PostgreSQL database integration.

## Project Objective

The objective of Labour Connect is to provide a common digital platform for employment opportunities and local service fulfillment, helping workers, employers, customers, and service providers connect efficiently.

## Future Enhancements

- Online payments and digital receipts.
- Real-time notifications.
- Location-based service recommendations.
- Analytics and reporting.
- Further mobile-friendly improvements.

## Author

**Prince Bansal**

B.Tech Computer Engineering  
MIT Academy of Engineering, Alandi, Pune
