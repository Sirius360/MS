/**
 * Tests for useInvoiceItems hook
 * Covers cart management: add, update, remove products with stock validation
 */

import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useInvoiceItems } from '../useInvoiceItems';
import type { SaleItem } from '../useInvoiceState';
import type { Product } from '@/lib/api';

// Mock product data
const createMockProduct = (overrides: Partial<Product> = {}): Product => ({
  id: 'prod-1',
  sku: 'P001',
  code: 'P001',
  name: 'Test Product',
  type: 'product',
  costPrice: 50000,
  salePrice: 100000,
  stockQty: 10,
  unit: 'cái',
  status: 'active',
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
  ...overrides,
});

describe('useInvoiceItems', () => {
  describe('Adding Products', () => {
    it('should add new product to empty cart', () => {
      const items: SaleItem[] = [];
      const onItemsChange = vi.fn();

      const { result } = renderHook(() =>
        useInvoiceItems({ items, onItemsChange })
      );

      const product = createMockProduct();

      act(() => {
        result.current.addProduct(product);
      });

      expect(onItemsChange).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            product_id: 'prod-1',
            product_code: 'P001',
            product_name: 'Test Product',
            quantity: 1,
            sale_price: 100000,
            discount: 0,
            total_price: 100000,
            cost_price: 50000,
            profit: 50000,
            max_qty: 10,
          }),
        ])
      );
    });

    it('should increase quantity when adding existing product', () => {
      const items: SaleItem[] = [
        {
          product_id: 'prod-1',
          product_code: 'P001',
          product_name: 'Test Product',
          quantity: 2,
          sale_price: 100000,
          discount: 0,
          total_price: 200000,
          cost_price: 50000,
          profit: 100000,
          max_qty: 10,
          note: '',
        },
      ];
      const onItemsChange = vi.fn();

      const { result } = renderHook(() =>
        useInvoiceItems({ items, onItemsChange })
      );

      const product = createMockProduct();

      act(() => {
        result.current.addProduct(product);
      });

      // Should increase quantity from 2 to 3
      expect(onItemsChange).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            product_id: 'prod-1',
            quantity: 3,
            total_price: 300000,
            profit: 150000,
          }),
        ])
      );
    });

    it('should throw error when product is out of stock', () => {
      const items: SaleItem[] = [];
      const onItemsChange = vi.fn();

      const { result } = renderHook(() =>
        useInvoiceItems({ items, onItemsChange })
      );

      const outOfStockProduct = createMockProduct({ stockQty: 0 });

      expect(() => {
        act(() => {
          result.current.addProduct(outOfStockProduct);
        });
      }).toThrow('đã hết hàng');
    });

    it('should throw error when trying to add more than stock quantity', () => {
      const items: SaleItem[] = [
        {
          product_id: 'prod-1',
          product_code: 'P001',
          product_name: 'Test Product',
          quantity: 5,
          sale_price: 100000,
          discount: 0,
          total_price: 500000,
          cost_price: 50000,
          profit: 250000,
          max_qty: 5,
          note: '',
        },
      ];
      const onItemsChange = vi.fn();

      const { result } = renderHook(() =>
        useInvoiceItems({ items, onItemsChange })
      );

      const product = createMockProduct({ stockQty: 5 });

      expect(() => {
        act(() => {
          result.current.addProduct(product);
        });
      }).toThrow('Tồn kho không đủ');
    });

    it('should handle products with alternative field names', () => {
      const items: SaleItem[] = [];
      const onItemsChange = vi.fn();

      const { result } = renderHook(() =>
        useInvoiceItems({ items, onItemsChange })
      );

      // Product with snake_case and alternative names
      const product = createMockProduct({
        stockQty: undefined,
        stock_qty: 10,
        salePrice: undefined,
        sale_price_default: 100000,
        costPrice: undefined,
        average_cost: 50000,
      } as any);

      act(() => {
        result.current.addProduct(product);
      });

      expect(onItemsChange).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            sale_price: 100000,
            cost_price: 50000,
            max_qty: 10,
          }),
        ])
      );
    });
  });

  describe('Updating Items', () => {
    it('should update item quantity', () => {
      const items: SaleItem[] = [
        {
          product_id: 'prod-1',
          product_code: 'P001',
          product_name: 'Test Product',
          quantity: 2,
          sale_price: 100000,
          discount: 0,
          total_price: 200000,
          cost_price: 50000,
          profit: 100000,
          max_qty: 10,
          note: '',
        },
      ];
      const onItemsChange = vi.fn();

      const { result } = renderHook(() =>
        useInvoiceItems({ items, onItemsChange })
      );

      act(() => {
        result.current.updateItem(0, 'quantity', 5);
      });

      expect(onItemsChange).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            quantity: 5,
            total_price: 500000,
            profit: 250000,
          }),
        ])
      );
    });

    it('should update item price and recalculate totals', () => {
      const items: SaleItem[] = [
        {
          product_id: 'prod-1',
          product_code: 'P001',
          product_name: 'Test Product',
          quantity: 2,
          sale_price: 100000,
          discount: 0,
          total_price: 200000,
          cost_price: 50000,
          profit: 100000,
          max_qty: 10,
          note: '',
        },
      ];
      const onItemsChange = vi.fn();

      const { result } = renderHook(() =>
        useInvoiceItems({ items, onItemsChange })
      );

      act(() => {
        result.current.updateItem(0, 'sale_price', 150000);
      });

      expect(onItemsChange).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            sale_price: 150000,
            total_price: 300000, // 2 * 150000
            profit: 200000, // (150000 - 50000) * 2
          }),
        ])
      );
    });

    it('should update item discount and recalculate totals', () => {
      const items: SaleItem[] = [
        {
          product_id: 'prod-1',
          product_code: 'P001',
          product_name: 'Test Product',
          quantity: 2,
          sale_price: 100000,
          discount: 0,
          total_price: 200000,
          cost_price: 50000,
          profit: 100000,
          max_qty: 10,
          note: '',
        },
      ];
      const onItemsChange = vi.fn();

      const { result } = renderHook(() =>
        useInvoiceItems({ items, onItemsChange })
      );

      act(() => {
        result.current.updateItem(0, 'discount', 20000);
      });

      expect(onItemsChange).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            discount: 20000,
            total_price: 180000, // 2 * 100000 - 20000
            profit: 80000, // 180000 - 2 * 50000
          }),
        ])
      );
    });

    it('should throw error when quantity exceeds stock', () => {
      const items: SaleItem[] = [
        {
          product_id: 'prod-1',
          product_code: 'P001',
          product_name: 'Test Product',
          quantity: 2,
          sale_price: 100000,
          discount: 0,
          total_price: 200000,
          cost_price: 50000,
          profit: 100000,
          max_qty: 5,
          note: '',
        },
      ];
      const onItemsChange = vi.fn();

      const { result } = renderHook(() =>
        useInvoiceItems({ items, onItemsChange })
      );

      expect(() => {
        act(() => {
          result.current.updateItem(0, 'quantity', 10);
        });
      }).toThrow('Tồn kho không đủ');
    });

    it('should update item note without affecting calculations', () => {
      const items: SaleItem[] = [
        {
          product_id: 'prod-1',
          product_code: 'P001',
          product_name: 'Test Product',
          quantity: 2,
          sale_price: 100000,
          discount: 0,
          total_price: 200000,
          cost_price: 50000,
          profit: 100000,
          max_qty: 10,
          note: '',
        },
      ];
      const onItemsChange = vi.fn();

      const { result } = renderHook(() =>
        useInvoiceItems({ items, onItemsChange })
      );

      act(() => {
        result.current.updateItem(0, 'note', 'Special request');
      });

      expect(onItemsChange).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            note: 'Special request',
            total_price: 200000, // Unchanged
          }),
        ])
      );
    });
  });

  describe('Removing Items', () => {
    it('should remove item from cart', () => {
      const items: SaleItem[] = [
        {
          product_id: 'prod-1',
          product_code: 'P001',
          product_name: 'Product 1',
          quantity: 1,
          sale_price: 100000,
          discount: 0,
          total_price: 100000,
          cost_price: 50000,
          profit: 50000,
          max_qty: 10,
          note: '',
        },
        {
          product_id: 'prod-2',
          product_code: 'P002',
          product_name: 'Product 2',
          quantity: 1,
          sale_price: 150000,
          discount: 0,
          total_price: 150000,
          cost_price: 100000,
          profit: 50000,
          max_qty: 5,
          note: '',
        },
      ];
      const onItemsChange = vi.fn();

      const { result } = renderHook(() =>
        useInvoiceItems({ items, onItemsChange })
      );

      act(() => {
        result.current.removeItem(0);
      });

      expect(onItemsChange).toHaveBeenCalledWith([
        expect.objectContaining({
          product_id: 'prod-2',
          product_name: 'Product 2',
        }),
      ]);
    });

    it('should clear all items', () => {
      const items: SaleItem[] = [
        {
          product_id: 'prod-1',
          product_code: 'P001',
          product_name: 'Product 1',
          quantity: 1,
          sale_price: 100000,
          discount: 0,
          total_price: 100000,
          cost_price: 50000,
          profit: 50000,
          max_qty: 10,
          note: '',
        },
      ];
      const onItemsChange = vi.fn();

      const { result } = renderHook(() =>
        useInvoiceItems({ items, onItemsChange })
      );

      act(() => {
        result.current.clearItems();
      });

      expect(onItemsChange).toHaveBeenCalledWith([]);
    });
  });

  describe('Helper Methods', () => {
    it('should return correct isEmpty status', () => {
      const { result: emptyResult } = renderHook(() =>
        useInvoiceItems({ items: [], onItemsChange: vi.fn() })
      );

      expect(emptyResult.current.isEmpty).toBe(true);
      expect(emptyResult.current.hasItems).toBe(false);

      const { result: filledResult } = renderHook(() =>
        useInvoiceItems({
          items: [
            {
              product_id: 'prod-1',
              product_code: 'P001',
              product_name: 'Test',
              quantity: 1,
              sale_price: 100000,
              discount: 0,
              total_price: 100000,
              cost_price: 50000,
              profit: 50000,
              max_qty: 10,
              note: '',
            },
          ],
          onItemsChange: vi.fn(),
        })
      );

      expect(filledResult.current.isEmpty).toBe(false);
      expect(filledResult.current.hasItems).toBe(true);
    });

    it('should calculate total items correctly', () => {
      const items: SaleItem[] = [
        {
          product_id: 'prod-1',
          product_code: 'P001',
          product_name: 'Product 1',
          quantity: 3,
          sale_price: 100000,
          discount: 0,
          total_price: 300000,
          cost_price: 50000,
          profit: 150000,
          max_qty: 10,
          note: '',
        },
        {
          product_id: 'prod-2',
          product_code: 'P002',
          product_name: 'Product 2',
          quantity: 2,
          sale_price: 150000,
          discount: 0,
          total_price: 300000,
          cost_price: 100000,
          profit: 100000,
          max_qty: 5,
          note: '',
        },
      ];

      const { result } = renderHook(() =>
        useInvoiceItems({ items, onItemsChange: vi.fn() })
      );

      expect(result.current.getTotalItems()).toBe(5); // 3 + 2
    });
  });
});
