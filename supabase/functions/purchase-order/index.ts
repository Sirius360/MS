// ===== supabase/functions/purchase-order/index.ts =====
// REFACTORED với Transaction-safe operations và Row-level locking

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createClient as createPgClient } from "https://deno.land/x/postgres@v0.17.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PurchaseOrderItem {
  product_id: string;
  quantity: number;
  unit_price: number;
  discount?: number;
}

interface CreatePurchaseOrderRequest {
  action: 'create';
  supplier_id?: string;
  items: PurchaseOrderItem[];
  discount_type?: 'amount' | 'percent';
  discount_value?: number;
  vat_rate?: number;
  other_fee?: number;
  note?: string;
  received_at?: string;
}

interface CompletePurchaseOrderRequest {
  action: 'complete';
  order_id: string;
}

interface GetPurchaseOrderRequest {
  action: 'get' | 'list';
  order_id?: string;
  page?: number;
  limit?: number;
}

type PurchaseOrderRequest = CreatePurchaseOrderRequest | CompletePurchaseOrderRequest | GetPurchaseOrderRequest;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const request = await req.json() as PurchaseOrderRequest;
    console.log(`[PurchaseOrder] Action: ${request.action}`);

    switch (request.action) {
      case 'list': {
        const page = request.page || 1;
        const limit = request.limit || 50;
        const offset = (page - 1) * limit;

        const { data: orders, error: ordersError, count } = await supabase
          .from('purchase_orders')
          .select(`
            *,
            supplier:suppliers(id, code, name)
          `, { count: 'exact' })
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);

        if (ordersError) throw ordersError;

        const ordersWithTotal = await Promise.all(
          (orders || []).map(async (order) => {
            const { data: items } = await supabase
              .from('purchase_order_items')
              .select('total_amount')
              .eq('purchase_order_id', order.id);

            const items_total = (items || []).reduce(
              (sum, item) => sum + Number(item.total_amount || 0),
              0
            );

            return { ...order, items_total };
          })
        );

        return new Response(
          JSON.stringify({
            success: true,
            data: ordersWithTotal,
            pagination: {
              page,
              limit,
              total: count || 0,
              total_pages: Math.ceil((count || 0) / limit),
            },
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get': {
        if (!request.order_id) {
          throw new Error('order_id is required');
        }

        const { data: order, error: orderError } = await supabase
          .from('purchase_orders')
          .select(`
            *,
            supplier:suppliers(id, code, name, phone, address)
          `)
          .eq('id', request.order_id)
          .maybeSingle();

        if (orderError) throw orderError;
        if (!order) throw new Error('Purchase order not found');

        const { data: items, error: itemsError } = await supabase
          .from('purchase_order_items')
          .select(`
            *,
            product:products(id, code, name, unit, stock, cost_price, sale_price_default)
          `)
          .eq('purchase_order_id', request.order_id);

        if (itemsError) throw itemsError;

        return new Response(
          JSON.stringify({
            success: true,
            data: { ...order, items: items || [] },
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'create': {
        const createReq = request as CreatePurchaseOrderRequest;

        if (!createReq.items || createReq.items.length === 0) {
          throw new Error('items array is required');
        }

        // Generate code
        const { data: code, error: codeError } = await supabase.rpc('generate_purchase_order_code');
        if (codeError) throw codeError;

        console.log(`[PurchaseOrder] Generated code: ${code}`);

        // Calculate items
        const itemDetails = createReq.items.map((item) => {
          const quantity = Number(item.quantity);
          const unitPrice = Number(item.unit_price);
          const discount = Number(item.discount || 0);

          if (quantity <= 0) throw new Error('Quantity must be greater than 0');
          if (unitPrice < 0) throw new Error('Unit price cannot be negative');

          const total_amount = (unitPrice * quantity) - discount;
          const import_price = total_amount / quantity;

          return {
            product_id: item.product_id,
            quantity,
            unit_price: unitPrice,
            discount,
            total_amount,
            import_price,
          };
        });

        // Calculate order totals
        const total_amount = itemDetails.reduce((sum, item) => sum + item.total_amount, 0);
        const discountType = createReq.discount_type || 'amount';
        const discountValue = Number(createReq.discount_value || 0);

        let after_discount: number;
        if (discountType === 'percent') {
          after_discount = total_amount * (1 - discountValue / 100);
        } else {
          after_discount = total_amount - discountValue;
        }

        const vatRate = Number(createReq.vat_rate || 0);
        const vat_amount = after_discount * (vatRate / 100);
        const other_fee = Number(createReq.other_fee || 0);
        const final_amount = after_discount + vat_amount + other_fee;

        if (final_amount < 0) {
          throw new Error('Final amount cannot be negative');
        }

        // Create order
        const { data: order, error: orderError } = await supabase
          .from('purchase_orders')
          .insert({
            code,
            supplier_id: createReq.supplier_id || null,
            total_amount,
            discount_type: discountType,
            discount_value: discountValue,
            vat_amount,
            other_fee,
            final_amount,
            status: 'draft',
            note: createReq.note || null,
            received_at: createReq.received_at || new Date().toISOString(),
          })
          .select()
          .single();

        if (orderError) throw orderError;

        // Create items
        const itemsToInsert = itemDetails.map((item) => ({
          ...item,
          purchase_order_id: order.id,
        }));

        const { error: itemsError } = await supabase
          .from('purchase_order_items')
          .insert(itemsToInsert);

        if (itemsError) throw itemsError;

        console.log(`[PurchaseOrder] Created order ${code} with ${itemDetails.length} items`);

        return new Response(
          JSON.stringify({
            success: true,
            data: { ...order, items: itemDetails },
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'complete': {
        const completeReq = request as CompletePurchaseOrderRequest;

        if (!completeReq.order_id) {
          throw new Error('order_id is required');
        }

        console.log(`[PurchaseOrder] Starting TRANSACTION for order: ${completeReq.order_id}`);

        // ⭐⭐⭐ TRANSACTION-SAFE COMPLETE OPERATION ⭐⭐⭐
        try {
          // Begin transaction by using RPC function
          const { data: result, error: rpcError } = await supabase.rpc('complete_purchase_order_transaction', {
            p_order_id: completeReq.order_id
          });

          if (rpcError) throw rpcError;

          console.log(`[PurchaseOrder] Transaction completed successfully`);

          return new Response(
            JSON.stringify({
              success: true,
              message: result.message,
              data: result.data,
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );

        } catch (txError) {
          console.error(`[PurchaseOrder] Transaction FAILED:`, txError);
          throw txError;
        }
      }

      default:
        throw new Error(`Unknown action: ${(request as any).action}`);
    }

  } catch (error) {
    console.error('[PurchaseOrder] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
