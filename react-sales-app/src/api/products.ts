import apiClient from './client';
import type { Product } from '../types';

export const productsApi = {
  // Get all products
  getAll: async (): Promise<Product[]> => {
    const { data } = await apiClient.get('/products');
    return data;
  },

  // Get product by ID
  getById: async (id: string): Promise<Product> => {
    const { data } = await apiClient.get(`/products/${id}`);
    return data;
  },

  // Get product stock
  getStock: async (id: string): Promise<{ productId: string; stock: number }> => {
    const { data } = await apiClient.get(`/products/${id}/stock`);
    return data;
  },

  // Create product
  create: async (product: Partial<Product>): Promise<Product> => {
    const { data } = await apiClient.post('/products', product);
    return data;
  },

  // Update product
  update: async (id: string, product: Partial<Product>): Promise<Product> => {
    const { data } = await apiClient.put(`/products/${id}`, product);
    return data;
  },

  // Delete product
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/products/${id}`);
  },

  // Get product transactions
  getTransactions: async (id: string): Promise<any[]> => {
    const { data } = await apiClient.get(`/products/${id}/transactions`);
    return data;
  },
};
