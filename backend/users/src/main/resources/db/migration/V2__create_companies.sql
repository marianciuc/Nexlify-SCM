CREATE TABLE IF NOT EXISTS user_db.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    legal_name VARCHAR(255) NOT NULL,
    trade_name VARCHAR(255),
    tax_id VARCHAR(20) NOT NULL UNIQUE,
    registration_code VARCHAR(30),
    organization_type VARCHAR(50) NOT NULL,
    verification_status VARCHAR(50) NOT NULL DEFAULT 'NOT_VERIFIED',
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50),
    website VARCHAR(255),
    rating NUMERIC(3, 2) DEFAULT 0.00,
    number_of_orders BIGINT NOT NULL DEFAULT 0,
    number_of_ratings BIGINT NOT NULL DEFAULT 0,
    vies_valid BOOLEAN NOT NULL DEFAULT FALSE,
    payments_terms_days INT NOT NULL DEFAULT 0,
    credit_limit NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    credit_used NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_tax_id_nip CHECK (tax_id ~ '^[0-9]{10}$')
);

CREATE INDEX IF NOT EXISTS idx_companies_tax_id ON user_db.companies(tax_id);
CREATE INDEX IF NOT EXISTS idx_companies_verification_status ON user_db.companies(verification_status);
CREATE INDEX IF NOT EXISTS idx_companies_org_type ON user_db.companies(organization_type);
