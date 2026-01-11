-- Migration: Create openings table
-- This table stores job openings/positions at specific locations

CREATE TABLE IF NOT EXISTS openings (
    id SERIAL PRIMARY KEY,
    business_id INTEGER NOT NULL,
    location_id INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    position_type VARCHAR(100), -- e.g., Full-time, Part-time, Contract
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_openings_business_id ON openings(business_id);
CREATE INDEX IF NOT EXISTS idx_openings_location_id ON openings(location_id);
CREATE INDEX IF NOT EXISTS idx_openings_title ON openings(title);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_openings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it exists before creating (to avoid conflicts on re-runs)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'openings') THEN
        DROP TRIGGER IF EXISTS trigger_update_openings_updated_at ON openings;
    END IF;
END $$;

CREATE TRIGGER trigger_update_openings_updated_at
    BEFORE UPDATE ON openings
    FOR EACH ROW
    EXECUTE FUNCTION update_openings_updated_at();

