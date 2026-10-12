# Labour Connect — Database Management & Scripts

This folder contains database setup, backup, restoration, and reference migration files for PostgreSQL 16.

## Structure
- `scripts/init-db.sql`: Standalone SQL script to create the `labour_connect` database and user privileges.
- `scripts/setup-db.ps1`: Interactive Windows PowerShell script to initialize the database securely.
- `scripts/backup-db.ps1`: Automated backup script using `pg_dump`.
- `scripts/restore-db.ps1`: Restoration script using `pg_restore` / `psql`.
- `backups/`: Target folder for `.sql` / `.dump` backup archives (git-ignored).
- `seed/`: Optional development seed scripts.

## Database Migrations
Note: The official database migrations are managed via **Flyway** in `backend/src/main/resources/db/migration/`:
- `V1__init_schema.sql` (Creates all tables, constraints, foreign keys, and indexes)
- `V2__seed_reference_data.sql` (Inserts initial skills, service categories, and seed development accounts)
Flyway runs automatically when the Spring Boot backend starts.
