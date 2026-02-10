import type { Product, Customer, Supplier, Category } from '@/shared/types';

/**
 * Mock data store for frontend development without backend
 */

// Mock Products
export const mockProducts: Product[] = [
  {
    id: '1',
    sku: 'SP000001',
    code: 'SP000001',
    name: 'Laptop Dell XPS 13',
    type: 'product',
    groupId: '1',
    brandId: null,
    costPrice: 18000000,
    salePrice: 25000000,
    stockQty: 15,
    unit: 'chiếc',
    status: 'in_stock',
    averageCost: 18500000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    sku: 'SP000002',
    code: 'SP000002',
    name: 'iPhone 15 Pro Max',
    type: 'product',
    groupId: '2',
    costPrice: 28000000,
    salePrice: 35000000,
    stockQty: 8,
    unit: 'chiếc',
    status: 'in_stock',
    averageCost: 28500000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    sku: 'SP000003',
    code: 'SP000003',
    name: 'Samsung Galaxy S24',
    type: 'product',
    groupId: '2',
    costPrice: 20000000,
    salePrice: 27000000,
    stockQty: 12,
    unit: 'chiếc',
    status: 'in_stock',
    averageCost: 20500000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    sku: 'SP000004',
    code: 'SP000004',
    name: 'MacBook Pro M3',
    type: 'product',
    groupId: '1',
    costPrice: 45000000,
    salePrice: 55000000,
    stockQty: 5,
    unit: 'chiếc',
    status: 'in_stock',
    averageCost: 46000000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '5',
    sku: 'SP000005',
    code: 'SP000005',
    name: 'AirPods Pro 2',
    type: 'product',
    groupId: '3',
    costPrice: 4500000,
    salePrice: 6000000,
    stockQty: 0,
    unit: 'chiếc',
    status: 'out_of_stock',
    averageCost: 4600000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Mock Categories
export const mockCategories: Category[] = [
  {
    id: '1',
    name: 'Laptop',
    description: 'Máy tính xách tay',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Điện thoại',
    description: 'Smartphone',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Phụ kiện',
    description: 'Tai nghe, sạc, ốp lưng',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Mock Customers
export const mockCustomers: Customer[] = [
  {
    id: '1',
    code: 'KH000001',
    name: 'Nguyễn Văn A',
    phone: '0901234567',
    email: 'nguyenvana@email.com',
    address: '123 Đường ABC, Quận 1, TP.HCM',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    code: 'KH000002',
    name: 'Trần Thị B',
    phone: '0907654321',
    email: 'tranthib@email.com',
    address: '456 Đường XYZ, Quận 3, TP.HCM',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    code: 'KH000003',
    name: 'Lê Văn C',
    phone: '0912345678',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Mock Suppliers
export const mockSuppliers: Supplier[] = [
  {
    id: '1',
    code: 'NCC000001',
    name: 'Công ty TNHH Apple Việt Nam',
    phone: '0281234567',
    email: 'contact@apple.vn',
    address: 'Quận 1, TP.HCM',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    code: 'NCC000002',
    name: 'Samsung Electronics Vietnam',
    phone: '0287654321',
    email: 'info@samsung.vn',
    address: 'Bắc Ninh',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Helper to generate new ID
let idCounter = 1000;
export const generateId = () => String(++idCounter);
