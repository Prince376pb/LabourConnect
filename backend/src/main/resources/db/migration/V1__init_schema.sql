-- Labour Connect: V1 Initial Relational Schema
-- PostgreSQL 16 compatible DDL

-- 1. Roles
CREATE TABLE roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- 2. Users
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    phone_number VARCHAR(30),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_suspended BOOLEAN NOT NULL DEFAULT FALSE,
    suspension_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);

-- 3. User Roles Mapping
CREATE TABLE user_roles (
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    PRIMARY KEY (user_id, role_id)
);

-- 4. Skills Catalog
CREATE TABLE skills (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(100) NOT NULL,
    description TEXT
);

-- 5. Worker Profiles
CREATE TABLE worker_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    headline VARCHAR(200),
    bio TEXT,
    years_of_experience INTEGER DEFAULT 0,
    daily_rate NUMERIC(10, 2),
    hourly_rate NUMERIC(10, 2),
    city VARCHAR(100),
    area VARCHAR(100),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    availability_status VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_worker_availability CHECK (availability_status IN ('AVAILABLE', 'BUSY', 'UNAVAILABLE'))
);

CREATE INDEX idx_worker_city_avail ON worker_profiles(city, availability_status);

-- 6. Worker Skills Mapping
CREATE TABLE worker_skills (
    worker_id BIGINT NOT NULL REFERENCES worker_profiles(id) ON DELETE CASCADE,
    skill_id BIGINT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    PRIMARY KEY (worker_id, skill_id)
);

-- 7. Employer Profiles
CREATE TABLE employer_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(200) NOT NULL,
    business_type VARCHAR(50) NOT NULL DEFAULT 'INDIVIDUAL',
    address TEXT,
    city VARCHAR(100),
    contact_person VARCHAR(100),
    phone VARCHAR(30),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_employer_business_type CHECK (business_type IN ('INDIVIDUAL', 'SHOPKEEPER', 'CONTRACTOR', 'ENTERPRISE'))
);

-- 8. Customer Profiles
CREATE TABLE customer_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    address TEXT,
    city VARCHAR(100),
    area VARCHAR(100),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 9. Service Categories
CREATE TABLE service_categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    icon_name VARCHAR(50),
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 10. Service Provider Profiles
CREATE TABLE provider_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    business_name VARCHAR(200) NOT NULL,
    bio TEXT,
    years_of_experience INTEGER DEFAULT 0,
    base_rate NUMERIC(10, 2),
    hourly_rate NUMERIC(10, 2),
    city VARCHAR(100),
    service_area_radius_km DOUBLE PRECISION DEFAULT 15.0,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    verification_status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    verification_notes TEXT,
    id_proof_url VARCHAR(500),
    verified_at TIMESTAMP WITH TIME ZONE,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_provider_verification CHECK (verification_status IN ('PENDING', 'APPROVED', 'REJECTED'))
);

CREATE INDEX idx_provider_verif_avail ON provider_profiles(verification_status, is_available);
CREATE INDEX idx_provider_city ON provider_profiles(city);

-- 11. Provider Categories Mapping
CREATE TABLE provider_categories (
    provider_id BIGINT NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
    category_id BIGINT NOT NULL REFERENCES service_categories(id) ON DELETE CASCADE,
    PRIMARY KEY (provider_id, category_id)
);

-- 12. Jobs (Employment Connect)
CREATE TABLE jobs (
    id BIGSERIAL PRIMARY KEY,
    employer_id BIGINT NOT NULL REFERENCES employer_profiles(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    job_type VARCHAR(50) NOT NULL DEFAULT 'DAILY_WAGE',
    daily_wage NUMERIC(10, 2),
    estimated_days INTEGER DEFAULT 1,
    city VARCHAR(100) NOT NULL,
    area VARCHAR(100),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    status VARCHAR(30) NOT NULL DEFAULT 'OPEN',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_job_type CHECK (job_type IN ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'DAILY_WAGE')),
    CONSTRAINT chk_job_status CHECK (status IN ('OPEN', 'IN_PROGRESS', 'CLOSED', 'CANCELLED'))
);

CREATE INDEX idx_jobs_status_city ON jobs(status, city);

-- 13. Job Required Skills Mapping
CREATE TABLE job_required_skills (
    job_id BIGINT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    skill_id BIGINT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    PRIMARY KEY (job_id, skill_id)
);

-- 14. Job Applications
CREATE TABLE job_applications (
    id BIGSERIAL PRIMARY KEY,
    job_id BIGINT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    worker_id BIGINT NOT NULL REFERENCES worker_profiles(id) ON DELETE CASCADE,
    cover_note TEXT,
    bid_amount NUMERIC(10, 2),
    status VARCHAR(30) NOT NULL DEFAULT 'APPLIED',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_job_worker UNIQUE (job_id, worker_id),
    CONSTRAINT chk_application_status CHECK (status IN ('APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'ACCEPTED', 'REJECTED', 'WITHDRAWN'))
);

CREATE INDEX idx_applications_job ON job_applications(job_id);
CREATE INDEX idx_applications_worker ON job_applications(worker_id);

-- 15. Service Requests (On-Demand Connect)
CREATE TABLE service_requests (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL REFERENCES customer_profiles(id) ON DELETE CASCADE,
    provider_id BIGINT NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
    category_id BIGINT NOT NULL REFERENCES service_categories(id) ON DELETE RESTRICT,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    service_address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    estimated_cost NUMERIC(10, 2),
    final_cost NUMERIC(10, 2),
    status VARCHAR(30) NOT NULL DEFAULT 'REQUESTED',
    rejection_reason TEXT,
    cancellation_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_service_request_status CHECK (status IN ('REQUESTED', 'ACCEPTED', 'ON_THE_WAY', 'SERVICE_STARTED', 'COMPLETED', 'REJECTED', 'CANCELLED'))
);

CREATE INDEX idx_service_requests_status_provider ON service_requests(status, provider_id);
CREATE INDEX idx_service_requests_status_customer ON service_requests(status, customer_id);

-- 16. Reviews & Ratings
CREATE TABLE reviews (
    id BIGSERIAL PRIMARY KEY,
    reviewer_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reviewee_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_id BIGINT REFERENCES jobs(id) ON DELETE SET NULL,
    service_request_id BIGINT REFERENCES service_requests(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL,
    review_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_review_rating CHECK (rating >= 1 AND rating <= 5),
    CONSTRAINT uq_review_job UNIQUE (reviewer_id, job_id),
    CONSTRAINT uq_review_service UNIQUE (reviewer_id, service_request_id)
);

CREATE INDEX idx_reviews_reviewee ON reviews(reviewee_id);

-- 17. Complaints & Dispute Mediation
CREATE TABLE complaints (
    id BIGSERIAL PRIMARY KEY,
    complainant_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reported_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    service_request_id BIGINT REFERENCES service_requests(id) ON DELETE SET NULL,
    job_id BIGINT REFERENCES jobs(id) ON DELETE SET NULL,
    subject VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    admin_resolution_notes TEXT,
    resolved_by_admin_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_complaint_status CHECK (status IN ('PENDING', 'INVESTIGATING', 'RESOLVED', 'DISMISSED'))
);

CREATE INDEX idx_complaints_status ON complaints(status);

-- 18. Audit Logs
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_name VARCHAR(100) NOT NULL,
    entity_id BIGINT,
    details TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_created ON audit_logs(created_at);
