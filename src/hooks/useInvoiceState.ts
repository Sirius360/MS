/**
 * Custom hook for managing invoice/sale tabs state
 * Extracted from CreateSale.tsx to separate business logic from UI
 */

import { useState, useCallback, useMemo } from 'react';
import type { Customer } from '@/lib/api';

export interface SaleItem {
  product_id: string;
  product_code: string;
  product_name: string;
  quantity: number;
  sale_price: number;
  discount: number;
  total_price: number;
  cost_price: number;
  profit: number;
  max_qty: number;
  note: string;
}

export interface InvoiceTab {
  id: string;
  name: string;
  customer: Customer | null;
  items: SaleItem[];
  discount: number;
  discountType: 'amount' | 'percent';
  extraFee: number;
  vatEnabled: boolean;
  vatAmount: number;
  paymentMethod: string;
  customerPayment: number;
  note: string;
}

/**
 * Create an empty invoice tab
 */
function createEmptyTab(index: number): InvoiceTab {
  return {
    id: crypto.randomUUID(),
    name: `Hóa đơn ${index}`,
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
  };
}

/**
 * Hook for managing multiple invoice tabs
 */
export function useInvoiceState() {
  const [tabs, setTabs] = useState<InvoiceTab[]>([createEmptyTab(1)]);
  const [activeTabId, setActiveTabId] = useState<string>(tabs[0].id);

  // Get active tab
  const activeTab = useMemo(
    () => tabs.find((t) => t.id === activeTabId) || tabs[0],
    [tabs, activeTabId]
  );

  // Update active tab with partial updates
  const updateActiveTab = useCallback(
    (updates: Partial<InvoiceTab>) => {
      setTabs((prev) =>
        prev.map((t) => (t.id === activeTabId ? { ...t, ...updates } : t))
      );
    },
    [activeTabId]
  );

  // Add new tab
  const addNewTab = useCallback(() => {
    const newTab = createEmptyTab(tabs.length + 1);
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newTab.id);
  }, [tabs.length]);

  // Close tab
  const closeTab = useCallback(
    (tabId: string) => {
      if (tabs.length === 1) {
        // Cannot close last tab, instead reset it
        setTabs([createEmptyTab(1)]);
        return;
      }

      const newTabs = tabs.filter((t) => t.id !== tabId);
      setTabs(newTabs);

      // If closing active tab, switch to first tab
      if (activeTabId === tabId) {
        setActiveTabId(newTabs[0].id);
      }
    },
    [tabs, activeTabId]
  );

  // Reset active tab (clear all data)
  const resetActiveTab = useCallback(() => {
    updateActiveTab({
      customer: null,
      items: [],
      discount: 0,
      extraFee: 0,
      vatEnabled: false,
      vatAmount: 0,
      customerPayment: 0,
      note: '',
    });
  }, [updateActiveTab]);

  // Set active tab customer
  const setCustomer = useCallback(
    (customer: Customer | null) => {
      updateActiveTab({ customer });
    },
    [updateActiveTab]
  );

  // Set payment method
  const setPaymentMethod = useCallback(
    (paymentMethod: string) => {
      updateActiveTab({ paymentMethod });
    },
    [updateActiveTab]
  );

  // Set customer payment amount
  const setCustomerPayment = useCallback(
    (amount: number) => {
      updateActiveTab({ customerPayment: amount });
    },
    [updateActiveTab]
  );

  // Set discount
  const setDiscount = useCallback(
    (discount: number, discountType?: 'amount' | 'percent') => {
      updateActiveTab({
        discount,
        ...(discountType && { discountType }),
      });
    },
    [updateActiveTab]
  );

  // Toggle VAT
  const toggleVat = useCallback(
    (enabled: boolean) => {
      updateActiveTab({ vatEnabled: enabled });
    },
    [updateActiveTab]
  );

  // Set VAT amount
  const setVatAmount = useCallback(
    (amount: number) => {
      updateActiveTab({ vatAmount: amount });
    },
    [updateActiveTab]
  );

  // Set extra fee
  const setExtraFee = useCallback(
    (fee: number) => {
      updateActiveTab({ extraFee: fee });
    },
    [updateActiveTab]
  );

  // Set note
  const setNote = useCallback(
    (note: string) => {
      updateActiveTab({ note });
    },
    [updateActiveTab]
  );

  return {
    // State
    tabs,
    activeTab,
    activeTabId,

    // Tab management
    setActiveTabId,
    addNewTab,
    closeTab,
    resetActiveTab,

    // Data setters
    setCustomer,
    setPaymentMethod,
    setCustomerPayment,
    setDiscount,
    toggleVat,
    setVatAmount,
    setExtraFee,
    setNote,

    // Direct update for complex cases
    updateActiveTab,
  };
}
