import { apiClient } from './client';
import type {
  Product,
  CreateProductInput,
  UpdateProductInput,
  Customer,
  CreateCustomerInput,
  UpdateCustomerInput,
  Supplier,
  CreateSupplierInput,
  UpdateSupplierInput,
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
} from '../types';

/**
 * Products API
 */
export const productsApi = {
  getAll: (params?: { search?: string; groupId?: string; status?: string }) =>
    apiClient.get<Product[]>('/products', { params }),

  getById: (id: string) => apiClient.get<Product>(`/products/${id}`),

  getStock: (id: string) =>
    apiClient.get<{ productId: string; stock: number }>(`/products/${id}/stock`),

  create: (data: CreateProductInput) => apiClient.post<Product>('/products', data),

  update: (id: string, data: UpdateProductInput) => apiClient.put<Product>(`/products/${id}`, data),

  delete: (id: string) => apiClient.delete<{ message: string }>(`/products/${id}`),

  search: (query: string) => apiClient.get<Product[]>('/products/search', { params: { query } }),
};

/**
 * Categories API
 */
export const categoriesApi = {
  getAll: () => apiClient.get<Category[]>('/categories'),

  getById: (id: string) => apiClient.get<Category>(`/categories/${id}`),

  create: (data: CreateCategoryInput) => apiClient.post<Category>('/categories', data),

  update: (id: string, data: UpdateCategoryInput) =>
    apiClient.put<Category>(`/categories/${id}`, data),

  delete: (id: string) => apiClient.delete<{ message: string }>(`/categories/${id}`),
};

/**
 * Customers API
 */
export const customersApi = {
  getAll: (search?: string) =>
    apiClient.get<Customer[]>('/customers', search ? { params: { search } } : undefined),

  getById: (id: string) => apiClient.get<Customer>(`/customers/${id}`),

  create: (data: CreateCustomerInput) => apiClient.post<Customer>('/customers', data),

  update: (id: string, data: UpdateCustomerInput) =>
    apiClient.put<Customer>(`/customers/${id}`, data),

  delete: (id: string) => apiClient.delete<{ message: string }>(`/customers/${id}`),
};

/**
 * Suppliers API
 */
export const suppliersApi = {
  getAll: (search?: string) =>
    apiClient.get<Supplier[]>('/suppliers', search ? { params: { search } } : undefined),

  getById: (id: string) => apiClient.get<Supplier>(`/suppliers/${id}`),

  create: (data: CreateSupplierInput) => apiClient.post<Supplier>('/suppliers', data),

  update: (id: string, data: UpdateSupplierInput) =>
    apiClient.put<Supplier>(`/suppliers/${id}`, data),

  delete: (id: string) => apiClient.delete<{ message: string }>(`/suppliers/${id}`),
};

/**
 * Unified API export
 */
export const api = {
  products: productsApi,
  categories: categoriesApi,
  customers: customersApi,
  suppliers: suppliersApi,
};

export default api;
