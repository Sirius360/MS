export interface Product {
  id: string;
  code: string;
  name: string;
  category_id: string | null;
  category_name?: string;
  sale_price_default: number;
  unit: string;
  notes: string | null;
  status: 'active' | 'inactive';
  track_inventory: boolean;
  current_stock?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string | null;
  status: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
}

export interface Customer {
  id: string;
  code: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Supplier {
  id: string;
  code: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface SalesInvoiceItem {
  product_id: string;
  product_code?: string;
  product_name?: string;
  quantity: number;
  unit_price: number;
  discount?: number;
  total_amount: number;
  note?: string;
}

export interface SalesInvoice {
  id: string;
  code: string;
  customer_id?: string | null;
  customer_name?: string;
  total_amount: number;
  discount_type: 'percent' | 'amount';
  discount_value: number;
  payment_method: 'cash' | 'transfer' | 'card' | 'ewallet';
  paid_amount: number;
  note?: string;
  items: SalesInvoiceItem[];
  created_at?: string;
  updated_at?: string;
}

export interface PurchaseReceiptItem {
  product_id: string;
  product_code?: string;
  product_name?: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
}

export interface PurchaseReceipt {
  id: string;
  code: string;
  supplier_id: string;
  supplier_name?: string;
  total_amount: number;
  note?: string;
  items: PurchaseReceiptItem[];
  created_at?: string;
  updated_at?: string;
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProfit: number;
  lowStockProducts: number;
  recentSales: SalesInvoice[];
  weeklyRevenue: { day: string; revenue: number }[];
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'staff';
  isActive: boolean;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
}

export interface ApiError {
  error: string;
  message?: string;
}
