import { useState, useEffect, useCallback } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Upload, X, ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCategories } from '@/hooks/useCategories';
import { useUpdateProduct, type Product } from '@/hooks/useProducts';
import { formatCurrency } from '@/lib/formatters';

interface ProductEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onSuccess?: () => void;
}

export function ProductEditDialog({
  open,
  onOpenChange,
  product,
  onSuccess,
}: ProductEditDialogProps) {
  const { toast } = useToast();
  const { data: categories = [] } = useCategories();
  const updateProduct = useUpdateProduct();

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    category_id: '',
    brand: '',
    cost_price: 0,
    vat_input: 0,
    sale_price_before_tax: 0,
    vat_sale: 0,
    sale_price_after_tax: 0,
    stock: 0,
    min_stock: 0,
    max_stock: 0,
    direct_sale: true,
    unit: 'cái',
    notes: '',
    image_url: '',
  });

  // Load product data when dialog opens
  useEffect(() => {
    if (product && open) {
      const salePriceBeforeTax = product.sale_price_default || 0;
      const vatSale = product.vat_sale || 0;
      const salePriceAfterTax = salePriceBeforeTax * (1 + vatSale / 100);

      setFormData({
        code: product.code || '',
        name: product.name || '',
        category_id: product.category_id || '',
        brand: (product as any).brand || '',
        cost_price: product.cost_price || 0,
        vat_input: (product as any).vat_input || 0,
        sale_price_before_tax: salePriceBeforeTax,
        vat_sale: vatSale,
        sale_price_after_tax: Math.round(salePriceAfterTax),
        stock: product.stock || 0,
        min_stock: (product as any).min_stock || 0,
        max_stock: (product as any).max_stock || 0,
        direct_sale: (product as any).direct_sale ?? true,
        unit: product.unit || 'cái',
        notes: product.notes || '',
        image_url: product.image_url || '',
      });
    }
  }, [product, open]);

  // Auto-calculate sale price after tax
  useEffect(() => {
    const afterTax = formData.sale_price_before_tax * (1 + formData.vat_sale / 100);
    setFormData((prev) => ({
      ...prev,
      sale_price_after_tax: Math.round(afterTax),
    }));
  }, [formData.sale_price_before_tax, formData.vat_sale]);

  const handleSave = async () => {
    if (!product) return;

    if (!formData.name.trim()) {
      toast({ title: 'Lỗi', description: 'Vui lòng nhập tên hàng hóa', variant: 'destructive' });
      return;
    }

    try {
      await updateProduct.mutateAsync({
        id: product.id,
        code: formData.code,
        name: formData.name,
        category_id: formData.category_id || null,
        cost_price: formData.cost_price,
        sale_price_default: formData.sale_price_before_tax,
        vat_sale: formData.vat_sale,
        unit: formData.unit,
        notes: formData.notes,
        image_url: formData.image_url || null,
      });

      toast({ title: 'Thành công', description: 'Đã cập nhật hàng hóa' });
      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể cập nhật hàng hóa',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Sửa hàng hóa
            <Badge variant="outline">{formData.code}</Badge>
          </DialogTitle>
          <DialogDescription>Chỉnh sửa thông tin chi tiết hàng hóa</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6 py-4">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Code */}
            <div>
              <Label htmlFor="code">Mã hàng</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))
                }
                placeholder="SP000001"
              />
            </div>

            {/* Name */}
            <div>
              <Label htmlFor="name">Tên hàng *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Nhập tên hàng hóa"
              />
            </div>

            {/* Category */}
            <div>
              <Label>Nhóm hàng</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, category_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn nhóm hàng" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Brand */}
            <div>
              <Label htmlFor="brand">Thương hiệu</Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => setFormData((prev) => ({ ...prev, brand: e.target.value }))}
                placeholder="Nhập thương hiệu"
              />
            </div>

            {/* Unit */}
            <div>
              <Label htmlFor="unit">Đơn vị tính</Label>
              <Select
                value={formData.unit}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, unit: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cái">Cái</SelectItem>
                  <SelectItem value="chiếc">Chiếc</SelectItem>
                  <SelectItem value="bộ">Bộ</SelectItem>
                  <SelectItem value="hộp">Hộp</SelectItem>
                  <SelectItem value="kg">Kg</SelectItem>
                  <SelectItem value="lít">Lít</SelectItem>
                  <SelectItem value="m">Mét</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Image */}
            <div>
              <Label>Hình ảnh</Label>
              <div className="mt-2 border-2 border-dashed rounded-lg p-4 text-center">
                {formData.image_url ? (
                  <div className="relative">
                    <img
                      src={formData.image_url}
                      alt={formData.name}
                      className="w-32 h-32 object-cover mx-auto rounded"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 h-6 w-6"
                      onClick={() => setFormData((prev) => ({ ...prev, image_url: '' }))}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <ImageIcon className="h-12 w-12" />
                    <span className="text-sm">Chưa có hình ảnh</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Pricing */}
          <div className="space-y-4">
            {/* Cost Price */}
            <div>
              <Label htmlFor="cost_price">Giá vốn</Label>
              <Input
                id="cost_price"
                type="number"
                value={formData.cost_price}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, cost_price: Number(e.target.value) }))
                }
                className="text-right"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {formatCurrency(formData.cost_price)}
              </p>
            </div>

            {/* VAT Input */}
            <div>
              <Label htmlFor="vat_input">VAT hàng nhập (%)</Label>
              <Input
                id="vat_input"
                type="number"
                value={formData.vat_input}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, vat_input: Number(e.target.value) }))
                }
                className="text-right"
                min={0}
                max={100}
              />
            </div>

            {/* Sale Price Before Tax */}
            <div>
              <Label htmlFor="sale_price_before_tax">Giá bán trước thuế</Label>
              <Input
                id="sale_price_before_tax"
                type="number"
                value={formData.sale_price_before_tax}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    sale_price_before_tax: Number(e.target.value),
                  }))
                }
                className="text-right"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {formatCurrency(formData.sale_price_before_tax)}
              </p>
            </div>

            {/* VAT Sale */}
            <div>
              <Label htmlFor="vat_sale">VAT hàng bán (%)</Label>
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
              <Label htmlFor="sale_price_after_tax">Giá bán sau thuế</Label>
              <Input
                id="sale_price_after_tax"
                type="number"
                value={formData.sale_price_after_tax}
                readOnly
                className="text-right bg-muted font-semibold"
              />
              <p className="text-xs text-primary font-medium mt-1">
                {formatCurrency(formData.sale_price_after_tax)}
              </p>
            </div>

            {/* Stock Info */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="stock">Tồn kho</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock}
                  readOnly
                  className="text-right bg-muted"
                />
              </div>
              <div>
                <Label htmlFor="min_stock">Tồn tối thiểu</Label>
                <Input
                  id="min_stock"
                  type="number"
                  value={formData.min_stock}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, min_stock: Number(e.target.value) }))
                  }
                  className="text-right"
                />
              </div>
              <div>
                <Label htmlFor="max_stock">Tồn tối đa</Label>
                <Input
                  id="max_stock"
                  type="number"
                  value={formData.max_stock}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, max_stock: Number(e.target.value) }))
                  }
                  className="text-right"
                />
              </div>
            </div>

            {/* Direct Sale */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <Label htmlFor="direct_sale">Bán trực tiếp</Label>
                <p className="text-xs text-muted-foreground">Cho phép bán hàng tại quầy</p>
              </div>
              <Switch
                id="direct_sale"
                checked={formData.direct_sale}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, direct_sale: checked }))
                }
              />
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Ghi chú</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Ghi chú về sản phẩm..."
                rows={3}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleSave} disabled={updateProduct.isPending}>
            {updateProduct.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Lưu thay đổi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
