// Custom hooks for backend API
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '@/lib/api';

// Products
export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: () => api.getProducts(),
  });
}

export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => (id ? api.getProductById(id) : Promise.resolve(null)),
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<api.ProductCreateData> }) =>
      api.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useSearchProducts(query: string) {
  return useQuery({
    queryKey: ['products', 'search', query],
    queryFn: () => api.searchProducts(query),
    enabled: query.length > 0,
  });
}

// Suppliers
export function useSuppliers(search?: string) {
  return useQuery({
    queryKey: ['suppliers', search],
    queryFn: () => api.getSuppliers(search),
  });
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.createSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
  });
}

// Product Groups
export function useProductGroups() {
  return useQuery({
    queryKey: ['productGroups'],
    queryFn: () => api.getProductGroups(),
  });
}

export function useCreateProductGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.createProductGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productGroups'] });
    },
  });
}

// Customers
export function useCustomers(search?: string) {
  return useQuery({
    queryKey: ['customers', search],
    queryFn: () => api.getCustomers(search),
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.createCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}

// Imports
export function useImports(params?: {
  fromDate?: string;
  toDate?: string;
  supplierId?: string;
  code?: string;
}) {
  return useQuery({
    queryKey: ['imports', params],
    queryFn: () => api.getImports(params),
  });
}
