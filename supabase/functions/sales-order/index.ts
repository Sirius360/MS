// ===== supabase/functions/sales-order/index.ts =====
// REFACTORED với Transaction-safe operations

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SalesOrderItem {
  product_id: string;
  quantity: number;
  unit_price: number;
  discount?: number;
}

interface CreateSalesOrderRequest {
  action: 'create';
  customer_id?: string;
  items: SalesOrderItem[];
  discount_type?: 'amount' | 'percent';
  discount_value?: number;
  vat_rate?: number;
  other_fee?: number;
  paid_amount: number;
  note?: string;
  sale_date?: string;
}

interface GetSalesOrderRequest {
  action: 'get' | 'list';
  order_id?: string;
  page?: number;
  limit?: number;
}

type SalesOrderRequest = CreateSalesOrderRequest | GetSalesOrderRequest;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const request = await req.json() as SalesOrderRequest;
    console.log(`[SalesOrder] Action: ${request.action}`);

    switch (request.action) {
      case 'list': {
        const page = request.page || 1;
        const limit = request.limit || 50;
        const offset = (page - 1) * limit;

        const { data: orders, error: ordersError, count } = await supabase
          .from('sales_orders')
          .select(`
            *,
            customer:customers(id, code, name, phone)
          `, { count: 'exact' })
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);

        if (ordersError) throw ordersError;

        return new Response(
          JSON.stringify({
            success: true,
            data: orders,
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
          .from('sales_orders')
          .select(`
            *,
            customer:customers(id, code, name, phone, address)
          `)
          .eq('id', request.order_id)
          .maybeSingle();

        if (orderError) throw orderError;
        if (!order) throw new Error('Sales order not found');

        const { data: items, error: itemsError } = await supabase
          .from('sales_order_items')
          .select(`
            *,
            product:products(id, code, name, unit)
          `)
          .eq('sales_order_id', request.order_id);

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
        const createReq = request as CreateSalesOrderRequest;

        if (!createReq.items || createReq.items.length === 0) {
          throw new Error('items array is required');
        }

        console.log(`[SalesOrder] Starting TRANSACTION for new sales order`);

        // ⭐⭐⭐ TRANSACTION-SAFE CREATE OPERATION ⭐⭐⭐
        try {
          // Call PostgreSQL function that handles EVERYTHING in a transaction
          const { data: result, error: rpcError } = await supabase.rpc('create_sales_order_transaction', {
            p_customer_id: createReq.customer_id || null,
            p_items: JSON.stringify(createReq.items),
            p_discount_type: createReq.discount_type || 'amount',
            p_discount_value: createReq.discount_value || 0,
            p_vat_rate: createReq.vat_rate || 0,
            p_other_fee: createReq.other_fee || 0,
            p_paid_amount: createReq.paid_amount,
            p_note: createReq.note || null,
            p_sale_date: createReq.sale_date || new Date().toISOString(),
          });

          if (rpcError) throw rpcError;

          console.log(`[SalesOrder] Transaction completed successfully`);

          return new Response(
            JSON.stringify({
              success: true,
              message: result.message,
              data: result.data,
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );

        } catch (txError) {
          console.error(`[SalesOrder] Transaction FAILED:`, txError);
          throw txError;
        }
      }

      default:
        throw new Error(`Unknown action: ${(request as any).action}`);
    }

  } catch (error) {
    console.error('[SalesOrder] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
