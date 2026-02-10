// Shared domain types

export type ID = string;
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;

export type Status = 'active' | 'inactive';
export type StockStatus = 'in_stock' | 'out_of_stock' | 'discontinued';

// Common entity fields
export interface BaseEntity {
  id: ID;
  createdAt: string;
  updatedAt: string;
}

export interface Product extends BaseEntity {
  sku: string;
  code: string;
  name: string;
  type?: 'product' | 'service';
  groupId?: Nullable<ID>;
  brandId?: Nullable<ID>;
  costPrice: number;
  salePrice: number;
  salePriceBeforeTax?: number;
  stockQty: number;
  minStock?: number;
  unit: string;
  status: StockStatus;
  imageUrl?: Nullable<string>;
  notes?: Nullable<string>;
  // Additional fields for display
  averageCost?: number;
  categoryName?: string;
}

export interface ProductGroup extends BaseEntity {
  name: string;
  description?: Nullable<string>;
  minPrice?: number;
  maxPrice?: number;
  status: Status;
  productCount?: number;
}

export interface Category extends BaseEntity {
  name: string;
  description?: Nullable<string>;
  status: Status;
}

export interface Customer extends BaseEntity {
  code?: string;
  name: string;
  phone?: Nullable<string>;
  email?: Nullable<string>;
  address?: Nullable<string>;
  notes?: Nullable<string>;
  status?: Status;
}

export interface Supplier extends BaseEntity {
  code?: string;
  name: string;
  phone?: Nullable<string>;
  email?: Nullable<string>;
  address?: Nullable<string>;
  notes?: Nullable<string>;
  status?: Status;
}

// Form input types (for create/update)
export type CreateProductInput = Omit<Product, keyof BaseEntity | 'stockQty' | 'averageCost'>;
export type UpdateProductInput = Partial<CreateProductInput>;

export type CreateCustomerInput = Omit<Customer, keyof BaseEntity>;
export type UpdateCustomerInput = Partial<CreateCustomerInput>;

export type CreateSupplierInput = Omit<Supplier, keyof BaseEntity>;
export type UpdateSupplierInput = Partial<CreateSupplierInput>;

export type CreateCategoryInput = Omit<Category, keyof BaseEntity>;
export type UpdateCategoryInput = Partial<CreateCategoryInput>;
