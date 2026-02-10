/**
 * Tests for useInvoiceCalculations hook
 * Covers all calculation scenarios: subtotal, discount, VAT, change, quick amounts
 */

import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useInvoiceCalculations } from '../useInvoiceCalculations';
import type { InvoiceTab } from '../useInvoiceState';

// Helper to create a mock invoice tab
const createMockTab = (overrides: Partial<InvoiceTab> = {}): InvoiceTab => ({
  id: 'test-tab',
  name: 'Test Invoice',
  customer: null,
  items: [],
  discount: 0,
  discountType: 'amount',
  extraFee: 0,
  vatEnabled: false,
  vatAmount: 0,
  paymentMethod: 'cash',  
  customerPayment: 0,
  note: '',
  ...overrides,
});

describe('useInvoiceCalculations', () => {
  describe('Subtotal Calculation', () => {
    it('should calculate subtotal from multiple items', () => {
      const tab = createMockTab({
        items: [
          {
            product_id: '1',
            product_code: 'P1',
            product_name: 'Product 1',
            quantity: 2,
            sale_price: 50000,
            discount: 0,
            total_price: 100000,
            cost_price: 30000,
            profit: 40000,
            max_qty: 10,
            note: '',
          },
          {
            product_id: '2',
            product_code: 'P2',
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
        ],
      });

      const { result } = renderHook(() => useInvoiceCalculations(tab));

      expect(result.current.subtotal).toBe(250000);
    });

    it('should return 0 for empty cart', () => {
      const tab = createMockTab({ items: [] });

      const { result } = renderHook(() => useInvoiceCalculations(tab));

      expect(result.current.subtotal).toBe(0);
    });
  });

  describe('Discount Calculation', () => {
    it('should calculate percentage discount correctly', () => {
      const tab = createMockTab({
        items: [
          {
            product_id: '1',
            product_code: 'P1',
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
        ],
        discount: 10,
        discountType: 'percent',
      });

      const { result } = renderHook(() => useInvoiceCalculations(tab));

      expect(result.current.discountAmount).toBe(10000); // 10% of 100,000
    });

    it('should calculate fixed amount discount correctly', () => {
      const tab = createMockTab({
        items: [
          {
            product_id: '1',
            product_code: 'P1',
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
        ],
        discount: 15000,
        discountType: 'amount',
      });

      const { result } = renderHook(() => useInvoiceCalculations(tab));

      expect(result.current.discountAmount).toBe(15000);
    });

    it('should handle 0 discount', () => {
      const tab = createMockTab({
        items: [
          {
            product_id: '1',
            product_code: 'P1',
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
        ],
        discount: 0,
      });

      const { result } = renderHook(() => useInvoiceCalculations(tab));

      expect(result.current.discountAmount).toBe(0);
    });
  });

  describe('VAT Calculation', () => {
    it('should include VAT when enabled', () => {
      const tab = createMockTab({
        items: [
          {
            product_id: '1',
            product_code: 'P1',
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
        ],
        vatEnabled: true,
        vatAmount: 10000,
      });

      const { result } = renderHook(() => useInvoiceCalculations(tab));

      expect(result.current.totalVat).toBe(10000);
    });

    it('should return 0 VAT when disabled', () => {
      const tab = createMockTab({
        items: [
          {
            product_id: '1',
            product_code: 'P1',
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
        ],
        vatEnabled: false,
        vatAmount: 10000,
      });

      const { result } = renderHook(() => useInvoiceCalculations(tab));

      expect(result.current.totalVat).toBe(0);
    });
  });

  describe('Final Amount Calculation', () => {
    it('should calculate final amount correctly with all factors', () => {
      const tab = createMockTab({
        items: [
          {
            product_id: '1',
            product_code: 'P1',
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
        ],
        discount: 10000, // -10k
        discountType: 'amount',
        extraFee: 5000, // +5k
        vatEnabled: true,
        vatAmount: 8000, // +8k
      });

      const { result } = renderHook(() => useInvoiceCalculations(tab));

      // 100,000 - 10,000 + 5,000 + 8,000 = 103,000
      expect(result.current.finalAmount).toBe(103000);
    });

    it('should never return negative final amount', () => {
      const tab = createMockTab({
        items: [
          {
            product_id: '1',
            product_code: 'P1',
            product_name: 'Product 1',
            quantity: 1,
            sale_price: 10000,
            discount: 0,
            total_price: 10000,
            cost_price: 5000,
            profit: 5000,
            max_qty: 10,
            note: '',
          },
        ],
        discount: 50000, // Discount larger than subtotal
        discountType: 'amount',
      });

      const { result } = renderHook(() => useInvoiceCalculations(tab));

      expect(result.current.finalAmount).toBe(0);
      expect(result.current.finalAmount).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Change Calculation', () => {
    it('should calculate change correctly when customer pays more', () => {
      const tab = createMockTab({
        items: [
          {
            product_id: '1',
            product_code: 'P1',
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
        ],
        customerPayment: 150000,
      });

      const { result } = renderHook(() => useInvoiceCalculations(tab));

      expect(result.current.change).toBe(50000);
    });

    it('should return 0 change when customer pays exact amount', () => {
      const tab = createMockTab({
        items: [
          {
            product_id: '1',
            product_code: 'P1',
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
        ],
        customerPayment: 100000,
      });

      const { result } = renderHook(() => useInvoiceCalculations(tab));

      expect(result.current.change).toBe(0);
    });

    it('should return 0 change when customer pays less', () => {
      const tab = createMockTab({
        items: [
          {
            product_id: '1',
            product_code: 'P1',
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
        ],
        customerPayment: 50000,
      });

      const { result } = renderHook(() => useInvoiceCalculations(tab));

      expect(result.current.change).toBe(0);
    });
  });

  describe('Total Profit Calculation', () => {
    it('should calculate total profit from all items', () => {
      const tab = createMockTab({
        items: [
          {
            product_id: '1',
            product_code: 'P1',
            product_name: 'Product 1',
            quantity: 2,
            sale_price: 50000,
            discount: 0,
            total_price: 100000,
            cost_price: 30000,
            profit: 40000,
            max_qty: 10,
            note: '',
          },
          {
            product_id: '2',
            product_code: 'P2',
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
        ],
      });

      const { result } = renderHook(() => useInvoiceCalculations(tab));

      expect(result.current.totalProfit).toBe(90000);
    });
  });

  describe('Quick Payment Amounts', () => {
    it('should generate quick payment amounts', () => {
      const tab = createMockTab({
        items: [
          {
            product_id: '1',
            product_code: 'P1',
            product_name: 'Product 1',
            quantity: 1,
            sale_price: 123000,
            discount: 0,
            total_price: 123000,
            cost_price: 50000,
            profit: 73000,
            max_qty: 10,
            note: '',
          },
        ],
      });

      const { result } = renderHook(() => useInvoiceCalculations(tab));

      expect(result.current.quickAmounts.length).toBeGreaterThan(0);
      expect(result.current.quickAmounts.length).toBeLessThanOrEqual(4);
      
      // All quick amounts should be >= final amount
      result.current.quickAmounts.forEach((amount) => {
        expect(amount).toBeGreaterThanOrEqual(result.current.finalAmount);
      });
    });

    it('should include exact amount as first quick amount', () => {
      const tab = createMockTab({
        items: [
          {
            product_id: '1',
            product_code: 'P1',
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
        ],
      });

      const { result } = renderHook(() => useInvoiceCalculations(tab));

      expect(result.current.quickAmounts[0]).toBe(100000);
    });
  });
});
