-- Migration: Create positions table
-- This table stores job positions for businesses

CREATE TABLE IF NOT EXISTS positions (
    id SERIAL PRIMARY KEY,
    business_id INTEGER NOT NULL,
    job_title VARCHAR(255) NOT NULL,
    job_description TEXT,
    pull_method VARCHAR(100), -- Hidden field, not in use yet
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_positions_business_id ON positions(business_id);
CREATE INDEX IF NOT EXISTS idx_positions_job_title ON positions(job_title);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_positions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it exists before creating (to avoid conflicts on re-runs)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'positions') THEN
        DROP TRIGGER IF EXISTS trigger_update_positions_updated_at ON positions;
    END IF;
END $$;

CREATE TRIGGER trigger_update_positions_updated_at
    BEFORE UPDATE ON positions
    FOR EACH ROW
    EXECUTE FUNCTION update_positions_updated_at();

