CREATE SCHEMA IF NOT EXISTS inventory;
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS inventory.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES inventory.categories(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS inventory.warehouses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(30) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    city VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    total_capacity_pallets INT NOT NULL DEFAULT 1000,
    utilized_capacity_pallets INT NOT NULL DEFAULT 0,
    temperature_zone_min NUMERIC(5, 2),
    temperature_zone_max NUMERIC(5, 2),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS inventory.storage_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    warehouse_id UUID NOT NULL REFERENCES inventory.warehouses(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    zone_type VARCHAR(50) NOT NULL,
    temperature_min NUMERIC(5, 2),
    temperature_max NUMERIC(5, 2),
    capacity_m3 NUMERIC(10, 2)
);

CREATE TABLE IF NOT EXISTS inventory.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category_id UUID REFERENCES inventory.categories(id) ON DELETE SET NULL,
    unit_of_measure VARCHAR(20) NOT NULL DEFAULT 'PIECE',
    weight_kg NUMERIC(10, 3),
    volume_m3 NUMERIC(10, 4),
    reorder_point INT NOT NULL DEFAULT 10,
    safety_stock INT NOT NULL DEFAULT 5,
    supplier_company_id UUID,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS inventory.stock_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES inventory.products(id) ON DELETE CASCADE,
    warehouse_id UUID NOT NULL REFERENCES inventory.warehouses(id) ON DELETE CASCADE,
    quantity_available INT NOT NULL DEFAULT 0,
    quantity_reserved INT NOT NULL DEFAULT 0,
    batch_number VARCHAR(100),
    lot_number VARCHAR(100),
    expiry_date DATE,
    status VARCHAR(30) NOT NULL DEFAULT 'IN_STOCK',
    last_counted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ,
    CONSTRAINT uq_stock_product_warehouse_batch UNIQUE (product_id, warehouse_id, batch_number)
);

CREATE INDEX IF NOT EXISTS idx_stock_product_id ON inventory.stock_items(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_warehouse_id ON inventory.stock_items(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON inventory.products(sku);
CREATE INDEX IF NOT EXISTS idx_warehouses_code ON inventory.warehouses(code);
