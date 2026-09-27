CREATE SCHEMA IF NOT EXISTS billing;

CREATE TABLE billing.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number VARCHAR(64) UNIQUE NOT NULL,
    invoice_type VARCHAR(16) NOT NULL DEFAULT 'SALES',
    order_id UUID NOT NULL,
    seller_company_id UUID NOT NULL,
    buyer_company_id UUID NOT NULL,
    seller_nip VARCHAR(16) NOT NULL,
    buyer_nip VARCHAR(16) NOT NULL,
    seller_name VARCHAR(255) NOT NULL,
    buyer_name VARCHAR(255) NOT NULL,
    seller_address TEXT NOT NULL,
    buyer_address TEXT NOT NULL,
    issue_date DATE NOT NULL,
    sale_date DATE NOT NULL,
    due_date DATE NOT NULL,
    payment_terms VARCHAR(16) NOT NULL DEFAULT 'NET_30',
    currency VARCHAR(3) NOT NULL DEFAULT 'PLN',
    net_amount NUMERIC(15,2) NOT NULL,
    vat_amount NUMERIC(15,2) NOT NULL,
    gross_amount NUMERIC(15,2) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'DRAFT',
    payment_method VARCHAR(32) DEFAULT 'BANK_TRANSFER',
    stripe_payment_intent_id VARCHAR(255),
    stripe_payment_status VARCHAR(32),
    pdf_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE billing.invoice_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES billing.invoices(id) ON DELETE CASCADE,
    line_number INT NOT NULL,
    sku VARCHAR(128),
    description VARCHAR(255) NOT NULL,
    quantity NUMERIC(12,3) NOT NULL,
    unit_of_measure VARCHAR(16) NOT NULL DEFAULT 'PCE',
    unit_price_net NUMERIC(12,2) NOT NULL,
    discount_percent NUMERIC(5,2) DEFAULT 0,
    vat_rate NUMERIC(5,2) NOT NULL DEFAULT 23,
    net_amount NUMERIC(15,2) NOT NULL,
    vat_amount NUMERIC(15,2) NOT NULL,
    gross_amount NUMERIC(15,2) NOT NULL
);

CREATE TABLE billing.credit_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    credit_note_number VARCHAR(64) UNIQUE NOT NULL,
    original_invoice_id UUID NOT NULL REFERENCES billing.invoices(id),
    order_id UUID NOT NULL,
    reason TEXT NOT NULL,
    net_adjustment NUMERIC(15,2) NOT NULL,
    vat_adjustment NUMERIC(15,2) NOT NULL,
    gross_adjustment NUMERIC(15,2) NOT NULL,
    issue_date DATE NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'ISSUED',
    pdf_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE billing.payment_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES billing.invoices(id),
    stripe_event_id VARCHAR(255) UNIQUE,
    event_type VARCHAR(64) NOT NULL,
    amount NUMERIC(15,2),
    currency VARCHAR(3),
    processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    raw_payload JSONB
);

CREATE INDEX idx_invoices_order ON billing.invoices(order_id);
CREATE INDEX idx_invoices_status ON billing.invoices(status);
CREATE INDEX idx_invoices_due_date ON billing.invoices(due_date) WHERE status NOT IN ('PAID', 'CANCELLED');
