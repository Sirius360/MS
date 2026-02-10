import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customersApi } from '../api';
import { queryKeys } from '../lib/query-keys';
import type { Customer, CreateCustomerInput, UpdateCustomerInput } from '../types';
import { useToast } from '@/hooks/use-toast';

/**
 * Fetch all customers
 */
export function useCustomers(search?: string) {
  return useQuery({
    queryKey: queryKeys.customers.list(search),
    queryFn: () => customersApi.getAll(search),
  });
}

/**
 * Fetch single customer by ID
 */
export function useCustomer(id: string) {
  return useQuery({
    queryKey: queryKeys.customers.detail(id),
    queryFn: () => customersApi.getById(id),
    enabled: !!id,
  });
}

/**
 * Create new customer
 */
export function useCreateCustomer() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateCustomerInput) => customersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.lists() });
      toast({
        title: 'Thành công',
        description: 'Khách hàng đã được tạo',
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: `Không thể tạo khách hàng: ${error.message}`,
      });
    },
  });
}

/**
 * Update existing customer
 */
export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCustomerInput }) =>
      customersApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.detail(id) });
      toast({
        title: 'Thành công',
        description: 'Khách hàng đã được cập nhật',
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: `Không thể cập nhật khách hàng: ${error.message}`,
      });
    },
  });
}

/**
 * Delete customer
 */
export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => customersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.lists() });
      toast({
        title: 'Thành công',
        description: 'Khách hàng đã được xóa',
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: `Không thể xóa khách hàng: ${error.message}`,
      });
    },
  });
}
