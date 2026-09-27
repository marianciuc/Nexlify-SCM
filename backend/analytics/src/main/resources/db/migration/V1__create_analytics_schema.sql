CREATE SCHEMA IF NOT EXISTS analytics;

CREATE TABLE analytics.order_facts (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    customer_id UUID NOT NULL,
    supplier_id UUID,
    status VARCHAR(32) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    total_amount NUMERIC(15,2),
    created_date DATE NOT NULL,
    submitted_date DATE,
    paid_date DATE,
    shipped_date DATE,
    delivered_date DATE,
    delivery_city VARCHAR(128),
    items_count INT,
    lead_time_days INT,
    is_on_time BOOLEAN,
    is_in_full BOOLEAN,
    sla_met BOOLEAN,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE analytics.stock_facts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_date DATE NOT NULL,
    tenant_id UUID NOT NULL,
    product_id UUID NOT NULL,
    sku VARCHAR(128),
    warehouse_id UUID,
    event_type VARCHAR(32) NOT NULL,
    quantity INT NOT NULL,
    unit_cost NUMERIC(12,2),
    total_cost NUMERIC(15,2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE analytics.payment_facts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL,
    order_id UUID NOT NULL,
    buyer_company_id UUID NOT NULL,
    supplier_company_id UUID NOT NULL,
    net_amount NUMERIC(15,2) NOT NULL,
    vat_amount NUMERIC(15,2) NOT NULL,
    gross_amount NUMERIC(15,2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    payment_terms VARCHAR(16),
    due_date DATE,
    paid_date DATE,
    days_to_pay INT,
    is_overdue BOOLEAN DEFAULT false,
    issue_date DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE analytics.kpi_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    period_type VARCHAR(8) NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    total_orders INT DEFAULT 0,
    orders_completed INT DEFAULT 0,
    orders_cancelled INT DEFAULT 0,
    total_revenue NUMERIC(15,2) DEFAULT 0,
    otif_rate NUMERIC(5,2),
    avg_lead_time_days NUMERIC(6,2),
    inventory_turnover_ratio NUMERIC(8,4),
    avg_stock_level NUMERIC(12,2),
    stockout_events INT DEFAULT 0,
    total_invoiced NUMERIC(15,2) DEFAULT 0,
    total_collected NUMERIC(15,2) DEFAULT 0,
    accounts_receivable NUMERIC(15,2) DEFAULT 0,
    dso_days NUMERIC(6,2),
    overdue_amount NUMERIC(15,2) DEFAULT 0,
    avg_supplier_fill_rate NUMERIC(5,2),
    computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, period_type, period_start)
);

CREATE INDEX idx_order_facts_tenant_date ON analytics.order_facts(tenant_id, created_date);
CREATE INDEX idx_payment_facts_tenant ON analytics.payment_facts(buyer_company_id, issue_date);
