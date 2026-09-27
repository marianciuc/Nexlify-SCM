CREATE TABLE IF NOT EXISTS user_db.credit_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES user_db.companies(id) ON DELETE CASCADE,
    credit_limit NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    credit_used NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(10) NOT NULL DEFAULT 'PLN',
    approved_by VARCHAR(100),
    approved_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_credit_limits_company_id ON user_db.credit_limits(company_id);
