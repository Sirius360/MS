import apiClient from './client';
import type { Customer, Supplier, SalesInvoice } from '../types';

export const customersApi = {
  getAll: async (): Promise<Customer[]> => {
    const { data } = await apiClient.get('/customers');
    return data;
  },

  getById: async (id: string): Promise<Customer> => {
    const { data } = await apiClient.get(`/customers/${id}`);
    return data;
  },

  create: async (customer: Partial<Customer>): Promise<Customer> => {
    const { data } = await apiClient.post('/customers', customer);
    return data;
  },

  update: async (id: string, customer: Partial<Customer>): Promise<Customer> => {
    const { data } = await apiClient.put(`/customers/${id}`, customer);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/customers/${id}`);
  },
};

export const suppliersApi = {
  getAll: async (): Promise<Supplier[]> => {
    const { data } = await apiClient.get('/suppliers');
    return data;
  },

  getById: async (id: string): Promise<Supplier> => {
    const { data } = await apiClient.get(`/suppliers/${id}`);
    return data;
  },

  create: async (supplier: Partial<Supplier>): Promise<Supplier> => {
    const { data } = await apiClient.post('/suppliers', supplier);
    return data;
  },

  update: async (id: string, supplier: Partial<Supplier>): Promise<Supplier> => {
    const { data } = await apiClient.put(`/suppliers/${id}`, supplier);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/suppliers/${id}`);
  },
};

export const salesApi = {
  getAll: async (): Promise<SalesInvoice[]> => {
    const { data } = await apiClient.get('/sales');
    return data;
  },

  getById: async (id: string): Promise<SalesInvoice> => {
    const { data } = await apiClient.get(`/sales/${id}`);
    return data;
  },

  generateCode: async (): Promise<{ code: string }> => {
    const { data } = await apiClient.get('/sales/generate/code');
    return data;
  },

  create: async (sale: Partial<SalesInvoice>): Promise<SalesInvoice> => {
    const { data } = await apiClient.post('/sales', sale);
    return data;
  },

  update: async (id: string, sale: Partial<SalesInvoice>): Promise<SalesInvoice> => {
    const { data } = await apiClient.put(`/sales/${id}`, sale);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/sales/${id}`);
  },
};
