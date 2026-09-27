CREATE TABLE IF NOT EXISTS user_db.gdpr_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_db.users(id) ON DELETE SET NULL,
    operation VARCHAR(50) NOT NULL,
    gdpr_reason VARCHAR(50) NOT NULL,
    details TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_gdpr_logs_user_id ON user_db.gdpr_logs(user_id);
