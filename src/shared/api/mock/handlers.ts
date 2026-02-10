import { http, HttpResponse } from 'msw';
import {
  mockProducts,
  mockCategories,
  mockCustomers,
  mockSuppliers,
  generateId,
} from './mockData';

const API_URL = 'http://localhost:3002/api';

/**
 * MSW handlers for mocking backend API
 */
export const handlers = [
  // Products
  http.get(`${API_URL}/products`, () => {
    return HttpResponse.json(mockProducts);
  }),

  http.get(`${API_URL}/products/:id`, ({ params }) => {
    const product = mockProducts.find((p) => p.id === params.id);
    if (!product) {
      return HttpResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    return HttpResponse.json(product);
  }),

  http.post(`${API_URL}/products`, async ({ request }) => {
    const data = (await request.json()) as any;
    const newProduct = {
      ...data,
      id: generateId(),
      stockQty: 0,
      averageCost: data.costPrice || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockProducts.push(newProduct);
    return HttpResponse.json(newProduct, { status: 201 });
  }),

  http.put(`${API_URL}/products/:id`, async ({ params, request }) => {
    const data = (await request.json()) as any;
    const index = mockProducts.findIndex((p) => p.id === params.id);
    if (index === -1) {
      return HttpResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    mockProducts[index] = {
      ...mockProducts[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return HttpResponse.json(mockProducts[index]);
  }),

  http.delete(`${API_URL}/products/:id`, ({ params }) => {
    const index = mockProducts.findIndex((p) => p.id === params.id);
    if (index === -1) {
      return HttpResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    mockProducts.splice(index, 1);
    return HttpResponse.json({ message: 'Product deleted' });
  }),

  // Categories
  http.get(`${API_URL}/categories`, () => {
    return HttpResponse.json(mockCategories);
  }),

  http.post(`${API_URL}/categories`, async ({ request }) => {
    const data = (await request.json()) as any;
    const newCategory = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockCategories.push(newCategory);
    return HttpResponse.json(newCategory, { status: 201 });
  }),

  // Customers
  http.get(`${API_URL}/customers`, () => {
    return HttpResponse.json(mockCustomers);
  }),

  http.get(`${API_URL}/customers/:id`, ({ params }) => {
    const customer = mockCustomers.find((c) => c.id === params.id);
    if (!customer) {
      return HttpResponse.json({ error: 'Customer not found' }, { status: 404 });
    }
    return HttpResponse.json(customer);
  }),

  http.post(`${API_URL}/customers`, async ({ request }) => {
    const data = (await request.json()) as any;
    const newCustomer = {
      ...data,
      id: generateId(),
      code: `KH${String(generateId()).padStart(6, '0')}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockCustomers.push(newCustomer);
    return HttpResponse.json(newCustomer, { status: 201 });
  }),

  http.put(`${API_URL}/customers/:id`, async ({ params, request }) => {
    const data = (await request.json()) as any;
    const index = mockCustomers.findIndex((c) => c.id === params.id);
    if (index === -1) {
      return HttpResponse.json({ error: 'Customer not found' }, { status: 404 });
    }
    mockCustomers[index] = {
      ...mockCustomers[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return HttpResponse.json(mockCustomers[index]);
  }),

  http.delete(`${API_URL}/customers/:id`, ({ params }) => {
    const index = mockCustomers.findIndex((c) => c.id === params.id);
    if (index === -1) {
      return HttpResponse.json({ error: 'Customer not found' }, { status: 404 });
    }
    mockCustomers.splice(index, 1);
    return HttpResponse.json({ message: 'Customer deleted' });
  }),

  // Suppliers
  http.get(`${API_URL}/suppliers`, () => {
    return HttpResponse.json(mockSuppliers);
  }),

  http.post(`${API_URL}/suppliers`, async ({ request }) => {
    const data = (await request.json()) as any;
    const newSupplier = {
      ...data,
      id: generateId(),
      code: `NCC${String(generateId()).padStart(6, '0')}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockSuppliers.push(newSupplier);
    return HttpResponse.json(newSupplier, { status: 201 });
  }),
];
