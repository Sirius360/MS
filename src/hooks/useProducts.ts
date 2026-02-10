import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/apiClient';

export type Product = {
  id: string;
  code: string | null;
  name: string;
  category_id: string | null;
  description: string | null;
  unit: string | null;
  cost_price: number;
  sale_price_default: number;
  barcode: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  // Computed fields
  stock_qty?: number;
  average_cost?: number;
  category?: {
    id: string;
    name: string;
  };
};

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const data = await api.products.getAll();

      // Fetch stock for each product
      const productsWithStock = await Promise.all(
        (data || []).map(async (product: any) => {
          try {
            const stockData = await api.products.getStock(product.id);
            return {
              ...product,
              stock_qty: stockData.stock || 0,
              average_cost: product.cost_price || 0,
            };
          } catch (error) {
            console.error(`Failed to get stock for product ${product.id}:`, error);
            return {
              ...product,
              stock_qty: 0,
              average_cost: product.cost_price || 0,
            };
          }
        })
      );

      return productsWithStock as Product[];
    },
  });
}

export function useProductById(id: string) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: async () => {
      const product = await api.products.getById(id);

      // Fetch stock
      try {
        const stockData = await api.products.getStock(id);
        return {
          ...product,
          stock_qty: stockData.stock || 0,
          average_cost: product.cost_price || 0,
        } as Product;
      } catch (error) {
        console.error(`Failed to get stock for product ${id}:`, error);
        return {
          ...product,
          stock_qty: 0,
          average_cost: product.cost_price || 0,
        } as Product;
      }
    },
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: Omit<
        Product,
        'id' | 'created_at' | 'updated_at' | 'stock_qty' | 'average_cost' | 'category'
      >
    ) => {
      return await api.products.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<Product>) => {
      return await api.products.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.products.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
