/**
 * API Service Layer for backend communication
 * Refactored to use centralized httpClient
 */

import { httpClient, ApiError } from './httpClient';
import { transformProductFromApi, transformCustomerFromApi, transformSupplierFromApi, transformCategoryFromApi } from './transformers';

// ===== PRODUCTS API =====

export interface Product {
  id: string;
  sku: string;
  code: string;
  name: string;
  type?: string;
  groupId?: string;
  brandId?: string;
  config?: Record<string, any>;
  costPrice: number;
  salePriceBeforeTax?: number;
  salePrice: number;
  sale_price_default?: number; // Alias for compatibility
  average_cost?: number; // Alias for compatibility
  vatImport?: number;
  vatSale?: number;
  stockQty: number;
  stock_qty?: number; // Alias for compatibility
  minStock?: number;
  unit: string;
  status: string;
  imageUrl?: string;
  images?: string[];
  notes?: string;
  description?: string;
  warranty?: string;
  directSale?: boolean;
  loyaltyPoints?: number;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductCreateData {
  sku: string;
  name: string;
  type?: string;
  groupId?: string;
  brandId?: string;
  config?: Record<string, any>;
  costPrice?: number;
  salePriceBeforeTax?: number;
  vatImport?: number;
  vatSale?: number;
  stockQty?: number;
  minStock?: number;
  unit: string;
  status?: string;
  imageUrl?: string;
  images?: string[];
  notes?: string;
  description?: string;
  warranty?: string;
  directSale?: boolean;
  loyaltyPoints?: number;
}

/**
 * Get all products with optional filters
 */
export async function getProducts(params?: {
  search?: string;
  groupId?: string;
  brandId?: string;
  status?: string;
}): Promise<Product[]> {
  try {
    const queryParams: Record<string, string> = {};
    if (params?.search) queryParams.search = params.search;
    if (params?.groupId) queryParams.groupId = params.groupId;
    if (params?.brandId) queryParams.brandId = params.brandId;
    if (params?.status) queryParams.status = params.status;

    const response = await httpClient.get<{ data: any[] }>('/products', queryParams);
    return (response.data || []).map(transformProductFromApi);
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return [];
  }
}

/**
 * Get single product by ID
 */
export async function getProductById(id: string): Promise<Product | null> {
  try {
    const response = await httpClient.get<{ data: any }>(`/products/${id}`);
    
    if (!response.data) {
      return null;
    }

    return transformProductFromApi(response.data);
  } catch (error) {
    if (error instanceof ApiError && error.isNotFoundError()) {
      return null;
    }
    console.error('Failed to fetch product:', error);
    throw error;
  }
}

/**
 * Search products by query string
 */
export async function searchProducts(query: string): Promise<Product[]> {
  try {
    const response = await httpClient.get<{ data: any[] }>('/products/search', { query });
    return (response.data || []).map(transformProductFromApi);
  } catch (error) {
    console.error('Failed to search products:', error);
    return [];
  }
}

/**
 * Create new product
 */
export async function createProduct(data: ProductCreateData): Promise<Product> {
  const response = await httpClient.post<{ data: any }>('/products', data);
  
  if (!response.data) {
    throw new Error('Failed to create product - no data returned');
  }

  return transformProductFromApi(response.data);
}

/**
 * Update existing product
 */
export async function updateProduct(
  id: string,
  data: Partial<ProductCreateData>
): Promise<Product> {
  const response = await httpClient.put<{ data: any }>(`/products/${id}`, data);
  
  if (!response.data) {
    throw new Error('Failed to update product - no data returned');
  }

  return transformProductFromApi(response.data);
}

/**
 * Delete product
 */
export async function deleteProduct(id: string): Promise<boolean> {
  try {
    await httpClient.delete(`/products/${id}`);
    return true;
  } catch (error) {
    console.error('Failed to delete product:', error);
    return false;
  }
}

// ===== SUPPLIERS API =====

export interface Supplier {
  id: string;
  code: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Get all suppliers with optional search
 */
export async function getSuppliers(search?: string): Promise<Supplier[]> {
  try {
    const params = search ? { search } : undefined;
    const response = await httpClient.get<{ data: any[] }>('/suppliers', params);
    return (response.data || []).map(transformSupplierFromApi);
  } catch (error) {
    console.error('Failed to fetch suppliers:', error);
    return [];
  }
}

/**
 * Create new supplier
 */
export async function createSupplier(data: {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
}): Promise<Supplier> {
  const response = await httpClient.post<{ data: any }>('/suppliers', data);
  
  if (!response.data) {
    throw new Error('Failed to create supplier - no data returned');
  }

  return transformSupplierFromApi(response.data);
}

/**
 * Update supplier
 */
export async function updateSupplier(
  id: string,
  data: Partial<{
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    notes?: string;
  }>
): Promise<Supplier> {
  const response = await httpClient.put<{ data: any }>(`/suppliers/${id}`, data);
  
  if (!response.data) {
    throw new Error('Failed to update supplier - no data returned');
  }

  return transformSupplierFromApi(response.data);
}

/**
 * Delete supplier
 */
export async function deleteSupplier(id: string): Promise<boolean> {
  try {
    await httpClient.delete(`/suppliers/${id}`);
    return true;
  } catch (error) {
    console.error('Failed to delete supplier:', error);
    return false;
  }
}

// ===== PRODUCT GROUPS / CATEGORIES API =====

export interface ProductGroup {
  id: string;
  name: string;
  minPrice?: number;
  maxPrice?: number;
  description?: string;
  configTemplate?: Record<string, any>;
  status: string;
  productCount?: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Get all product groups/categories
 */
export async function getProductGroups(): Promise<ProductGroup[]> {
  try {
    const response = await httpClient.get<{ data: any[] }>('/product-groups');
    return (response.data || []).map(transformCategoryFromApi);
  } catch (error) {
    console.error('Failed to fetch product groups:', error);
    return [];
  }
}

/**
 * Create new product group
 */
export async function createProductGroup(data: {
  name: string;
  minPrice?: number;
  maxPrice?: number;
  description?: string;
  configTemplate?: Record<string, any>;
  status?: string;
}): Promise<ProductGroup> {
  const response = await httpClient.post<{ data: any }>('/product-groups', data);
  
  if (!response.data) {
    throw new Error('Failed to create product group - no data returned');
  }

  return transformCategoryFromApi(response.data);
}

/**
 * Update product group
 */
export async function updateProductGroup(
  id: string,
  data: Partial<{
    name: string;
    minPrice?: number;
    maxPrice?: number;
    description?: string;
    configTemplate?: Record<string, any>;
    status?: string;
  }>
): Promise<ProductGroup> {
  const response = await httpClient.put<{ data: any }>(`/product-groups/${id}`, data);
  
  if (!response.data) {
    throw new Error('Failed to update product group - no data returned');
  }

  return transformCategoryFromApi(response.data);
}

/**
 * Delete product group
 */
export async function deleteProductGroup(id: string): Promise<boolean> {
  try {
    await httpClient.delete(`/product-groups/${id}`);
    return true;
  } catch (error) {
    console.error('Failed to delete product group:', error);
    return false;
  }
}

// ===== CUSTOMERS API =====

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  address?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Get all customers with optional search
 */
export async function getCustomers(search?: string): Promise<Customer[]> {
  try {
    const params = search ? { search } : undefined;
    const response = await httpClient.get<{ data: any[] }>('/customers', params);
    return (response.data || []).map(transformCustomerFromApi);
  } catch (error) {
    console.error('Failed to fetch customers:', error);
    return [];
  }
}

/**
 * Create new customer
 */
export async function createCustomer(data: {
  name: string;
  phone?: string;
  address?: string;
  notes?: string;
}): Promise<Customer> {
  const response = await httpClient.post<{ data: any }>('/customers', data);
  
  if (!response.data) {
    throw new Error('Failed to create customer - no data returned');
  }

  return transformCustomerFromApi(response.data);
}

/**
 * Update customer
 */
export async function updateCustomer(
  id: string,
  data: Partial<{
    name: string;
    phone?: string;
    address?: string;
    notes?: string;
  }>
): Promise<Customer> {
  const response = await httpClient.put<{ data: any }>(`/customers/${id}`, data);
  
  if (!response.data) {
    throw new Error('Failed to update customer - no data returned');
  }

  return transformCustomerFromApi(response.data);
}

/**
 * Delete customer
 */
export async function deleteCustomer(id: string): Promise<boolean> {
  try {
    await httpClient.delete(`/customers/${id}`);
    return true;
  } catch (error) {
    console.error('Failed to delete customer:', error);
    return false;
  }
}

// ===== IMPORTS API =====

export interface Import {
  id: string;
  code: string;
  supplierId: string;
  supplierName?: string;
  date: string;
  importDateTime?: string;
  totalAmount: number;
  discountAmount?: number;
  notes?: string;
  itemCount?: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Get imports with optional filters
 */
export async function getImports(params?: {
  fromDate?: string;
  toDate?: string;
  supplierId?: string;
  code?: string;
}): Promise<{ imports: Import[]; totalRecords: number; totalAmount: number }> {
  try {
    const queryParams: Record<string, string> = {};
    if (params?.fromDate) queryParams.fromDate = params.fromDate;
    if (params?.toDate) queryParams.toDate = params.toDate;
    if (params?.supplierId) queryParams.supplierId = params.supplierId;
    if (params?.code) queryParams.code = params.code;

    const response = await httpClient.get<{
      data: {
        imports: Import[];
        totalRecords: number;
        totalAmount: number;
      };
    }>('/imports', queryParams);

    return response.data || { imports: [], totalRecords: 0, totalAmount: 0 };
  } catch (error) {
    console.error('Failed to fetch imports:', error);
    return { imports: [], totalRecords: 0, totalAmount: 0 };
  }
}

/**
 * Create new import/purchase
 */
export async function createImport(data: {
  supplierId: string;
  date: string;
  importDateTime?: string;
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
  }>;
  discountAmount?: number;
  notes?: string;
}): Promise<Import> {
  const response = await httpClient.post<{ data: Import }>('/imports', data);
  
  if (!response.data) {
    throw new Error('Failed to create import - no data returned');
  }

  return response.data;
}

// Re-export ApiError for convenience
export { ApiError } from './httpClient';
