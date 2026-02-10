/**
 * Create Sale Page - Refactored Version
 * Using custom hooks and split components for better maintainability
 * 
 * Reduced from 903 lines → ~400 lines by extracting:
 * - Business logic to hooks (useInvoiceState, useInvoiceCalculations, useInvoiceItems)
 * - UI components (InvoiceHeader, InvoiceTabs, PaymentPanel, InvoiceItemsTable)
 */

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useProducts } from '@/hooks/useProducts';
import { useCustomers, useCreateCustomer } from '@/hooks/useCustomers';
import { useInvoiceState } from '@/hooks/useInvoiceState';
import { useInvoiceCalculations } from '@/hooks/useInvoiceCalculations';
import { useInvoiceItems } from '@/hooks/useInvoiceItems';
import { InvoiceHeader } from '@/components/sales/InvoiceHeader';
import { InvoiceTabs } from '@/components/sales/InvoiceTabs';
import { PaymentPanel } from '@/components/sales/PaymentPanel';
import { InvoiceItemsTable } from '@/components/sales/InvoiceItemsTable';
import { handleApiError } from '@/lib/errorHandler';
import { httpClient } from '@/lib/httpClient';
import type { Product, Customer } from '@/lib/api';

export default function CreateSale() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Data hooks
  const { data: products = [] } = useProducts();
  const { data: customers = [] } = useCustomers();
  const createCustomer = useCreateCustomer();

  // Invoice state management (custom hook)
  const invoiceState = useInvoiceState();
  
  // Invoice calculations (custom hook)
  const calculations = useInvoiceCalculations(invoiceState.activeTab);
  
  // Invoice items management (custom hook)
  const items = useInvoiceItems({
    items: invoiceState.activeTab.items,
    onItemsChange: (newItems) => invoiceState.updateActiveTab({ items: newItems }),
  });

  // Dialog states
  const [productSearchOpen, setProductSearchOpen] = useState(false);
  const [customerOpen, setCustomerOpen] = useState(false);
  const [quickCreateCustomerOpen, setQuickCreateCustomerOpen] = useState(false);
  
  // Search states
  const [productSearch, setProductSearch] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  
  // Quick create customer
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '' });

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F3') {
        e.preventDefault();
        setProductSearchOpen(true);
      }
      if (e.key === 'F4') {
        e.preventDefault();
        setCustomerOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filtered products for search (only products with stock)
  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => (p.stockQty || p.stock_qty || 0) > 0);
    if (productSearch) {
      const search = productSearch.toLowerCase();
      result = result.filter(
        (p) =>
          (p.sku || p.code || '').toLowerCase().includes(search) ||
          p.name.toLowerCase().includes(search)
      );
    }
    return result.slice(0, 20);
  }, [products, productSearch]);

  // Filtered customers for selection
  const filteredCustomers = useMemo(() => {
    if (!customerSearch) return customers;
    const search = customerSearch.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(search) ||
        (c.phone || '').includes(search)
    );
  }, [customers, customerSearch]);

  // Handle product selection from search
  const handleProductSelect = (product: Product) => {
    try {
      items.addProduct(product);
      setProductSearchOpen(false);
      setProductSearch('');
      toast({
        title: 'Đã thêm sản phẩm',
        description: `${product.name} đã được thêm vào giỏ hàng`,
      });
    } catch (error) {
      handleApiError(error, toast, {
        title: 'Không thể thêm sản phẩm',
      });
    }
  };

  // Handle customer selection
  const handleCustomerSelect = (customer: Customer) => {
    invoiceState.setCustomer(customer);
    setCustomerOpen(false);
    setCustomerSearch('');
  };

  // Handle quick create customer
  const handleQuickCreateCustomer = async () => {
    if (!newCustomer.name.trim()) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng nhập tên khách hàng',
        variant: 'destructive',
      });
      return;
    }

    try {
      const customer = await createCustomer.mutateAsync(newCustomer);
      invoiceState.setCustomer(customer);
      setQuickCreateCustomerOpen(false);
      setNewCustomer({ name: '', phone: '' });
      toast({
        title: 'Thành công',
        description: `Đã tạo khách hàng ${customer.name}`,
      });
    } catch (error) {
      handleApiError(error, toast, {
        title: 'Lỗi tạo khách hàng',
      });
    }
  };

  // Handle payment
  const handlePayment = async () => {
    // Validation
    if (items.isEmpty) {
      toast({
        title: 'Giỏ hàng trống',
        description: 'Vui lòng thêm sản phẩm trước khi thanh toán',
        variant: 'destructive',
      });
      return;
    }

    if (invoiceState.activeTab.customerPayment < calculations.finalAmount) {
      toast({
        title: 'Tiền khách đưa không đủ',
        description: `Cần thêm ${calculations.finalAmount - invoiceState.activeTab.customerPayment} VNĐ`,
        variant: 'destructive',
      });
      return;
    }

    try {
      // Prepare invoice data
      const invoiceData = {
        customer_id: invoiceState.activeTab.customer?.id || null,
        items: invoiceState.activeTab.items.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          sale_price: item.sale_price,
          discount: item.discount,
        })),
        discount: invoiceState.activeTab.discount,
        discount_type: invoiceState.activeTab.discountType,
        extra_fee: invoiceState.activeTab.extraFee,
        vat_amount: invoiceState.activeTab.vatEnabled ? invoiceState.activeTab.vatAmount : 0,
        payment_method: invoiceState.activeTab.paymentMethod,
        customer_payment: invoiceState.activeTab.customerPayment,
        note: invoiceState.activeTab.note,
      };

      // Call API
      const response = await httpClient.post<{ data: any }>('/invoices', invoiceData);

      // Invalidate products query to refresh stock
      queryClient.invalidateQueries({ queryKey: ['products'] });

      // Show success
      toast({
        title: 'Thanh toán thành công',
        description: `Mã hóa đơn: ${response.data?.code || 'N/A'}`,
      });

      // Reset current tab or navigate
      invoiceState.resetActiveTab();

    } catch (error) {
      handleApiError(error, toast, {
        title: 'Lỗi thanh toán',
        showRetry: true,
        onRetry: handlePayment,
      });
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <InvoiceHeader
        onBack={() => navigate('/sales')}
        onProductSearch={() => setProductSearchOpen(true)}
      />

      {/* Tabs */}
      <InvoiceTabs
        tabs={invoiceState.tabs}
        activeTabId={invoiceState.activeTabId}
        onTabChange={invoiceState.setActiveTabId}
        onTabClose={invoiceState.closeTab}
        onAddTab={invoiceState.addNewTab}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Items Table */}
        <div className="flex-1 flex flex-col">
          <InvoiceItemsTable
            items={invoiceState.activeTab.items}
            onUpdateItem={(index, field, value) => {
              try {
                items.updateItem(index, field, value);
              } catch (error) {
                handleApiError(error, toast);
              }
            }}
            onRemoveItem={items.removeItem}
          />
        </div>

        {/* Payment Panel */}
        <PaymentPanel
          customer={invoiceState.activeTab.customer}
          calculations={calculations}
          paymentMethod={invoiceState.activeTab.paymentMethod}
          customerPayment={invoiceState.activeTab.customerPayment}
          onCustomerSelect={() => setCustomerOpen(true)}
          onPaymentMethodChange={invoiceState.setPaymentMethod}
          onCustomerPaymentChange={invoiceState.setCustomerPayment}
          onPay={handlePayment}
        />
      </div>

      {/* Product Search Dialog */}
      <Dialog open={productSearchOpen} onOpenChange={setProductSearchOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tìm sản phẩm</DialogTitle>
            <DialogDescription>
              Tìm kiếm theo mã hoặc tên sản phẩm
            </DialogDescription>
          </DialogHeader>
          <Command className="border rounded-lg">
            <CommandInput
              placeholder="Nhập mã hoặc tên sản phẩm..."
              value={productSearch}
              onValueChange={setProductSearch}
            />
            <CommandList>
              <CommandEmpty>Không tìm thấy sản phẩm</CommandEmpty>
              <CommandGroup>
                {filteredProducts.map((product) => (
                  <CommandItem
                    key={product.id}
                    value={product.id}
                    onSelect={() => handleProductSelect(product)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {product.code || product.sku} • Tồn: {product.stockQty || product.stock_qty || 0}
                        </div>
                      </div>
                      <div className="font-semibold">
                        {(product.salePrice || product.sale_price_default || 0).toLocaleString('vi-VN')} ₫
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>

      {/* Customer Selection Dialog */}
      <Dialog open={customerOpen} onOpenChange={setCustomerOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chọn khách hàng</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Tìm theo tên hoặc số điện thoại..."
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
            />
            <div className="max-h-96 overflow-auto border rounded-lg">
              {filteredCustomers.map((customer) => (
                <div
                  key={customer.id}
                  className="p-3 hover:bg-accent cursor-pointer border-b last:border-0"
                  onClick={() => handleCustomerSelect(customer)}
                >
                  <div className="font-medium">{customer.name}</div>
                  <div className="text-sm text-muted-foreground">{customer.phone}</div>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setCustomerOpen(false);
                setQuickCreateCustomerOpen(true);
              }}
            >
              Tạo khách hàng mới
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Quick Create Customer Dialog */}
      <Dialog open={quickCreateCustomerOpen} onOpenChange={setQuickCreateCustomerOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tạo khách hàng nhanh</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="customer-name">Tên khách hàng *</Label>
              <Input
                id="customer-name"
                value={newCustomer.name}
                onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                placeholder="Nhập tên khách hàng"
              />
            </div>
            <div>
              <Label htmlFor="customer-phone">Số điện thoại</Label>
              <Input
                id="customer-phone"
                value={newCustomer.phone}
                onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                placeholder="Nhập số điện thoại"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setQuickCreateCustomerOpen(false)}
            >
              Hủy
            </Button>
            <Button onClick={handleQuickCreateCustomer}>Tạo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
