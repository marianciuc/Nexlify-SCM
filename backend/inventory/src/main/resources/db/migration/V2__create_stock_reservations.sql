CREATE TABLE IF NOT EXISTS inventory.stock_reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL,
    product_id UUID NOT NULL REFERENCES inventory.products(id) ON DELETE CASCADE,
    warehouse_id UUID NOT NULL REFERENCES inventory.warehouses(id) ON DELETE CASCADE,
    quantity INT NOT NULL CHECK (quantity > 0),
    reservation_type VARCHAR(20) NOT NULL DEFAULT 'SOFT',
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    expires_at TIMESTAMPTZ,
    released_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reservations_order_id ON inventory.stock_reservations(order_id);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON inventory.stock_reservations(status);
