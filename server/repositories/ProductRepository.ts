import { RowDataPacket } from 'mysql2/promise';
import { BaseRepository } from './BaseRepository.js';
import { v4 as uuidv4 } from 'uuid';

export interface Product extends RowDataPacket {
  id: string;
  code: string;
  barcode: string | null;
  name: string;
  category_id: string | null;
  brand: string | null;
  unit: string;
  cost_price: number;
  sale_price_default: number;
  sale_price_before_tax: number | null;
  sale_price_after_tax: number | null;
  vat_sale: number;
  vat_input: number | null;
  min_stock: number | null;
  max_stock: number | null;
  track_inventory: boolean;
  direct_sale: boolean;
  image_url: string | null;
  notes: string | null;
  status: string;
  created_at: Date;
  updated_at: Date;
  stock_qty?: number;
  average_cost?: number;
}

export class ProductRepository extends BaseRepository {
  constructor() {
    super('products');
  }

  async getAllActive(): Promise<Product[]> {
    const products = await this.query<Product>(
      `SELECT p.*, c.name as category_name 
       FROM ${this.tableName} p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.status = ? 
       ORDER BY p.name`,
      ['active']
    );

    // Calculate stock for each product
    for (const product of products) {
      product.stock_qty = await this.getProductStock(product.id);
      product.average_cost = await this.getAverageCost(product.id);
    }

    return products;
  }

  async getById(id: string): Promise<Product | null> {
    const product = await this.queryOne<Product>(
      `SELECT p.*, c.name as category_name 
       FROM ${this.tableName} p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = ?`,
      [id]
    );

    if (product) {
      product.stock_qty = await this.getProductStock(id);
      product.average_cost = await this.getAverageCost(id);
    }

    return product;
  }

  async create(data: Partial<Product>): Promise<Product> {
    const id = uuidv4();
    await this.insert({
      id,
      code: data.code,
      barcode: data.barcode || null,
      name: data.name,
      category_id: data.category_id || null,
      brand: data.brand || null,
      unit: data.unit || 'cái',
      cost_price: data.cost_price || 0,
      sale_price_default: data.sale_price_default || 0,
      sale_price_before_tax: data.sale_price_before_tax || null,
      sale_price_after_tax: data.sale_price_after_tax || null,
      vat_sale: data.vat_sale || 0,
      vat_input: data.vat_input || null,
      min_stock: data.min_stock || null,
      max_stock: data.max_stock || null,
      track_inventory: data.track_inventory !== false,
      direct_sale: data.direct_sale !== false,
      image_url: data.image_url || null,
      notes: data.notes || null,
      status: data.status || 'active',
    });

    const product = await this.getById(id);
    if (!product) throw new Error('Failed to create product');
    return product;
  }

  async updateProduct(id: string, data: Partial<Product>): Promise<Product | null> {
    const updateData: Record<string, any> = {};
    
    // Only update fields that are provided
    const fields = [
      'code', 'barcode', 'name', 'category_id', 'brand', 'unit',
      'cost_price', 'sale_price_default', 'sale_price_before_tax',
      'sale_price_after_tax', 'vat_sale', 'vat_input', 'min_stock',
      'max_stock', 'track_inventory', 'direct_sale', 'image_url',
      'notes', 'status'
    ];

    fields.forEach(field => {
      if (data[field as keyof Product] !== undefined) {
        updateData[field] = data[field as keyof Product];
      }
    });

    const success = await this.update(id, updateData);
    if (!success) return null;

    return this.getById(id);
  }

  // Get current stock from inventory transactions
  async getProductStock(productId: string): Promise<number> {
    const result = await this.queryOne<RowDataPacket>(
      `SELECT COALESCE(SUM(quantity), 0) as stock
       FROM inventory_transactions
       WHERE product_id = ?`,
      [productId]
    );
    return Number(result?.stock || 0);
  }

  // Get average cost (weighted average from purchase transactions)
  async getAverageCost(productId: string): Promise<number> {
    const result = await this.queryOne<RowDataPacket>(
      `SELECT 
        COALESCE(
          SUM(unit_cost * ABS(quantity)) / NULLIF(SUM(ABS(quantity)), 0),
          0
        ) as avg_cost
       FROM inventory_transactions
       WHERE product_id = ? AND transaction_type = 'IN' AND unit_cost IS NOT NULL`,
      [productId]
    );
    return Number(result?.avg_cost || 0);
  }

  async deleteProduct(id: string): Promise<boolean> {
    return this.softDelete(id);
  }
}
