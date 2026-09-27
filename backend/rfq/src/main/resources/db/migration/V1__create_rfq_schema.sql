CREATE SCHEMA IF NOT EXISTS rfq;

CREATE TABLE rfq.requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rfq_number VARCHAR(64) UNIQUE NOT NULL,
    buyer_company_id UUID NOT NULL,
    tenant_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(128),
    status VARCHAR(32) NOT NULL DEFAULT 'DRAFT',
    deadline TIMESTAMPTZ NOT NULL,
    delivery_date DATE,
    delivery_address TEXT,
    delivery_city VARCHAR(128),
    budget_amount NUMERIC(15,2),
    budget_hidden BOOLEAN DEFAULT false,
    currency VARCHAR(3) NOT NULL DEFAULT 'PLN',
    payment_terms VARCHAR(16) DEFAULT 'NET_30',
    awarded_bid_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE rfq.rfq_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rfq_id UUID NOT NULL REFERENCES rfq.requests(id) ON DELETE CASCADE,
    sku VARCHAR(128),
    product_name VARCHAR(255) NOT NULL,
    quantity NUMERIC(12,3) NOT NULL CHECK (quantity > 0),
    unit_of_measure VARCHAR(16) NOT NULL DEFAULT 'PCE',
    description TEXT,
    allow_alternatives BOOLEAN DEFAULT false
);

CREATE TABLE rfq.bids (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rfq_id UUID NOT NULL REFERENCES rfq.requests(id) ON DELETE CASCADE,
    supplier_company_id UUID NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'SUBMITTED',
    total_price NUMERIC(15,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'PLN',
    delivery_date DATE,
    payment_terms VARCHAR(16),
    validity_days INT NOT NULL DEFAULT 30,
    valid_until DATE,
    notes TEXT,
    score NUMERIC(5,2),
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE rfq.bid_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bid_id UUID NOT NULL REFERENCES rfq.bids(id) ON DELETE CASCADE,
    rfq_item_id UUID NOT NULL REFERENCES rfq.rfq_items(id),
    offered_sku VARCHAR(128),
    product_name VARCHAR(255),
    quantity NUMERIC(12,3) NOT NULL,
    unit_price NUMERIC(12,2) NOT NULL,
    total_price NUMERIC(15,2) NOT NULL,
    is_alternative BOOLEAN DEFAULT false,
    alternative_reason TEXT,
    lead_time_days INT,
    vat_rate NUMERIC(5,2) DEFAULT 23
);

CREATE TABLE rfq.rfq_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rfq_id UUID NOT NULL REFERENCES rfq.requests(id) ON DELETE CASCADE,
    supplier_company_id UUID NOT NULL,
    invited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    responded_at TIMESTAMPTZ,
    UNIQUE (rfq_id, supplier_company_id)
);

CREATE TABLE rfq.bid_comparison_matrix (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rfq_id UUID NOT NULL REFERENCES rfq.requests(id),
    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    matrix_data JSONB NOT NULL,
    generated_by UUID NOT NULL
);

CREATE INDEX idx_rfq_requests_status ON rfq.requests(status);
CREATE INDEX idx_rfq_requests_deadline ON rfq.requests(deadline) WHERE status = 'PUBLISHED';
CREATE INDEX idx_rfq_bids_rfq ON rfq.bids(rfq_id, status);
CREATE INDEX idx_rfq_bids_supplier ON rfq.bids(supplier_company_id);
