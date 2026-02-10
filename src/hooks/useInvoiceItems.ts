/**
 * Custom hook for managing invoice/sale items (cart)
 * Handles adding, updating, removing products in the cart
 */

import { useCallback } from 'react';
import type { Product } from '@/lib/api';
import type { SaleItem } from './useInvoiceState';

export interface UseInvoiceItemsParams {
  items: SaleItem[];
  onItemsChange: (items: SaleItem[]) => void;
}

/**
 * Hook for managing sale items in the cart
 */
export function useInvoiceItems({ items, onItemsChange }: UseInvoiceItemsParams) {
  /**
   * Add product to cart
   * If product already exists, increase quantity
   */
  const addProduct = useCallback(
    (product: Product) => {
      const existingIndex = items.findIndex(
        (item) => item.product_id === product.id
      );

      if (existingIndex >= 0) {
        // Product already in cart - increase quantity
        const existing = items[existingIndex];
        const newQuantity = existing.quantity + 1;

        // Check stock availability
        if (newQuantity > existing.max_qty) {
          throw new Error(
            `Tồn kho không đủ! Chỉ còn ${existing.max_qty} sản phẩm.`
          );
        }

        const total_price = newQuantity * existing.sale_price - existing.discount;
        const profit = total_price - newQuantity * existing.cost_price;

        const updated = items.map((item, idx) =>
          idx === existingIndex
            ? {
                ...item,
                quantity: newQuantity,
                total_price,
                profit,
              }
            : item
        );

        onItemsChange(updated);
      } else {
        // New product - add to cart
        const stockQty = product.stockQty ?? product.stock_qty ?? 0;
        const salePrice = product.salePrice ?? product.sale_price_default ?? 0;
        const costPrice = product.costPrice ?? product.average_cost ?? 0;

        // Check if product has stock
        if (stockQty <= 0) {
          throw new Error(`Sản phẩm "${product.name}" đã hết hàng!`);
        }

        const newItem: SaleItem = {
          product_id: product.id,
          product_code: product.code || product.sku,
          product_name: product.name,
          quantity: 1,
          sale_price: salePrice,
          discount: 0,
          total_price: salePrice,
          cost_price: costPrice,
          profit: salePrice - costPrice,
          max_qty: stockQty,
          note: '',
        };

        onItemsChange([...items, newItem]);
      }
    },
    [items, onItemsChange]
  );

  /**
   * Update item field (quantity, price, discount, etc.)
   */
  const updateItem = useCallback(
    (index: number, field: keyof SaleItem, value: number | string) => {
      const updated = items.map((item, idx) => {
        if (idx !== index) return item;

        const updatedItem = { ...item, [field]: value };

        // Recalculate total_price and profit when relevant fields change
        if (field === 'quantity' || field === 'sale_price' || field === 'discount') {
          const qty = field === 'quantity' ? (value as number) : item.quantity;
          const price =
            field === 'sale_price' ? (value as number) : item.sale_price;
          const disc = field === 'discount' ? (value as number) : item.discount;

          // Validate quantity against stock
          if (field === 'quantity' && (value as number) > item.max_qty) {
            throw new Error(
              `Tồn kho không đủ! Chỉ còn ${item.max_qty} sản phẩm.`
            );
          }

          updatedItem.total_price = qty * price - disc;
          updatedItem.profit = updatedItem.total_price - qty * item.cost_price;
        }

        return updatedItem;
      });

      onItemsChange(updated);
    },
    [items, onItemsChange]
  );

  /**
   * Remove item from cart
   */
  const removeItem = useCallback(
    (index: number) => {
      const updated = items.filter((_, idx) => idx !== index);
      onItemsChange(updated);
    },
    [items, onItemsChange]
  );

  /**
   * Clear all items
   */
  const clearItems = useCallback(() => {
    onItemsChange([]);
  }, [onItemsChange]);

  /**
   * Update item note
   */
  const updateItemNote = useCallback(
    (index: number, note: string) => {
      updateItem(index, 'note', note);
    },
    [updateItem]
  );

  /**
   * Update item discount
   */
  const updateItemDiscount = useCallback(
    (index: number, discount: number) => {
      updateItem(index, 'discount', discount);
    },
    [updateItem]
  );

  /**
   * Get total item count
   */
  const getTotalItems = useCallback(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  /**
   * Check if cart is empty
   */
  const isEmpty = items.length === 0;

  /**
   * Check if cart has items
   */
  const hasItems = items.length > 0;

  return {
    // State
    items,
    isEmpty,
    hasItems,

    // Actions
    addProduct,
    updateItem,
    removeItem,
    clearItems,
    updateItemNote,
    updateItemDiscount,

    // Helpers
    getTotalItems,
  };
}
