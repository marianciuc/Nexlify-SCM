CREATE TABLE IF NOT EXISTS inventory.stock_transfers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_warehouse_id UUID NOT NULL REFERENCES inventory.warehouses(id) ON DELETE CASCADE,
    to_warehouse_id UUID NOT NULL REFERENCES inventory.warehouses(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES inventory.products(id) ON DELETE CASCADE,
    quantity INT NOT NULL CHECK (quantity > 0),
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    requested_date DATE,
    dispatched_at TIMESTAMPTZ,
    received_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_transfers_from_warehouse ON inventory.stock_transfers(from_warehouse_id);
CREATE INDEX IF NOT EXISTS idx_transfers_to_warehouse ON inventory.stock_transfers(to_warehouse_id);
CREATE INDEX IF NOT EXISTS idx_transfers_status ON inventory.stock_transfers(status);
