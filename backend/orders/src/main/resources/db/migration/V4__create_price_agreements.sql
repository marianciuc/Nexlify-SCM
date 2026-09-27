CREATE TABLE IF NOT EXISTS orders.price_agreements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_company_id UUID NOT NULL,
    supplier_company_id UUID NOT NULL,
    sku VARCHAR(128) NOT NULL,
    agreed_price NUMERIC(12, 2) NOT NULL,
    discount_percent NUMERIC(5, 2) DEFAULT 0.00,
    payment_terms VARCHAR(32) DEFAULT 'NET_30',
    valid_from DATE NOT NULL,
    valid_to DATE,
    min_order_quantity INT DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_price_agreements UNIQUE (buyer_company_id, supplier_company_id, sku)
);

CREATE INDEX IF NOT EXISTS idx_price_agreements_lookup ON orders.price_agreements(buyer_company_id, supplier_company_id, sku);
