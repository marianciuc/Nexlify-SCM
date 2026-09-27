CREATE TABLE IF NOT EXISTS user_db.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    keycloak_id VARCHAR(100) UNIQUE,
    company_id UUID REFERENCES user_db.companies(id) ON DELETE SET NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(50),
    account_status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    is_email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    data_processing_consent BOOLEAN NOT NULL DEFAULT FALSE,
    timezone VARCHAR(50) NOT NULL DEFAULT 'Europe/Warsaw',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_by VARCHAR(100),
    deleted_reason TEXT
);

CREATE INDEX IF NOT EXISTS idx_users_email ON user_db.users(email);
CREATE INDEX IF NOT EXISTS idx_users_keycloak_id ON user_db.users(keycloak_id);
CREATE INDEX IF NOT EXISTS idx_users_company_id ON user_db.users(company_id);
CREATE INDEX IF NOT EXISTS idx_users_account_status ON user_db.users(account_status);
