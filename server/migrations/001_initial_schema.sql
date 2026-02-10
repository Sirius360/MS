-- Quanlybanhang Database Schema
-- MySQL Migration from Supabase

-- Categories (Product Groups)
CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Code Counters (for auto-increment codes)
CREATE TABLE IF NOT EXISTS code_counters (
  id VARCHAR(50) PRIMARY KEY,
  prefix VARCHAR(10) NOT NULL,
  last_number INT DEFAULT 0,
  padding INT DEFAULT 6,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default code counters
INSERT INTO code_counters (id, prefix, last_number, padding) VALUES
('PRODUCT', 'SP', 0, 6),
('PURCHASE', 'PN', 0, 6),
('SALES', 'HD', 0, 6),
('CUSTOMER', 'KH', 0, 4),
('SUPPLIER', 'NCC', 0, 4)
ON DUPLICATE KEY UPDATE id=id;

-- Customers
CREATE TABLE IF NOT EXISTS customers (
  id VARCHAR(36) PRIMARY KEY,
  code VARCHAR(50),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255),
  address TEXT,
  notes TEXT,
  status VARCHAR(20) DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_code (code),
  INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Suppliers
CREATE TABLE IF NOT EXISTS suppliers (
  id VARCHAR(36) PRIMARY KEY,
  code VARCHAR(50),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255),
  address TEXT,
  notes TEXT,
  status VARCHAR(20) DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_code (code),
  INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Products
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(36) PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  barcode VARCHAR(100),
  name VARCHAR(255) NOT NULL,
  category_id VARCHAR(36),
  brand VARCHAR(100),
  unit VARCHAR(20) DEFAULT 'cái',
  cost_price DECIMAL(15,2) DEFAULT 0,
  sale_price_default DECIMAL(15,2) DEFAULT 0,
  sale_price_before_tax DECIMAL(15,2),
  sale_price_after_tax DECIMAL(15,2),
  vat_sale DECIMAL(5,2) DEFAULT 0,
  vat_input DECIMAL(5,2),
  min_stock DECIMAL(15,3),
  max_stock DECIMAL(15,3),
  track_inventory BOOLEAN DEFAULT TRUE,
  direct_sale BOOLEAN DEFAULT TRUE,
  image_url VARCHAR(500),
  notes TEXT,
  status VARCHAR(20) DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  INDEX idx_code (code),
  INDEX idx_category (category_id),
  INDEX idx_status (status),
  INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Purchase Receipts (Header)
CREATE TABLE IF NOT EXISTS purchase_receipts (
  id VARCHAR(36) PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  supplier_id VARCHAR(36),
  receipt_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  total_amount DECIMAL(15,2) DEFAULT 0,
  discount_type VARCHAR(20) DEFAULT 'amount',
  discount_value DECIMAL(15,2) DEFAULT 0,
  final_amount DECIMAL(15,2) DEFAULT 0,
  note TEXT,
  status VARCHAR(20) DEFAULT 'draft',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by VARCHAR(36),
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL,
  INDEX idx_code (code),
  INDEX idx_supplier (supplier_id),
  INDEX idx_date (receipt_date),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Purchase Receipt Items (Lines)
CREATE TABLE IF NOT EXISTS purchase_receipt_items (
  id VARCHAR(36) PRIMARY KEY,
  purchase_receipt_id VARCHAR(36) NOT NULL,
  product_id VARCHAR(36) NOT NULL,
  quantity DECIMAL(15,3) NOT NULL,
  unit_price DECIMAL(15,2) NOT NULL,
  discount DECIMAL(15,2) DEFAULT 0,
  total_price DECIMAL(15,2) NOT NULL,
  import_price DECIMAL(15,2),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (purchase_receipt_id) REFERENCES purchase_receipts(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
  INDEX idx_receipt (purchase_receipt_id),
  INDEX idx_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sales Invoices (Header)
CREATE TABLE IF NOT EXISTS sales_invoices (
  id VARCHAR(36) PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  customer_id VARCHAR(36),
  sale_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  total_amount DECIMAL(15,2) DEFAULT 0,
  discount_type VARCHAR(20) DEFAULT 'amount',
  discount_value DECIMAL(15,2) DEFAULT 0,
  extra_fee DECIMAL(15,2) DEFAULT 0,
  vat_enabled BOOLEAN DEFAULT FALSE,
  vat_amount DECIMAL(15,2) DEFAULT 0,
  final_amount DECIMAL(15,2) DEFAULT 0,
  note TEXT,
  status VARCHAR(20) DEFAULT 'completed',
  payment_status VARCHAR(20) DEFAULT 'unpaid',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by VARCHAR(36),
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
  INDEX idx_code (code),
  INDEX idx_customer (customer_id),
  INDEX idx_date (sale_date),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sales Invoice Items (Lines)
CREATE TABLE IF NOT EXISTS sales_invoice_items (
  id VARCHAR(36) PRIMARY KEY,
  sales_invoice_id VARCHAR(36) NOT NULL,
  product_id VARCHAR(36) NOT NULL,
  quantity DECIMAL(15,3) NOT NULL,
  sale_price DECIMAL(15,2) NOT NULL,
  discount DECIMAL(15,2) DEFAULT 0,
  total_price DECIMAL(15,2) NOT NULL,
  cost_price DECIMAL(15,2) DEFAULT 0,
  profit DECIMAL(15,2) DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sales_invoice_id) REFERENCES sales_invoices(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
  INDEX idx_invoice (sales_invoice_id),
  INDEX idx_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inventory Transactions (Stock Ledger)
CREATE TABLE IF NOT EXISTS inventory_transactions (
  id VARCHAR(36) PRIMARY KEY,
  product_id VARCHAR(36) NOT NULL,
  transaction_type VARCHAR(10) NOT NULL,
  reference_type VARCHAR(20) NOT NULL,
  reference_id VARCHAR(36) NOT NULL,
  quantity DECIMAL(15,3) NOT NULL,
  unit_cost DECIMAL(15,2),
  note TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(36),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
  INDEX idx_product (product_id),
  INDEX idx_reference (reference_type, reference_id),
  INDEX idx_date (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Payments
CREATE TABLE IF NOT EXISTS payments (
  id VARCHAR(36) PRIMARY KEY,
  reference_type VARCHAR(20) NOT NULL,
  reference_id VARCHAR(36) NOT NULL,
  method VARCHAR(20) DEFAULT 'cash',
  amount DECIMAL(15,2) NOT NULL,
  note TEXT,
  paid_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(36),
  INDEX idx_reference (reference_type, reference_id),
  INDEX idx_date (paid_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Stock Cards (Audit Trail)
CREATE TABLE IF NOT EXISTS stock_cards (
  id VARCHAR(36) PRIMARY KEY,
  product_id VARCHAR(36) NOT NULL,
  transaction_type VARCHAR(20) NOT NULL,
  ref_type VARCHAR(20) NOT NULL,
  ref_code VARCHAR(50) NOT NULL,
  quantity DECIMAL(15,3) NOT NULL,
  stock_before DECIMAL(15,3) DEFAULT 0,
  stock_after DECIMAL(15,3) DEFAULT 0,
  unit_cost DECIMAL(15,2),
  note TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(36),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
  INDEX idx_product (product_id),
  INDEX idx_date (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
