import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { suppliersApi } from '../api';
import { queryKeys } from '../lib/query-keys';
import type { Supplier, CreateSupplierInput, UpdateSupplierInput } from '../types';
import { useToast } from '@/hooks/use-toast';

/**
 * Fetch all suppliers
 */
export function useSuppliers(search?: string) {
  return useQuery({
    queryKey: queryKeys.suppliers.list(search),
    queryFn: () => suppliersApi.getAll(search),
  });
}

/**
 * Fetch single supplier by ID
 */
export function useSupplier(id: string) {
  return useQuery({
    queryKey: queryKeys.suppliers.detail(id),
    queryFn: () => suppliersApi.getById(id),
    enabled: !!id,
  });
}

/**
 * Create new supplier
 */
export function useCreateSupplier() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateSupplierInput) => suppliersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.suppliers.lists() });
      toast({
        title: 'Thành công',
        description: 'Nhà cung cấp đã được tạo',
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: `Không thể tạo nhà cung cấp: ${error.message}`,
      });
    },
  });
}

/**
 * Update existing supplier
 */
export function useUpdateSupplier() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSupplierInput }) =>
      suppliersApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.suppliers.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.suppliers.detail(id) });
      toast({
        title: 'Thành công',
        description: 'Nhà cung cấp đã được cập nhật',
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: `Không thể cập nhật nhà cung cấp: ${error.message}`,
      });
    },
  });
}

/**
 * Delete supplier
 */
export function useDeleteSupplier() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => suppliersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.suppliers.lists() });
      toast({
        title: 'Thành công',
        description: 'Nhà cung cấp đã được xóa',
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: `Không thể xóa nhà cung cấp: ${error.message}`,
      });
    },
  });
}
