/**
 * Custom hook for comprehensive invoice/sale calculations
 * 
 * Automatically calculates all financial aspects of an invoice including:
 * - Subtotal from cart items
 * - Discount (percentage or fixed amount)
 * - VAT/taxes when enabled
 * - Extra fees (shipping, service charges, etc.)
 * - Final amount to pay
 * - Change to return to customer
 * - Total profit margin
 * - Quick payment amount suggestions
 * 
 * All calculations are memoized for optimal performance and only recompute
 * when dependencies change.
 */

import { useMemo } from 'react';
import type { InvoiceTab } from './useInvoiceState';

/**
 * Calculation results from useInvoiceCalculations hook
 */
export interface InvoiceCalculations {
  /** Sum of all item total prices before discounts/fees */
  subtotal: number;
  /** Calculated discount amount (based on type: percent or fixed) */
  discountAmount: number;
  /** Total VAT/tax amount (0 if VAT disabled) */
  totalVat: number;
  /** Final amount customer needs to pay (subtotal - discount + fees + VAT) */
  finalAmount: number;
  /** Change to return if customer payment > finalAmount */
  change: number;
  /** Total profit from all items (sum of item.profit) */
  totalProfit: number;
  /** Array of suggested payment amounts for quick selection */
  quickAmounts: number[];
}

/**
 * Custom hook for calculating invoice totals with real-time updates
 * 
 * @param tab - Invoice tab containing items and payment settings
 * @returns Calculated financial values, all memoized for performance
 * 
 * @example
 * ```tsx
 * const calculations = useInvoiceCalculations(activeTab);
 * 
 * // Display totals
 * console.log(calculations.subtotal); // 250000
 * console.log(calculations.discountAmount); // 25000 (10% off)
 * console.log(calculations.finalAmount); // 225000
 * 
 * // Calculate change
 * if (customerPayment >= calculations.finalAmount) {
 *   console.log(`Change: ${calculations.change}`); // 25000 if paid 250000
 * }
 * 
 * // Use quick amounts
 * calculations.quickAmounts.forEach(amount => {
 *   console.log(`Quick pay: ${amount}`); // [225000, 250000, 300000]
 * });
 * ```
 */
export function useInvoiceCalculations(tab: InvoiceTab): InvoiceCalculations {
  // Calculate subtotal from all items
  const subtotal = useMemo(() => {
    return tab.items.reduce((sum, item) => sum + item.total_price, 0);
  }, [tab.items]);

  // Calculate discount amount based on type
  const discountAmount = useMemo(() => {
    if (tab.discountType === 'percent') {
      return (subtotal * tab.discount) / 100;
    }
    return tab.discount;
  }, [subtotal, tab.discount, tab.discountType]);

  // Calculate total VAT
  const totalVat = useMemo(() => {
    return tab.vatEnabled ? tab.vatAmount : 0;
  }, [tab.vatEnabled, tab.vatAmount]);

  // Calculate final amount (after discount, fees, VAT)
  const finalAmount = useMemo(() => {
    const afterDiscount = subtotal - discountAmount;
    const withFees = afterDiscount + tab.extraFee;
    const withVat = withFees + totalVat;
    return Math.max(0, withVat); // Never negative
  }, [subtotal, discountAmount, tab.extraFee, totalVat]);

  // Calculate change to return to customer
  const change = useMemo(() => {
    return Math.max(0, tab.customerPayment - finalAmount);
  }, [tab.customerPayment, finalAmount]);

  // Calculate total profit from all items
  const totalProfit = useMemo(() => {
    return tab.items.reduce((sum, item) => sum + item.profit, 0);
  }, [tab.items]);

  // Calculate quick payment amounts (round up to nice numbers)
  const quickAmounts = useMemo(() => {
    const amounts = [
      finalAmount, // Exact amount
      Math.ceil(finalAmount / 50000) * 50000, // Round to nearest 50k
      Math.ceil(finalAmount / 100000) * 100000, // Round to nearest 100k
      Math.ceil(finalAmount / 100000) * 100000 + 100000, // +100k
    ];

    // Remove duplicates and filter to only amounts >= finalAmount
    const unique = amounts
      .filter((v, i, a) => a.indexOf(v) === i && v >= finalAmount)
      .sort((a, b) => a - b)
      .slice(0, 4); // Max 4 quick amounts

    return unique;
  }, [finalAmount]);

  return {
    subtotal,
    discountAmount,
    totalVat,
    finalAmount,
    change,
    totalProfit,
    quickAmounts,
  };
}

/**
 * Formats discount value for user-friendly display
 * 
 * @param discount - The discount value (percentage number or amount in VND)
 * @param discountType - Type of discount: 'percent' for percentage, 'amount' for fixed amount
 * @returns Formatted string ready for display
 * 
 * @example
 * ```tsx
 * formatDiscountText(10, 'percent'); // "10%"
 * formatDiscountText(50000, 'amount'); // "50.000 ₫"
 * ```
 */
export function formatDiscountText(
  discount: number,
  discountType: 'amount' | 'percent'
): string {
  if (discountType === 'percent') {
    return `${discount}%`;
  }
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(discount);
}
