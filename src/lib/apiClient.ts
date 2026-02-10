// MySQL REST API Client
// Replaces Supabase SDK with fetch() calls to backend

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

// Generic API call wrapper
async function apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

// Categories API
export const categoriesApi = {
  getAll: () => apiCall<any[]>('/categories'),

  getById: (id: string) => apiCall<any>(`/categories/${id}`),

  create: (data: { name: string; description?: string; status?: string }) =>
    apiCall<any>('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: { name?: string; description?: string; status?: string }) =>
    apiCall<any>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiCall<{ message: string }>(`/categories/${id}`, {
      method: 'DELETE',
    }),
};

// Products API
export const productsApi = {
  getAll: () => apiCall<any[]>('/products'),

  getById: (id: string) => apiCall<any>(`/products/${id}`),

  getStock: (id: string) => apiCall<{ productId: string; stock: number }>(`/products/${id}/stock`),

  create: (data: any) =>
    apiCall<any>('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    apiCall<any>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiCall<{ message: string }>(`/products/${id}`, {
      method: 'DELETE',
    }),
};

// Customers API
export const customersApi = {
  getAll: () => apiCall<any[]>('/customers'),

  getById: (id: string) => apiCall<any>(`/customers/${id}`),

  create: (data: {
    name: string;
    code?: string;
    phone?: string;
    email?: string;
    address?: string;
    notes?: string;
  }) =>
    apiCall<any>('/customers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    apiCall<any>(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiCall<{ message: string }>(`/customers/${id}`, {
      method: 'DELETE',
    }),
};

// Suppliers API
export const suppliersApi = {
  getAll: () => apiCall<any[]>('/suppliers'),

  getById: (id: string) => apiCall<any>(`/suppliers/${id}`),

  create: (data: {
    name: string;
    code?: string;
    phone?: string;
    email?: string;
    address?: string;
    notes?: string;
  }) =>
    apiCall<any>('/suppliers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    apiCall<any>(`/suppliers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiCall<{ message: string }>(`/suppliers/${id}`, {
      method: 'DELETE',
    }),
};

// Main API export with resource-specific APIs and generic HTTP methods
export const api = {
  // Resource-specific APIs
  categories: categoriesApi,
  products: productsApi,
  customers: customersApi,
  suppliers: suppliersApi,

  // Generic HTTP methods for direct endpoint access
  get: <T = any>(endpoint: string) => apiCall<T>(endpoint),

  post: <T = any>(endpoint: string, data?: any) =>
    apiCall<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T = any>(endpoint: string, data?: any) =>
    apiCall<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T = any>(endpoint: string) =>
    apiCall<T>(endpoint, {
      method: 'DELETE',
    }),
};

export default api;
