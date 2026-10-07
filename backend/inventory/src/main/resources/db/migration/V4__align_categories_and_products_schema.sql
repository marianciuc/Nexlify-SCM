-- Align inventory.categories with CategoryEn entity
ALTER TABLE inventory.categories ALTER COLUMN code DROP NOT NULL;
ALTER TABLE inventory.categories ALTER COLUMN name TYPE VARCHAR(200);
ALTER TABLE inventory.categories ADD COLUMN IF NOT EXISTS slug VARCHAR(200);
UPDATE inventory.categories SET slug = code WHERE slug IS NULL AND code IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_category_slug ON inventory.categories(slug);
ALTER TABLE inventory.categories ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0;
ALTER TABLE inventory.categories ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

-- Align inventory.products with ProductEn entity
ALTER TABLE inventory.products ALTER COLUMN name TYPE VARCHAR(300);
ALTER TABLE inventory.products ALTER COLUMN unit_of_measure DROP NOT NULL;
ALTER TABLE inventory.products ADD COLUMN IF NOT EXISTS unit VARCHAR(30) NOT NULL DEFAULT 'pcs';
ALTER TABLE inventory.products ADD COLUMN IF NOT EXISTS unit_price NUMERIC(14, 2) NOT NULL DEFAULT 0;
ALTER TABLE inventory.products ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'PLN';
ALTER TABLE inventory.products ADD COLUMN IF NOT EXISTS dimensions VARCHAR(100);
ALTER TABLE inventory.products ADD COLUMN IF NOT EXISTS manufacturer VARCHAR(200);
ALTER TABLE inventory.products ADD COLUMN IF NOT EXISTS brand VARCHAR(200);
ALTER TABLE inventory.products ADD COLUMN IF NOT EXISTS min_order_quantity INT DEFAULT 1;
