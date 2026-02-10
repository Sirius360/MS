import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/apiClient';

// Types
export interface PurchaseReceiptItem {
  id?: string;
  purchase_receipt_id?: string;
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

export interface PurchaseReceipt {
  id: string;
  code: string;
  supplier_id: string | null;
  supplier_code?: string;
  supplier_name?: string;
  supplier_phone?: string;
  supplier_email?: string;
  supplier_address?: string;
  total_amount: number;
  discount_type: 'amount' | 'percent';
  discount_value: number;
  other_fee: number;
  note: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  items?: PurchaseReceiptItem[];
}

export interface CreatePurchaseReceiptInput {
  supplier_id?: string | null;
  items: {
    product_id: string;
    quantity: number;
    unit_price: number;
    discount?: number;
  }[];
  discount_type?: 'amount' | 'percent';
  discount_value?: number;
  other_fee?: number;
  note?: string;
}

// Get all purchase receipts
export function usePurchaseReceipts() {
  return useQuery<PurchaseReceipt[]>({
    queryKey: ['purchase_receipts'],
    queryFn: async () => {
      const response = await api.get('/purchases');
      return response.data;
    },
  });
}

// Alias for compatibility
export function usePurchaseOrders(page = 1, limit = 50) {
  return usePurchaseReceipts();
}

// Get purchase receipt by ID with items
export function usePurchaseReceiptById(id: string | undefined) {
  return useQuery<PurchaseReceipt | null>({
    queryKey: ['purchase_receipt', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await api.get(`/purchases/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

// Alias for compatibility with existing code
export function usePurchaseOrderWithItems(id: string | undefined) {
  const query = usePurchaseReceiptById(id);
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

// Generate purchase code
export function useGeneratePurchaseCode() {
  return useQuery<{ code: string }>({
    queryKey: ['generate_purchase_code'],
    queryFn: async () => {
      const response = await api.get('/purchases/generate/code');
      return response.data;
    },
  });
}

// Create purchase receipt
export function useCreatePurchaseReceipt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePurchaseReceiptInput) => {
      const response = await api.post('/purchases', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase_receipts'] });
    },
  });
}

// Alias for compatibility
export function useCreatePurchaseOrder() {
  return useCreatePurchaseReceipt();
}

// Update purchase receipt
export function useUpdatePurchaseReceipt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CreatePurchaseReceiptInput }) => {
      const response = await api.put(`/purchases/${id}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['purchase_receipts'] });
      queryClient.invalidateQueries({ queryKey: ['purchase_receipt', variables.id] });
    },
  });
}

// Delete purchase receipt
export function useDeletePurchaseReceipt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/purchases/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase_receipts'] });
    },
  });
}
