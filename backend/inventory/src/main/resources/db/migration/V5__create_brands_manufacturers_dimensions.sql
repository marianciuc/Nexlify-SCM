-- V5: Add brands, manufacturers, product_dimensions, and auditing columns

CREATE TABLE IF NOT EXISTS inventory.brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(100) UNIQUE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    website VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS inventory.manufacturers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(100) UNIQUE,
    name VARCHAR(200) NOT NULL,
    country VARCHAR(100),
    website VARCHAR(255),
    contact_email VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS inventory.product_dimensions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL UNIQUE REFERENCES inventory.products(id) ON DELETE CASCADE,
    height NUMERIC(10, 2),
    width NUMERIC(10, 2),
    depth NUMERIC(10, 2),
    dimension_unit VARCHAR(20) NOT NULL DEFAULT 'CM',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ
);

ALTER TABLE inventory.products ADD COLUMN IF NOT EXISTS brand_id UUID REFERENCES inventory.brands(id) ON DELETE SET NULL;
ALTER TABLE inventory.products ADD COLUMN IF NOT EXISTS manufacturer_id UUID REFERENCES inventory.manufacturers(id) ON DELETE SET NULL;

ALTER TABLE inventory.stock_reservations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;
ALTER TABLE inventory.stock_transfers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_products_brand_id ON inventory.products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_manufacturer_id ON inventory.products(manufacturer_id);
CREATE INDEX IF NOT EXISTS idx_dimensions_product_id ON inventory.product_dimensions(product_id);
