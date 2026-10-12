-- Labour Connect Database Creation Script
-- Run with postgres superuser: psql -U postgres -f init-db.sql

SELECT 'CREATE DATABASE labour_connect'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'labour_connect')\gexec

\c labour_connect;

-- Set timezone to UTC
SET timezone = 'UTC';

-- Comment on database
COMMENT ON DATABASE labour_connect IS 'Labour Connect Platform Relational Database';
