/**
 * Data Transformers
 * Convert API responses (snake_case) to frontend format (camelCase)
 */

import type { Product } from '@/lib/api';

/**
 * Transform product from API response to frontend format
 * Handles both snake_case and camelCase fields
 */
export function transformProductFromApi(raw: any): Product {
  return {
    id: raw.id,
    sku: raw.sku || raw.code || '',
    code: raw.code || raw.sku || '',
    name: raw.name,
    type: raw.type || 'product',
    groupId: raw.groupId || raw.group_id || null,
    brandId: raw.brandId || raw.brand_id || null,
    config: raw.config || null,
    
    // Prices - handle multiple naming conventions
    costPrice: raw.costPrice ?? raw.cost_price ?? raw.average_cost ?? 0,
    salePrice: raw.salePrice ?? raw.sale_price_default ?? raw.sale_price ?? 0,
    salePriceBeforeTax: raw.salePriceBeforeTax ?? raw.sale_price_before_tax ?? null,
    sale_price_default: raw.sale_price_default ?? raw.salePrice ?? 0,
    
    // VAT
    vatImport: raw.vatImport ?? raw.vat_import ?? 0,
    vatSale: raw.vatSale ?? raw.vat_sale ?? 0,
    
    // Stock - handle multiple naming conventions
    stockQty: raw.stockQty ?? raw.stock_qty ?? 0,
    stock_qty: raw.stock_qty ?? raw.stockQty ?? 0,
    minStock: raw.minStock ?? raw.min_stock ?? 0,
    maxStock: raw.maxStock ?? raw.max_stock ?? 0,
    
    // Average cost (for display)
    average_cost: raw.average_cost ?? raw.costPrice ?? 0,
    
    // Other fields
    unit: raw.unit || 'cái',
    status: raw.status || 'active',
    imageUrl: raw.imageUrl ?? raw.image_url ?? undefined,
    images: raw.images || [],
    notes: raw.notes || undefined,
    description: raw.description || undefined,
    warranty: raw.warranty || undefined,
    directSale: raw.directSale ?? raw.direct_sale ?? false,
    loyaltyPoints: raw.loyaltyPoints ?? raw.loyalty_points ?? 0,
    isDeleted: raw.isDeleted ?? raw.is_deleted ?? false,
    
    // Timestamps
    createdAt: raw.createdAt || raw.created_at || new Date().toISOString(),
    updatedAt: raw.updatedAt || raw.updated_at || new Date().toISOString(),
  };
}

/**
 * Transform customer from API response
 */
export function transformCustomerFromApi(raw: any) {
  return {
    id: raw.id,
    name: raw.name,
    phone: raw.phone || undefined,
    email: raw.email || undefined,
    address: raw.address || undefined,
    notes: raw.notes || undefined,
    createdAt: raw.createdAt || raw.created_at || new Date().toISOString(),
    updatedAt: raw.updatedAt || raw.updated_at || new Date().toISOString(),
  };
}

/**
 * Transform supplier from API response
 */
export function transformSupplierFromApi(raw: any) {
  return {
    id: raw.id,
    code: raw.code,
    name: raw.name,
    phone: raw.phone || undefined,
    email: raw.email || undefined,
    address: raw.address || undefined,
    notes: raw.notes || undefined,
    createdAt: raw.createdAt || raw.created_at || new Date().toISOString(),
    updatedAt: raw.updatedAt || raw.updated_at || new Date().toISOString(),
  };
}

/**
 * Transform category/product group from API response
 */
export function transformCategoryFromApi(raw: any) {
  return {
    id: raw.id,
    name: raw.name,
    minPrice: raw.minPrice ?? raw.min_price ?? undefined,
    maxPrice: raw.maxPrice ?? raw.max_price ?? undefined,
    description: raw.description || undefined,
    configTemplate: raw.configTemplate ?? raw.config_template ?? undefined,
    status: raw.status || 'active',
    productCount: raw.productCount ?? raw.product_count ?? undefined,
    createdAt: raw.createdAt || raw.created_at || new Date().toISOString(),
    updatedAt: raw.updatedAt || raw.updated_at || new Date().toISOString(),
  };
}
