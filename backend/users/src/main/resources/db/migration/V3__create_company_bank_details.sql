CREATE TABLE IF NOT EXISTS user_db.company_bank_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES user_db.companies(id) ON DELETE CASCADE,
    bank_name VARCHAR(255) NOT NULL,
    iban VARCHAR(50) NOT NULL,
    swift VARCHAR(20),
    currency VARCHAR(10) NOT NULL DEFAULT 'PLN',
    is_primary BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bank_details_company_id ON user_db.company_bank_details(company_id);
