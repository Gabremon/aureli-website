-- Migration: Create applicants table with pipeline stages
-- This table tracks applicants and candidates through the hiring pipeline
-- Note: business_id foreign key will be added after businesses table is created and data is migrated

CREATE TABLE IF NOT EXISTS applicants (
    id SERIAL PRIMARY KEY,
    business_id INTEGER,
    business_owner_id INTEGER, -- Support old schema during migration
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    position VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'new_applicant' CHECK (status IN (
        'new_applicant',
        'screening',
        'interview_scheduled',
        'interview_complete',
        'offer_extended',
        'offer_accepted',
        'onboarding',
        'active_employee',
        'offboarding',
        'archived'
    )),
    stage_order INTEGER NOT NULL DEFAULT 0, -- Order within the stage
    notes TEXT,
    applied_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_applicants_business_id ON applicants(business_id);
CREATE INDEX IF NOT EXISTS idx_applicants_business_owner_id ON applicants(business_owner_id);
CREATE INDEX IF NOT EXISTS idx_applicants_status ON applicants(status);
CREATE INDEX IF NOT EXISTS idx_applicants_email ON applicants(email);
CREATE INDEX IF NOT EXISTS idx_applicants_stage_order ON applicants(status, stage_order);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_applicants_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it exists before creating (to avoid conflicts on re-runs)
-- Only drop if table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'applicants') THEN
        DROP TRIGGER IF EXISTS trigger_update_applicants_updated_at ON applicants;
    END IF;
END $$;

CREATE TRIGGER trigger_update_applicants_updated_at
    BEFORE UPDATE ON applicants
    FOR EACH ROW
    EXECUTE FUNCTION update_applicants_updated_at();

