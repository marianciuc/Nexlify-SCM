CREATE SCHEMA IF NOT EXISTS notifications;
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS notifications.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_user_id UUID NOT NULL,
    recipient_company_id UUID,
    notification_type VARCHAR(64) NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    data TEXT,
    channel VARCHAR(16) NOT NULL DEFAULT 'WEB',
    status VARCHAR(16) NOT NULL DEFAULT 'PENDING',
    read_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications.user_notification_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL,
    email_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    push_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    web_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    order_notifications BOOLEAN NOT NULL DEFAULT TRUE,
    stock_notifications BOOLEAN NOT NULL DEFAULT TRUE,
    invoice_notifications BOOLEAN NOT NULL DEFAULT TRUE,
    logistics_notifications BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications.notifications(recipient_user_id, status);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications.notifications(created_at);
