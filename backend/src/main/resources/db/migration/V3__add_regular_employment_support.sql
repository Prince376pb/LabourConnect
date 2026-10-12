-- Labour Connect V3: Regular Employment Support
-- Enables Regular Employment for shop assistants, retail salesmen, cashiers, office assistants, etc.

-- 1. Update CHECK constraint on jobs.job_type to include 'REGULAR' and 'REGULAR_EMPLOYMENT'
ALTER TABLE jobs DROP CONSTRAINT IF EXISTS chk_job_type;
ALTER TABLE jobs ADD CONSTRAINT chk_job_type CHECK (job_type IN ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'DAILY_WAGE', 'REGULAR', 'REGULAR_EMPLOYMENT'));

-- 2. Add columns for monthly salary range and working hours to jobs table
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS min_monthly_salary NUMERIC(10, 2);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS max_monthly_salary NUMERIC(10, 2);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS working_hours VARCHAR(100);

-- 3. Add index on job_type for high performance filtered queries
CREATE INDEX IF NOT EXISTS idx_jobs_job_type ON jobs(job_type);

-- 4. Seed skills tailored for retail and regular commercial employment
INSERT INTO skills (name, category, description) VALUES
    ('Retail Sales & Customer Service', 'Retail & Sales', 'Showroom sales, customer assistance, billing, and product demonstrations'),
    ('Shop Assistant & Inventory', 'Retail & Sales', 'Stock handling, inventory checking, shop upkeep, and customer support'),
    ('Cashier & Billing', 'Commerce', 'POS counter billing, cash handling, and daily accounts reconciliation'),
    ('Office Assistant', 'Administration', 'Office maintenance, document handling, filing, and errand support')
ON CONFLICT (name) DO NOTHING;
