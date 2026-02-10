/**
 * Tests for useInvoiceState hook
 * Covers multi-tab invoice management and state updates
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useInvoiceState } from '../useInvoiceState';
import type { Customer } from '@/lib/api';

// Mock customer data
const mockCustomer: Customer = {
  id: 'cust-1',
  name: 'John Doe',
  phone: '0123456789',
  address: '123 Test St',
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

describe('useInvoiceState', () => {
  describe('Initialization', () => {
    it('should initialize with one empty tab', () => {
      const { result } = renderHook(() => useInvoiceState());

      expect(result.current.tabs).toHaveLength(1);
      expect(result.current.activeTab).toBeDefined();
      expect(result.current.activeTab.items).toEqual([]);
      expect(result.current.activeTab.customer).toBeNull();
      expect(result.current.activeTab.discount).toBe(0);
    });

    it('should have first tab as active', () => {
      const { result } = renderHook(() => useInvoiceState());

      expect(result.current.activeTabId).toBe(result.current.tabs[0].id);
      expect(result.current.activeTab.id).toBe(result.current.tabs[0].id);
    });
  });

  describe('Tab Management', () => {
    it('should add new tab', () => {
      const { result } = renderHook(() => useInvoiceState());

      act(() => {
        result.current.addNewTab();
      });

      expect(result.current.tabs).toHaveLength(2);
      expect(result.current.activeTabId).toBe(result.current.tabs[1].id);
    });

    it('should switch active tab', () => {
      const { result } = renderHook(() => useInvoiceState());

      act(() => {
        result.current.addNewTab();
      });

      const firstTabId = result.current.tabs[0].id;

      act(() => {
        result.current.setActiveTabId(firstTabId);
      });

      expect(result.current.activeTabId).toBe(firstTabId);
      expect(result.current.activeTab.id).toBe(firstTabId);
    });

    it('should close tab when multiple tabs exist', () => {
      const { result } = renderHook(() => useInvoiceState());

      act(() => {
        result.current.addNewTab();
      });

      expect(result.current.tabs).toHaveLength(2);

      const firstTabId = result.current.tabs[0].id;

      act(() => {
        result.current.closeTab(firstTabId);
      });

      expect(result.current.tabs).toHaveLength(1);
      expect(result.current.tabs.find((t) => t.id === firstTabId)).toBeUndefined();
    });

    it('should reset tab instead of closing when only one tab exists', () => {
      const { result } = renderHook(() => useInvoiceState());

      const initialTabId = result.current.tabs[0].id;

      // Add some data to the tab
      act(() => {
        result.current.setCustomer(mockCustomer);
        result.current.setDiscount(10000);
      });

      expect(result.current.activeTab.customer).not.toBeNull();
      expect(result.current.activeTab.discount).toBe(10000);

      // Try to close the only tab
      act(() => {
        result.current.closeTab(initialTabId);
      });

      // Should still have exactly one tab
      expect(result.current.tabs).toHaveLength(1);
      // But it should be a new empty tab
      expect(result.current.tabs[0].customer).toBeNull();
      expect(result.current.tabs[0].discount).toBe(0);
    });

    it('should switch to first tab when closing active tab', () => {
      const { result } = renderHook(() => useInvoiceState());

      act(() => {
        result.current.addNewTab();
        result.current.addNewTab();
      });

      expect(result.current.tabs).toHaveLength(3);

      const secondTabId = result.current.tabs[1].id;
      const thirdTabId = result.current.tabs[2].id;

      // Switch to second tab
      act(() => {
        result.current.setActiveTabId(secondTabId);
      });

      expect(result.current.activeTabId).toBe(secondTabId);

      // Close the active (second) tab
      act(() => {
        result.current.closeTab(secondTabId);
      });

      // Should switch to first tab
      expect(result.current.activeTabId).toBe(result.current.tabs[0].id);
      expect(result.current.tabs).toHaveLength(2);
    });
  });

  describe('Customer Management', () => {
    it('should set customer', () => {
      const { result } = renderHook(() => useInvoiceState());

      act(() => {
        result.current.setCustomer(mockCustomer);
      });

      expect(result.current.activeTab.customer).toEqual(mockCustomer);
      expect(result.current.activeTab.customer?.name).toBe('John Doe');
    });

    it('should clear customer', () => {
      const { result } = renderHook(() => useInvoiceState());

      act(() => {
        result.current.setCustomer(mockCustomer);
      });

      expect(result.current.activeTab.customer).not.toBeNull();

      act(() => {
        result.current.setCustomer(null);
      });

      expect(result.current.activeTab.customer).toBeNull();
    });
  });

  describe('Payment Settings', () => {
    it('should set payment method', () => {
      const { result } = renderHook(() => useInvoiceState());

      act(() => {
        result.current.setPaymentMethod('transfer');
      });

      expect(result.current.activeTab.paymentMethod).toBe('transfer');
    });

    it('should set customer payment amount', () => {
      const { result } = renderHook(() => useInvoiceState());

      act(() => {
        result.current.setCustomerPayment(500000);
      });

      expect(result.current.activeTab.customerPayment).toBe(500000);
    });
  });

  describe('Discount Management', () => {
    it('should set discount amount', () => {
      const { result } = renderHook(() => useInvoiceState());

      act(() => {
        result.current.setDiscount(50000);
      });

      expect(result.current.activeTab.discount).toBe(50000);
    });

    it('should set discount type', () => {
      const { result } = renderHook(() => useInvoiceState());

      act(() => {
        result.current.setDiscount(10, 'percent');
      });

      expect(result.current.activeTab.discount).toBe(10);
      expect(result.current.activeTab.discountType).toBe('percent');
    });
  });

  describe('VAT Management', () => {
    it('should toggle VAT', () => {
      const { result } = renderHook(() => useInvoiceState());

      expect(result.current.activeTab.vatEnabled).toBe(false);

      act(() => {
        result.current.toggleVat(true);
      });

      expect(result.current.activeTab.vatEnabled).toBe(true);

      act(() => {
        result.current.toggleVat(false);
      });

      expect(result.current.activeTab.vatEnabled).toBe(false);
    });

    it('should set VAT amount', () => {
      const { result } = renderHook(() => useInvoiceState());

      act(() => {
        result.current.setVatAmount(10000);
      });

      expect(result.current.activeTab.vatAmount).toBe(10000);
    });
  });

  describe('Other Settings', () => {
    it('should set extra fee', () => {
      const { result } = renderHook(() => useInvoiceState());

      act(() => {
        result.current.setExtraFee(5000);
      });

      expect(result.current.activeTab.extraFee).toBe(5000);
    });

    it('should set note', () => {
      const { result } = renderHook(() => useInvoiceState());

      act(() => {
        result.current.setNote('Special delivery instructions');
      });

      expect(result.current.activeTab.note).toBe('Special delivery instructions');
    });
  });

  describe('Reset Tab', () => {
    it('should reset active tab to empty state', () => {
      const { result } = renderHook(() => useInvoiceState());

      // Set various data
      act(() => {
        result.current.setCustomer(mockCustomer);
        result.current.setDiscount(10000);
        result.current.setCustomerPayment(500000);
        result.current.setNote('Test note');
      });

      expect(result.current.activeTab.customer).not.toBeNull();
      expect(result.current.activeTab.discount).toBe(10000);

      // Reset
      act(() => {
        result.current.resetActiveTab();
      });

      expect(result.current.activeTab.customer).toBeNull();
      expect(result.current.activeTab.items).toEqual([]);
      expect(result.current.activeTab.discount).toBe(0);
      expect(result.current.activeTab.customerPayment).toBe(0);
      expect(result.current.activeTab.note).toBe('');
    });
  });

  describe('Direct Update', () => {
    it('should allow direct partial updates', () => {
      const { result } = renderHook(() => useInvoiceState());

      act(() => {
        result.current.updateActiveTab({
          discount: 15000,
          discountType: 'amount',
          extraFee: 3000,
        });
      });

      expect(result.current.activeTab.discount).toBe(15000);
      expect(result.current.activeTab.discountType).toBe('amount');
      expect(result.current.activeTab.extraFee).toBe(3000);
    });
  });

  describe('Multi-tab State Isolation', () => {
    it('should maintain separate state for each tab', () => {
      const { result } = renderHook(() => useInvoiceState());

      // Add second tab
      act(() => {
        result.current.addNewTab();
      });

      const firstTabId = result.current.tabs[0].id;
      const secondTabId = result.current.tabs[1].id;

      // Set data in second tab (currently active)
      act(() => {
        result.current.setCustomer(mockCustomer);
        result.current.setDiscount(10000);
      });

      expect(result.current.activeTab.customer?.name).toBe('John Doe');
      expect(result.current.activeTab.discount).toBe(10000);

      // Switch to first tab
      act(() => {
        result.current.setActiveTabId(firstTabId);
      });

      // First tab should still be empty
      expect(result.current.activeTab.customer).toBeNull();
      expect(result.current.activeTab.discount).toBe(0);

      // Switch back to second tab
      act(() => {
        result.current.setActiveTabId(secondTabId);
      });

      // Second tab should still have its data
      expect(result.current.activeTab.customer?.name).toBe('John Doe');
      expect(result.current.activeTab.discount).toBe(10000);
    });
  });
});
