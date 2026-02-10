import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/apiClient';

// Types
export interface SalesInvoiceItem {
  id?: string;
  sales_invoice_id?: string;
  product_id: string;
  product_code?: string;
  product_name?: string;
  product_unit?: string;
  quantity: number;
  unit_price: number;
  discount: number;
  total_amount: number;
  created_at?: string;
  updated_at?: string;
  product?: {
    id: string;
    code: string;
    name: string;
    unit: string;
  };
}

export interface SalesInvoice {
  id: string;
  code: string;
  customer_id: string | null;
  customer_code?: string;
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  customer_address?: string;
  total_amount: number;
  discount_type: 'amount' | 'percent';
  discount_value: number;
  payment_method: string;
  paid_amount: number;
  note: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  items?: SalesInvoiceItem[];
}

export interface CreateSalesInvoiceInput {
  customer_id?: string | null;
  items: {
    product_id: string;
    quantity: number;
    unit_price: number;
    discount?: number;
  }[];
  discount_type?: 'amount' | 'percent';
  discount_value?: number;
  payment_method?: string;
  paid_amount?: number;
  note?: string;
}

// Get all sales invoices
export function useSalesInvoices() {
  return useQuery<SalesInvoice[]>({
    queryKey: ['sales_invoices'],
    queryFn: async () => {
      const response = await api.get('/sales');
      return response.data;
    },
  });
}

// Alias for compatibility
export function useSalesOrders(page = 1, limit = 50) {
  return useSalesInvoices();
}

// Get sales invoice by ID with items
export function useSalesInvoiceById(id: string | undefined) {
  return useQuery<SalesInvoice | null>({
    queryKey: ['sales_invoice', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await api.get(`/sales/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

// Alias for compatibility
export function useSalesOrder(id: string | undefined) {
  const query = useSalesInvoiceById(id);
  return {
    ...query,
    data: query.data
      ? {
          ...query.data,
          items: query.data.items || [],
        }
      : undefined,
  };
}

// Generate sales code
export function useGenerateSalesCode() {
  return useQuery<{ code: string }>({
    queryKey: ['generate_sales_code'],
    queryFn: async () => {
      const response = await api.get('/sales/generate/code');
      return response.data;
    },
  });
}

// Create sales invoice
export function useCreateSalesInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateSalesInvoiceInput) => {
      const response = await api.post('/sales', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales_invoices'] });
      queryClient.invalidateQueries({ queryKey: ['products'] }); // Refresh stock
    },
  });
}

// Alias for compatibility
export function useCreateSalesOrder() {
  return useCreateSalesInvoice();
}

// Update sales invoice
export function useUpdateSalesInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CreateSalesInvoiceInput }) => {
      const response = await api.put(`/sales/${id}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sales_invoices'] });
      queryClient.invalidateQueries({ queryKey: ['sales_invoice', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['products'] }); // Refresh stock
    },
  });
}

// Delete sales invoice
export function useDeleteSalesInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/sales/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales_invoices'] });
      queryClient.invalidateQueries({ queryKey: ['products'] }); // Refresh stock
    },
  });
}
