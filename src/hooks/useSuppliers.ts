import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/apiClient';

export interface Supplier {
  id: string;
  code: string | null;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface CreateSupplierInput {
  code?: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  status?: string;
}

// Get all suppliers
export function useSuppliers() {
  return useQuery<Supplier[]>({
    queryKey: ['suppliers'],
    queryFn: async () => {
      const data = await api.suppliers.getAll();
      return data;
    },
  });
}

// Get supplier by ID
export function useSupplierById(id: string | undefined) {
  return useQuery<Supplier | null>({
    queryKey: ['supplier', id],
    queryFn: async () => {
      if (!id) return null;
      const data = await api.suppliers.getById(id);
      return data;
    },
    enabled: !!id,
  });
}

// Create supplier
export function useCreateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateSupplierInput) => {
      return await api.suppliers.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
  });
}

// Update supplier
export function useUpdateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateSupplierInput> }) => {
      return await api.suppliers.update(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      queryClient.invalidateQueries({ queryKey: ['supplier', variables.id] });
    },
  });
}

// Delete supplier
export function useDeleteSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return await api.suppliers.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
  });
}
