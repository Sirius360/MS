-- ===== supabase/migrations/YYYYMMDDHHMMSS_add_transaction_functions.sql =====
-- Migration để thêm PostgreSQL functions cho transaction-safe inventory operations

-- ================================================================================
-- 1. FUNCTION: Complete Purchase Order (Nhập hàng) với TRANSACTION
-- ================================================================================
CREATE OR REPLACE FUNCTION complete_purchase_order_transaction(p_order_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_order RECORD;
  v_item RECORD;
  v_product RECORD;
  v_stock_before INTEGER;
  v_stock_after INTEGER;
  v_new_cost_price DECIMAL(15,2);
  v_old_cost_price DECIMAL(15,2);
  v_import_price DECIMAL(15,2);
BEGIN

  -- Bắt đầu transaction (implicit trong function)
  -- PostgreSQL tự động wrap function trong transaction

  -- 1. Get và LOCK purchase order
  SELECT * INTO v_order
  FROM purchase_orders
  WHERE id = p_order_id
  FOR UPDATE NOWAIT;  -- LOCK row, fail fast nếu đang bị lock

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Purchase order not found: %', p_order_id;
  END IF;

  -- 2. Validate status
  IF v_order.status = 'completed' THEN
    RAISE EXCEPTION 'Cannot complete an already completed order: %', v_order.code;
  END IF;

  IF v_order.status = 'cancelled' THEN
    RAISE EXCEPTION 'Cannot complete a cancelled order: %', v_order.code;
  END IF;

  -- 3. Process each item
  FOR v_item IN 
    SELECT * FROM purchase_order_items
    WHERE purchase_order_id = p_order_id
  LOOP
    
    -- 4. Get và LOCK product (FOR UPDATE = row lock)
    SELECT * INTO v_product
    FROM products
    WHERE id = v_item.product_id
    FOR UPDATE;  -- ⭐ CRITICAL: Lock để tránh race condition

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product not found: %', v_item.product_id;
    END IF;

    -- 5. Calculate stock changes
    v_stock_before := COALESCE(v_product.stock, 0);
    v_stock_after := v_stock_before + v_item.quantity;
    
    -- 6. Calculate weighted average cost price
    v_old_cost_price := COALESCE(v_product.cost_price, 0);
    v_import_price := COALESCE(v_item.import_price, v_item.unit_price);
    
    IF v_stock_before > 0 THEN
      -- Weighted average: (old_qty * old_cost + new_qty * new_cost) / total_qty
      v_new_cost_price := ((v_stock_before * v_old_cost_price) + (v_item.quantity * v_import_price)) / v_stock_after;
    ELSE
      -- First stock, use import price
      v_new_cost_price := v_import_price;
    END IF;

    -- 7. Insert stock card (audit trail)
    INSERT INTO stock_cards (
      product_id,
      ref_code,
      ref_type,
      transaction_type,
      quantity,
      unit_cost,
      stock_before,
      stock_after,
      note,
      created_at
    ) VALUES (
      v_item.product_id,
      v_order.code,
      'PN',  -- Phiếu Nhập
      'IN',
      v_item.quantity,
      v_import_price,
      v_stock_before,
      v_stock_after,
      'Nhập hàng từ phiếu ' || v_order.code,
      NOW()
    );

    -- 8. Update product stock & cost - ATOMICALLY
    UPDATE products
    SET 
      stock = v_stock_after,
      cost_price = v_new_cost_price,
      updated_at = NOW()
    WHERE id = v_item.product_id;

    -- Log
    RAISE NOTICE 'Updated stock for product % (id=%): % -> %', 
      v_product.code, v_product.id, v_stock_before, v_stock_after;
    
  END LOOP;

  -- 9. Update order status
  UPDATE purchase_orders
  SET 
    status = 'completed',
    updated_at = NOW()
  WHERE id = p_order_id;

  -- 10. Return success
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Purchase order ' || v_order.code || ' completed successfully',
    'data', jsonb_build_object(
      'order_id', v_order.id,
      'code', v_order.code,
      'status', 'completed'
    )
  );

-- Exception handling
EXCEPTION
  WHEN lock_not_available THEN
    RAISE EXCEPTION 'Order is being processed by another transaction. Please try again.';
  WHEN OTHERS THEN
    -- PostgreSQL automatically ROLLBACK khi có exception
    RAISE EXCEPTION 'Transaction failed: %', SQLERRM;
END;
$$;

-- ================================================================================
-- 2. FUNCTION: Create Sales Order (Bán hàng) với TRANSACTION
-- ================================================================================
CREATE OR REPLACE FUNCTION create_sales_order_transaction(
  p_customer_id UUID,
  p_items JSONB,  -- Array of {product_id, quantity, unit_price, discount}
  p_discount_type TEXT,
  p_discount_value DECIMAL(15,2),
  p_vat_rate DECIMAL(5,2),
  p_other_fee DECIMAL(15,2),
  p_paid_amount DECIMAL(15,2),
  p_note TEXT,
  p_sale_date TIMESTAMPTZ
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_code TEXT;
  v_order_id UUID;
  v_item JSONB;
  v_product RECORD;
  v_stock_before INTEGER;
  v_stock_after INTEGER;
  v_total_items DECIMAL(15,2) := 0;
  v_after_discount DECIMAL(15,2);
  v_vat_amount DECIMAL(15,2);
  v_final_amount DECIMAL(15,2);
  v_item_total DECIMAL(15,2);
  v_quantity INTEGER;
  v_unit_price DECIMAL(15,2);
  v_discount DECIMAL(15,2);
  v_cost_price DECIMAL(15,2);
  v_profit DECIMAL(15,2);
BEGIN
  
  -- 1. Generate sales order code
  SELECT generate_sales_order_code() INTO v_code;

  -- 2. VALIDATE STOCK FIRST với FOR UPDATE (lock tất cả products)
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_quantity := (v_item->>'quantity')::INTEGER;
    
    -- LOCK product row
    SELECT * INTO v_product
    FROM products
    WHERE id = (v_item->>'product_id')::UUID
    FOR UPDATE;  -- ⭐ CRITICAL: Lock ngay từ đầu

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product not found: %', (v_item->>'product_id');
    END IF;

    -- CHECK STOCK
    IF COALESCE(v_product.stock, 0) < v_quantity THEN
      RAISE EXCEPTION 'Insufficient stock for % (%). Available: %, Requested: %',
        v_product.code, v_product.name, COALESCE(v_product.stock, 0), v_quantity;
    END IF;
  END LOOP;

  -- 3. Calculate totals
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_quantity := (v_item->>'quantity')::INTEGER;
    v_unit_price := (v_item->>'unit_price')::DECIMAL(15,2);
    v_discount := COALESCE((v_item->>'discount')::DECIMAL(15,2), 0);
    v_item_total := (v_unit_price * v_quantity) - v_discount;
    v_total_items := v_total_items + v_item_total;
  END LOOP;

  -- Calculate discounts & fees
  IF p_discount_type = 'percent' THEN
    v_after_discount := v_total_items * (1 - COALESCE(p_discount_value, 0) / 100);
  ELSE
    v_after_discount := v_total_items - COALESCE(p_discount_value, 0);
  END IF;

  v_vat_amount := v_after_discount * (COALESCE(p_vat_rate, 0) / 100);
  v_final_amount := v_after_discount + v_vat_amount + COALESCE(p_other_fee, 0);

  -- Validate payment
  IF COALESCE(p_paid_amount, 0) < v_final_amount THEN
    RAISE EXCEPTION 'Paid amount (%) must be >= final amount (%)', p_paid_amount, v_final_amount;
  END IF;

  -- 4. Create sales order
  INSERT INTO sales_orders (
    code,
    customer_id,
    total_items,
    discount_type,
    discount_value,
    after_discount,
    vat_rate,
    vat_amount,
    other_fee,
    final_amount,
    paid_amount,
    status,
    payment_status,
    note,
    sale_date,
    created_at
  ) VALUES (
    v_code,
    p_customer_id,
    v_total_items,
    p_discount_type,
    p_discount_value,
    v_after_discount,
    p_vat_rate,
    v_vat_amount,
    p_other_fee,
    v_final_amount,
    p_paid_amount,
    'completed',
    'paid',
    p_note,
    COALESCE(p_sale_date, NOW()),
    NOW()
  )
  RETURNING id INTO v_order_id;

  -- 5. Process items & update stock
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_quantity := (v_item->>'quantity')::INTEGER;
    v_unit_price := (v_item->>'unit_price')::DECIMAL(15,2);
    v_discount := COALESCE((v_item->>'discount')::DECIMAL(15,2), 0);
    v_item_total := (v_unit_price * v_quantity) - v_discount;

    -- Get product (already locked from validation step)
    SELECT * INTO v_product
    FROM products
    WHERE id = (v_item->>'product_id')::UUID;

    v_cost_price := COALESCE(v_product.cost_price, 0);
    v_profit := v_item_total - (v_cost_price * v_quantity);

    -- Insert sales order item
    INSERT INTO sales_order_items (
      sales_order_id,
      product_id,
      quantity,
      unit_price,
      discount,
      total_amount,
      cost_price,
      profit,
      created_at
    ) VALUES (
      v_order_id,
      (v_item->>'product_id')::UUID,
      v_quantity,
      v_unit_price,
      v_discount,
      v_item_total,
      v_cost_price,
      v_profit,
      NOW()
    );

    -- Calculate stock changes
    v_stock_before := COALESCE(v_product.stock, 0);
    v_stock_after := v_stock_before - v_quantity;

    -- Insert stock card (audit trail)
    INSERT INTO stock_cards (
      product_id,
      ref_code,
      ref_type,
      transaction_type,
      quantity,
      unit_cost,
      stock_before,
      stock_after,
      note,
      created_at
    ) VALUES (
      (v_item->>'product_id')::UUID,
      v_code,
      'HD',  -- Hóa Đơn
      'OUT',
      -v_quantity,  -- Negative for OUT
      v_cost_price,
      v_stock_before,
      v_stock_after,
      'Bán hàng từ hóa đơn ' || v_code,
      NOW()
    );

    -- Update product stock ATOMICALLY
    UPDATE products
    SET 
      stock = v_stock_after,
      updated_at = NOW()
    WHERE id = (v_item->>'product_id')::UUID;

    RAISE NOTICE 'Updated stock for %: % -> %', v_product.code, v_stock_before, v_stock_after;
  END LOOP;

  -- 6. Return success
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Sales order ' || v_code || ' created successfully',
    'data', jsonb_build_object(
      'order_id', v_order_id,
      'code', v_code,
      'final_amount', v_final_amount,
      'paid_amount', p_paid_amount,
      'change', p_paid_amount - v_final_amount
    )
  );

EXCEPTION
  WHEN lock_not_available THEN
    RAISE EXCEPTION 'Products are being modified by another transaction. Please try again.';
  WHEN OTHERS THEN
    -- Auto ROLLBACK
    RAISE EXCEPTION 'Transaction failed: %', SQLERRM;
END;
$$;

-- ================================================================================
-- COMMENTS
-- ================================================================================
COMMENT ON FUNCTION complete_purchase_order_transaction IS 
'Transaction-safe function để hoàn thành phiếu nhập hàng. Tự động:
- Lock purchase order và products (FOR UPDATE)
- Update stock với weighted average cost
- Insert stock cards
- Auto ROLLBACK nếu có lỗi';

COMMENT ON FUNCTION create_sales_order_transaction IS
'Transaction-safe function để tạo hóa đơn bán. Tự động:
- Validate và lock products (FOR UPDATE)
- Check stock availability
- Deduct stock
- Insert stock cards
- Auto ROLLBACK nếu có lỗi';
