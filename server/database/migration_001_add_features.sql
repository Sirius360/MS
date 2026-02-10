-- Migration: Add KiotViet-style features
-- Date: 2026-01-22

USE quanlybanhang;

-- 1. Add importDateTime to imports table
ALTER TABLE imports 
ADD COLUMN IF NOT EXISTS importDateTime DATETIME DEFAULT CURRENT_TIMESTAMP
AFTER date;

-- 2. Add code column to imports table
ALTER TABLE imports 
ADD COLUMN IF NOT EXISTS code VARCHAR(20) UNIQUE
AFTER id;

-- 3. Add createdBy to imports table
ALTER TABLE imports 
ADD COLUMN IF NOT EXISTS createdBy VARCHAR(36)
AFTER notes;

-- 4. Add discountAmount to imports table
ALTER TABLE imports 
ADD COLUMN IF NOT EXISTS discountAmount DECIMAL(15, 2) DEFAULT 0
AFTER totalAmount;

-- 5. Add foreign key for createdBy
ALTER TABLE imports 
ADD CONSTRAINT fk_imports_createdBy 
FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE SET NULL;

-- 6. Add discount column to import_items
ALTER TABLE import_items 
ADD COLUMN IF NOT EXISTS discount DECIMAL(15, 2) DEFAULT 0
AFTER unitPrice;

-- 7. Add code and email to suppliers table
ALTER TABLE suppliers 
ADD COLUMN IF NOT EXISTS code VARCHAR(20) UNIQUE
AFTER id;

ALTER TABLE suppliers 
ADD COLUMN IF NOT EXISTS email VARCHAR(100)
AFTER phone;

-- 8. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_imports_code ON imports(code);
CREATE INDEX IF NOT EXISTS idx_imports_importDateTime ON imports(importDateTime);
CREATE INDEX IF NOT EXISTS idx_imports_createdBy ON imports(createdBy);
CREATE INDEX IF NOT EXISTS idx_suppliers_code ON suppliers(code);

-- 9. Backfill codes for existing records
-- This will be done by application on first run or manually

-- For imports: PN000001, PN000002, etc.
SET @import_counter = 0;
UPDATE imports 
SET code = CONCAT('PN', LPAD((@import_counter := @import_counter + 1), 6, '0'))
WHERE code IS NULL
ORDER BY createdAt;

-- For suppliers: NCC000001, NCC000002, etc.
SET @supplier_counter = 0;
UPDATE suppliers 
SET code = CONCAT('NCC', LPAD((@supplier_counter := @supplier_counter + 1), 6, '0'))
WHERE code IS NULL
ORDER BY createdAt;

-- For products: SP000001, SP000002, etc. (using sku field)
-- Only if sku doesn't already follow pattern
UPDATE products 
SET sku = CONCAT('SP', LPAD(id, 6, '0'))
WHERE sku NOT LIKE 'SP%' AND sku IS NOT NULL;

-- 10. Update importDateTime with date values for existing records
UPDATE imports 
SET importDateTime = TIMESTAMP(date)
WHERE importDateTime IS NULL OR importDateTime < date;

COMMIT;
