CREATE SCHEMA IF NOT EXISTS integration;

CREATE TABLE integration.edi_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_reference VARCHAR(64) UNIQUE NOT NULL,
    message_type VARCHAR(32) NOT NULL,
    standard VARCHAR(32) NOT NULL DEFAULT 'EDIFACT_D96A',
    direction VARCHAR(16) NOT NULL,
    sender_gln VARCHAR(64) NOT NULL,
    receiver_gln VARCHAR(64) NOT NULL,
    sender_company_id UUID,
    receiver_company_id UUID,
    related_order_id UUID,
    related_order_number VARCHAR(64),
    status VARCHAR(32) NOT NULL DEFAULT 'RECEIVED',
    raw_content TEXT NOT NULL,
    parsed_payload JSONB,
    validation_errors JSONB,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMPTZ
);

CREATE TABLE integration.import_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    import_type VARCHAR(32) NOT NULL DEFAULT 'CATALOG_PRICE_LIST',
    total_rows INT NOT NULL DEFAULT 0,
    successful_rows INT NOT NULL DEFAULT 0,
    failed_rows INT NOT NULL DEFAULT 0,
    status VARCHAR(32) NOT NULL DEFAULT 'PROCESSING',
    error_log JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE TABLE integration.webhook_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL,
    target_url VARCHAR(512) NOT NULL,
    event_types VARCHAR(255) NOT NULL,
    secret_key VARCHAR(128) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_triggered_at TIMESTAMPTZ
);

CREATE INDEX idx_edi_messages_type ON integration.edi_messages(message_type);
CREATE INDEX idx_edi_messages_status ON integration.edi_messages(status);
CREATE INDEX idx_edi_messages_ref ON integration.edi_messages(message_reference);
CREATE INDEX idx_edi_messages_order ON integration.edi_messages(related_order_number);
CREATE INDEX idx_import_jobs_company ON integration.import_jobs(company_id);
CREATE INDEX idx_webhook_company ON integration.webhook_subscriptions(company_id);
