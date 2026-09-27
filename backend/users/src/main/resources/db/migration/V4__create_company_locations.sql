CREATE TABLE IF NOT EXISTS user_db.company_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES user_db.companies(id) ON DELETE CASCADE,
    location_name VARCHAR(255) NOT NULL,
    location_type VARCHAR(50) NOT NULL,
    street VARCHAR(255) NOT NULL,
    building_number VARCHAR(50) NOT NULL,
    zip VARCHAR(20) NOT NULL,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(10) NOT NULL DEFAULT 'PL',
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_locations_company_id ON user_db.company_locations(company_id);
