import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi } from '../api';
import { queryKeys } from '../lib/query-keys';
import type { Product, CreateProductInput, UpdateProductInput } from '../types';
import { useToast } from '@/hooks/use-toast';

/**
 * Fetch all products
 */
export function useProducts(filters?: { search?: string; groupId?: string; status?: string }) {
  return useQuery({
    queryKey: queryKeys.products.list(filters),
    queryFn: () => productsApi.getAll(filters),
  });
}

/**
 * Fetch single product by ID
 */
export function useProduct(id: string) {
  return useQuery({
    queryKey: queryKeys.products.detail(id),
    queryFn: () => productsApi.getById(id),
    enabled: !!id,
  });
}

/**
 * Fetch product stock
 */
export function useProductStock(id: string) {
  return useQuery({
    queryKey: queryKeys.products.stock(id),
    queryFn: () => productsApi.getStock(id),
    enabled: !!id,
  });
}

/**
 * Create new product
 */
export function useCreateProduct() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateProductInput) => productsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.lists() });
      toast({
        title: 'Thành công',
        description: 'Sản phẩm đã được tạo',
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: `Không thể tạo sản phẩm: ${error.message}`,
      });
    },
  });
}

/**
 * Update existing product
 */
export function useUpdateProduct() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductInput }) =>
      productsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(id) });
      toast({
        title: 'Thành công',
        description: 'Sản phẩm đã được cập nhật',
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: `Không thể cập nhật sản phẩm: ${error.message}`,
      });
    },
  });
}

/**
 * Delete product
 */
export function useDeleteProduct() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => productsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.lists() });
      toast({
        title: 'Thành công',
        description: 'Sản phẩm đã được xóa',
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: `Không thể xóa sản phẩm: ${error.message}`,
      });
    },
  });
}
