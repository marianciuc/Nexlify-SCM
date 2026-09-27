CREATE TABLE IF NOT EXISTS user_db.authentication_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_db.users(id) ON DELETE SET NULL,
    username VARCHAR(255),
    ip VARCHAR(100) NOT NULL,
    user_agent VARCHAR(500),
    successful BOOLEAN NOT NULL,
    failure_reason TEXT,
    geo_country VARCHAR(100),
    geo_city VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_auth_logs_user_id ON user_db.authentication_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_logs_created_at ON user_db.authentication_logs(created_at);
