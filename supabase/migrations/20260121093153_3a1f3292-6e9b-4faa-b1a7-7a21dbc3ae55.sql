-- Create code_counters table for atomic code generation
CREATE TABLE IF NOT EXISTS public.code_counters (
  id text PRIMARY KEY,
  prefix text NOT NULL,
  last_number bigint NOT NULL DEFAULT 0,
  padding integer NOT NULL DEFAULT 6,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Insert initial counters
INSERT INTO public.code_counters (id, prefix, last_number, padding) VALUES
  ('product', 'SP', 0, 6),
  ('purchase_order', 'PN', 0, 6),
  ('customer', 'KH', 0, 5),
  ('supplier', 'NCC', 0, 5),
  ('sales_order', 'HD', 0, 6)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE public.code_counters ENABLE ROW LEVEL SECURITY;

-- RLS policy - only service role can access
CREATE POLICY "Service role only for code_counters"
ON public.code_counters
FOR ALL
USING (false)
WITH CHECK (false);

-- Drop old functions
DROP FUNCTION IF EXISTS public.generate_product_code();
DROP FUNCTION IF EXISTS public.generate_purchase_order_code();
DROP FUNCTION IF EXISTS public.generate_supplier_code();
DROP FUNCTION IF EXISTS public.generate_sales_order_code();

-- Create new atomic code generation function
CREATE OR REPLACE FUNCTION public.generate_code(p_type text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_prefix text;
  v_padding integer;
  v_next_number bigint;
  v_code text;
BEGIN
  -- Lock and update the counter atomically
  UPDATE public.code_counters
  SET last_number = last_number + 1,
      updated_at = now()
  WHERE id = p_type
  RETURNING prefix, padding, last_number INTO v_prefix, v_padding, v_next_number;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Unknown code type: %', p_type;
  END IF;

  -- Generate the code
  v_code := v_prefix || LPAD(v_next_number::text, v_padding, '0');
  
  RETURN v_code;
END;
$$;

-- Wrapper functions for backwards compatibility
CREATE OR REPLACE FUNCTION public.generate_product_code()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.generate_code('product');
$$;

CREATE OR REPLACE FUNCTION public.generate_purchase_order_code()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.generate_code('purchase_order');
$$;

CREATE OR REPLACE FUNCTION public.generate_supplier_code()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.generate_code('supplier');
$$;

CREATE OR REPLACE FUNCTION public.generate_sales_order_code()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.generate_code('sales_order');
$$;

-- New function for customer code
CREATE OR REPLACE FUNCTION public.generate_customer_code()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.generate_code('customer');
$$;

-- Add missing columns to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS sale_price_before_tax numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS sale_price_after_tax numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS vat_input numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS min_stock integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_stock integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS direct_sale boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS brand text;

-- Add index for code searches
CREATE INDEX IF NOT EXISTS idx_products_code_search ON public.products (code);
CREATE INDEX IF NOT EXISTS idx_products_name_search ON public.products USING gin(to_tsvector('simple', name));
CREATE INDEX IF NOT EXISTS idx_customers_code ON public.customers (code);
CREATE INDEX IF NOT EXISTS idx_customers_search ON public.customers USING gin(to_tsvector('simple', name));
CREATE INDEX IF NOT EXISTS idx_suppliers_code ON public.suppliers (code);
CREATE INDEX IF NOT EXISTS idx_suppliers_search ON public.suppliers USING gin(to_tsvector('simple', name));

-- Add index for purchase orders date search
CREATE INDEX IF NOT EXISTS idx_purchase_orders_received_at ON public.purchase_orders (received_at);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON public.purchase_orders (status);

-- Sync existing product codes to counter (get max number)
DO $$
DECLARE
  max_product_num bigint;
  max_po_num bigint;
  max_customer_num bigint;
  max_supplier_num bigint;
  max_sales_num bigint;
BEGIN
  -- Products: extract number from SP000001 format
  SELECT COALESCE(MAX(CAST(NULLIF(SUBSTRING(code FROM 3), '') AS bigint)), 0) INTO max_product_num
  FROM public.products WHERE code ~ '^SP[0-9]+$';
  
  UPDATE public.code_counters SET last_number = GREATEST(last_number, max_product_num) WHERE id = 'product';

  -- Purchase orders: extract number from PN000001 format (may have old date-based format)
  SELECT COALESCE(MAX(CAST(NULLIF(SUBSTRING(code FROM 3), '') AS bigint)), 0) INTO max_po_num
  FROM public.purchase_orders WHERE code ~ '^PN[0-9]+$';
  
  UPDATE public.code_counters SET last_number = GREATEST(last_number, max_po_num) WHERE id = 'purchase_order';

  -- Customers
  SELECT COALESCE(MAX(CAST(NULLIF(SUBSTRING(code FROM 3), '') AS bigint)), 0) INTO max_customer_num
  FROM public.customers WHERE code ~ '^KH[0-9]+$';
  
  UPDATE public.code_counters SET last_number = GREATEST(last_number, max_customer_num) WHERE id = 'customer';

  -- Suppliers
  SELECT COALESCE(MAX(CAST(NULLIF(SUBSTRING(code FROM 4), '') AS bigint)), 0) INTO max_supplier_num
  FROM public.suppliers WHERE code ~ '^NCC[0-9]+$';
  
  UPDATE public.code_counters SET last_number = GREATEST(last_number, max_supplier_num) WHERE id = 'supplier';

  -- Sales orders
  SELECT COALESCE(MAX(CAST(NULLIF(SUBSTRING(code FROM 3), '') AS bigint)), 0) INTO max_sales_num
  FROM public.sales_orders WHERE code ~ '^HD[0-9]+$';
  
  UPDATE public.code_counters SET last_number = GREATEST(last_number, max_sales_num) WHERE id = 'sales_order';
END $$;