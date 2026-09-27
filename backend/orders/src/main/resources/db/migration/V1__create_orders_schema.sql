CREATE SCHEMA IF NOT EXISTS orders;
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS orders.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(64) UNIQUE NOT NULL,
    tenant_id UUID,
    customer_id UUID NOT NULL,
    supplier_id UUID,
    status VARCHAR(32) NOT NULL DEFAULT 'DRAFT',
    currency VARCHAR(10) NOT NULL DEFAULT 'PLN',
    subtotal NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    vat_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    delivery_address TEXT,
    delivery_city VARCHAR(128),
    delivery_postal_code VARCHAR(16),
    requested_delivery_date DATE,
    sla_deadline TIMESTAMPTZ,
    sla_penalty_per_day NUMERIC(10, 2) DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_supplier_id ON orders.orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders.orders(created_at);
