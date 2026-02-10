/**
 * Payment Panel Component
 * Right sidebar with payment summary, customer selection, and payment actions
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { User, Printer, Check } from 'lucide-react';
import type { Customer } from '@/lib/api';
import type { InvoiceCalculations } from '@/hooks/useInvoiceCalculations';
import { formatCurrency } from '@/lib/formatters';
import { cn } from '@/lib/utils';

interface PaymentPanelProps {
  customer: Customer | null;
  calculations: InvoiceCalculations;
  paymentMethod: string;
  customerPayment: number;
  onCustomerSelect: () => void;
  onPaymentMethodChange: (method: string) => void;
  onCustomerPaymentChange: (amount: number) => void;
  onPay: () => void;
  onPrint?: () => void;
  disabled?: boolean;
}

export function PaymentPanel({
  customer,
  calculations,
  paymentMethod,
  customerPayment,
  onCustomerSelect,
  onPaymentMethodChange,
  onCustomerPaymentChange,
  onPay,
  onPrint,
  disabled = false,
}: PaymentPanelProps) {
  const canPay = calculations.finalAmount > 0 && customerPayment >= calculations.finalAmount;

  return (
    <div className="w-80 border-l bg-card flex flex-col">
      {/* Customer Selection */}
      <div className="p-4 border-b">
        <Label className="text-sm font-medium mb-2 block">Khách hàng</Label>
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={onCustomerSelect}
        >
          <User className="w-4 h-4 mr-2" />
          {customer ? customer.name : 'Chọn khách hàng (F4)'}
        </Button>
      </div>

      {/* Payment Summary */}
      <div className="flex-1 p-4 space-y-3 overflow-auto">
        {/* Subtotal */}
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Tạm tính</span>
          <span className="font-medium">{formatCurrency(calculations.subtotal)}</span>
        </div>

        {/* Discount */}
        {calculations.discountAmount > 0 && (
          <div className="flex justify-between text-sm text-destructive">
            <span>Giảm giá</span>
            <span>-{formatCurrency(calculations.discountAmount)}</span>
          </div>
        )}

        {/* VAT */}
        {calculations.totalVat > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">VAT</span>
            <span className="font-medium">{formatCurrency(calculations.totalVat)}</span>
          </div>
        )}

        <Separator />

        {/* Final Amount */}
        <div className="flex justify-between text-lg font-bold">
          <span>Tổng cộng</span>
          <span className="text-primary">{formatCurrency(calculations.finalAmount)}</span>
        </div>

        <Separator />

        {/* Payment Method */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Phương thức</Label>
          <RadioGroup value={paymentMethod} onValueChange={onPaymentMethodChange}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="cash" id="cash" />
              <Label htmlFor="cash" className="cursor-pointer">Tiền mặt</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="transfer" id="transfer" />
              <Label htmlFor="transfer" className="cursor-pointer">Chuyển khoản</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="card" id="card" />
              <Label htmlFor="card" className="cursor-pointer">Thẻ</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Customer Payment Input */}
        <div className="space-y-2">
          <Label htmlFor="customer-payment" className="text-sm font-medium">
            Tiền khách đưa
          </Label>
          <Input
            id="customer-payment"
            type="number"
            value={customerPayment || ''}
            onChange={(e) => onCustomerPaymentChange(Number(e.target.value))}
            placeholder="0"
            className="text-lg font-semibold"
          />
        </div>

        {/* Quick Amount Buttons */}
        <div className="grid grid-cols-2 gap-2">
          {calculations.quickAmounts.map((amount) => (
            <Button
              key={amount}
              variant="outline"
              size="sm"
              onClick={() => onCustomerPaymentChange(amount)}
              className="text-xs"
            >
              {formatCurrency(amount)}
            </Button>
          ))}
        </div>

        {/* Change Amount */}
        {customerPayment > 0 && (
          <div className={cn(
            "flex justify-between text-base font-semibold p-3 rounded-lg",
            calculations.change > 0 ? "bg-success/10 text-success" : "bg-muted"
          )}>
            <span>Tiền thừa</span>
            <span>{formatCurrency(calculations.change)}</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="p-4 border-t space-y-2">
        <Button
          className="w-full"
          size="lg"
          onClick={onPay}
          disabled={disabled || !canPay}
        >
          <Check className="w-4 h-4 mr-2" />
          THANH TOÁN
        </Button>

        {onPrint && (
          <Button
            variant="outline"
            className="w-full"
            onClick={onPrint}
            disabled={disabled}
          >
            <Printer className="w-4 h-4 mr-2" />
            In hóa đơn
          </Button>
        )}
      </div>
    </div>
  );
}
