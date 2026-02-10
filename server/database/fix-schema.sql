-- Fix Schema: Add missing columns and fix mismatches
-- Run this to fix schema issues found during migration

USE quanlybanhang;

-- Fix products table: rename stock_quantity to stockQuantity if needed
-- Check current column name first
SHOW COLUMNS FROM products LIKE '%stock%';

-- Fix suppliers table: add email column if missing
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS email VARCHAR(100) DEFAULT '';

-- Fix customers table: add email column if missing  
ALTER TABLE customers ADD COLUMN IF NOT EXISTS email VARCHAR(100) DEFAULT '';

-- Verify fixes
DESCRIBE suppliers;
DESCRIBE customers;
DESCRIBE products;

SELECT 'Schema fixes applied successfully!' as status;
