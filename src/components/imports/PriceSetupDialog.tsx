import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUpdateProduct } from '@/hooks/useProducts';
import { formatCurrency } from '@/lib/formatters';

interface PriceSetupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: {
    id: string;
    code: string;
    name: string;
    cost_price: number;
    sale_price_default: number;
    vat_sale: number;
  } | null;
  importPrice?: number;
  onSuccess?: () => void;
}

export function PriceSetupDialog({
  open,
  onOpenChange,
  product,
  importPrice,
  onSuccess,
}: PriceSetupDialogProps) {
  const { toast } = useToast();
  const updateProduct = useUpdateProduct();

  const [formData, setFormData] = useState({
    cost_price: 0,
    sale_price_before_tax: 0,
    vat_sale: 0,
    sale_price_after_tax: 0,
  });

  // Load product data when dialog opens
  useEffect(() => {
    if (product && open) {
      const costPrice = importPrice ?? product.cost_price ?? 0;
      const salePriceBeforeTax = product.sale_price_default ?? 0;
      const vatSale = product.vat_sale ?? 0;
      const salePriceAfterTax = salePriceBeforeTax * (1 + vatSale / 100);

      setFormData({
        cost_price: costPrice,
        sale_price_before_tax: salePriceBeforeTax,
        vat_sale: vatSale,
        sale_price_after_tax: Math.round(salePriceAfterTax),
      });
    }
  }, [product, importPrice, open]);

  // Auto-calculate sale price after tax
  useEffect(() => {
    const afterTax = formData.sale_price_before_tax * (1 + formData.vat_sale / 100);
    setFormData((prev) => ({
      ...prev,
      sale_price_after_tax: Math.round(afterTax),
    }));
  }, [formData.sale_price_before_tax, formData.vat_sale]);

  // Calculate margin
  const margin = formData.sale_price_before_tax - formData.cost_price;
  const marginPercent =
    formData.cost_price > 0 ? ((margin / formData.cost_price) * 100).toFixed(1) : '0';

  const handleSave = async () => {
    if (!product) return;

    try {
      await updateProduct.mutateAsync({
        id: product.id,
        sale_price_default: formData.sale_price_before_tax,
        vat_sale: formData.vat_sale,
      });

      toast({ title: 'Thành công', description: 'Đã cập nhật giá bán' });
      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể cập nhật giá',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">Thiết lập giá</DialogTitle>
          <DialogDescription>
            {product?.code} - {product?.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current Cost Price */}
          <div>
            <Label>Giá vốn hiện tại</Label>
            <Input
              value={formData.cost_price}
              readOnly
              className="text-right bg-muted font-medium"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {formatCurrency(formData.cost_price)}
            </p>
          </div>

          {/* Sale Price Before Tax */}
          <div>
            <Label htmlFor="sale_price_before_tax">Giá bán trước thuế</Label>
            <Input
              id="sale_price_before_tax"
              type="number"
              value={formData.sale_price_before_tax}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, sale_price_before_tax: Number(e.target.value) }))
              }
              className="text-right"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {formatCurrency(formData.sale_price_before_tax)}
            </p>
          </div>

          {/* VAT Sale */}
          <div>
            <Label htmlFor="vat_sale">VAT bán (%)</Label>
            <Input
              id="vat_sale"
              type="number"
              value={formData.vat_sale}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, vat_sale: Number(e.target.value) }))
              }
              className="text-right"
              min={0}
              max={100}
            />
          </div>

          {/* Sale Price After Tax (Read-only) */}
          <div>
            <Label>Giá bán sau thuế</Label>
            <Input
              value={formData.sale_price_after_tax}
              readOnly
              className="text-right bg-muted font-semibold text-lg"
            />
            <p className="text-xs text-primary font-medium mt-1">
              {formatCurrency(formData.sale_price_after_tax)}
            </p>
          </div>

          {/* Margin Info */}
          <div className="p-3 bg-muted/50 rounded-lg space-y-1">
            <div className="flex justify-between text-sm">
              <span>Lợi nhuận:</span>
              <span
                className={margin >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}
              >
                {formatCurrency(margin)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Biên lợi nhuận:</span>
              <Badge variant={Number(marginPercent) >= 0 ? 'default' : 'destructive'}>
                {marginPercent}%
              </Badge>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleSave} disabled={updateProduct.isPending}>
            {updateProduct.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Lưu giá
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
