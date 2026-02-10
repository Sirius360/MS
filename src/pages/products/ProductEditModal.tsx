import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Save, X, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCategories, useCreateCategory, type Category } from '@/hooks/useCategories';
import { useProductById, useUpdateProduct } from '@/hooks/useProducts';
import { useQueryClient } from '@tanstack/react-query';

interface ProductEditModalProps {
  productId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ProductFormData {
  code: string;
  name: string;
  category_id: string;
  brand: string;
  sale_price_before_tax: number;
  vat_sale: number;
  sale_price_after_tax: number;
  unit: string;
  notes: string;
  status: 'active' | 'inactive';
}

export function ProductEditModal({ productId, open, onOpenChange }: ProductEditModalProps) {
  const { toast } = useToast();
  const { data: categories = [] } = useCategories();
  const createCategory = useCreateCategory();
  const updateProduct = useUpdateProduct();
  const queryClient = useQueryClient();

  // Fetch product using MySQL hook
  const { data: product, isLoading } = useProductById(productId);

  const [isSaving, setIsSaving] = useState(false);
  const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [formData, setFormData] = useState<ProductFormData>({
    code: '',
    name: '',
    category_id: '',
    brand: '',
    sale_price_before_tax: 0,
    vat_sale: 10,
    sale_price_after_tax: 0,
    unit: 'cái',
    notes: '',
    status: 'active',
  });

  // Load product data into form when product is fetched
  useEffect(() => {
    if (product && open) {
      // Calculate price before tax from sale_price_default
      // Backend may return salePrice or sale_price_default depending on endpoint
      const productData = product as any;
      const salePrice = product.sale_price_default || productData.salePrice || 0;
      const salePriceBeforeTax = Math.round(salePrice / 1.1);

      setFormData({
        code: product.code || '',
        name: product.name || '',
        category_id: product.category_id || productData.groupId || '',
        brand: '',
        sale_price_before_tax: salePriceBeforeTax || 0,
        vat_sale: 10,
        sale_price_after_tax: salePrice || 0,
        unit: product.unit || 'cái',
        notes: product.description || '',
        status: (product.status as 'active' | 'inactive') || 'active',
      });
    }
  }, [product, open]);

  // Auto-calculate sale price after tax
  useEffect(() => {
    const afterTax = formData.sale_price_before_tax * (1 + formData.vat_sale / 100);
    setFormData((prev) => ({ ...prev, sale_price_after_tax: Math.round(afterTax) }));
  }, [formData.sale_price_before_tax, formData.vat_sale]);

  const handleChange = (field: keyof ProductFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      toast({ title: 'Lỗi', description: 'Vui lòng nhập tên nhóm hàng', variant: 'destructive' });
      return;
    }
    try {
      const result = await createCategory.mutateAsync({ name: newCategoryName });
      setFormData((prev) => ({ ...prev, category_id: result.id }));
      setNewCategoryName('');
      setIsCreateCategoryOpen(false);
      toast({ title: 'Thành công', description: 'Đã tạo nhóm hàng mới' });
    } catch (error) {
      toast({ title: 'Lỗi', description: 'Không thể tạo nhóm hàng', variant: 'destructive' });
    }
  };

  const handleSave = async () => {
    // Validation
    if (!formData.name.trim()) {
      toast({ title: 'Lỗi', description: 'Vui lòng nhập tên hàng hóa', variant: 'destructive' });
      return;
    }
    if (!formData.category_id) {
      toast({ title: 'Lỗi', description: 'Vui lòng chọn nhóm hàng', variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    try {
      await updateProduct.mutateAsync({
        id: productId,
        name: formData.name,
        category_id: formData.category_id || null,
        sale_price_default: formData.sale_price_after_tax,
        unit: formData.unit,
        description: formData.notes || null,
        status: formData.status,
      });

      toast({ title: 'Thành công', description: 'Đã cập nhật hàng hóa' });

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['products', productId] });
      queryClient.invalidateQueries({ queryKey: ['products'] });

      onOpenChange(false);
    } catch (error: any) {
      console.error('Error updating product:', error);
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể cập nhật hàng hóa',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Sửa hàng hóa</DialogTitle>
          </DialogHeader>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">Đang tải...</p>
            </div>
          ) : (
            <Tabs defaultValue="info" className="space-y-6">
              <TabsList>
                <TabsTrigger value="info">Thông tin</TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-6">
                {/* Basic Info */}
                <div className="bg-card rounded-lg border p-6 space-y-4">
                  <h3 className="font-semibold text-lg">Thông tin cơ bản</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>
                        Mã hàng hóa <span className="text-destructive">*</span>
                      </Label>
                      <Input value={formData.code} disabled className="bg-muted" />
                      <p className="text-xs text-muted-foreground">Mã không thể thay đổi</p>
                    </div>
                    <div className="space-y-2">
                      <Label>
                        Tên hàng hóa <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        placeholder="Nhập tên hàng hóa"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>
                          Nhóm hàng <span className="text-destructive">*</span>
                        </Label>
                        <a
                          className="text-sm text-primary hover:underline cursor-pointer"
                          onClick={() => setIsCreateCategoryOpen(true)}
                        >
                          Tạo mới
                        </a>
                      </div>
                      <Select
                        value={formData.category_id}
                        onValueChange={(v) => handleChange('category_id', v)}
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
                    <div className="space-y-2">
                      <Label>Đơn vị tính</Label>
                      <Select value={formData.unit} onValueChange={(v) => handleChange('unit', v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cái">Cái</SelectItem>
                          <SelectItem value="chiếc">Chiếc</SelectItem>
                          <SelectItem value="hộp">Hộp</SelectItem>
                          <SelectItem value="kg">Kg</SelectItem>
                          <SelectItem value="lít">Lít</SelectItem>
                          <SelectItem value="bộ">Bộ</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Trạng thái</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(v: 'active' | 'inactive') => handleChange('status', v)}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Đang kinh doanh</SelectItem>
                        <SelectItem value="inactive">Ngừng kinh doanh</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Pricing */}
                <div className="bg-card rounded-lg border p-6 space-y-4">
                  <h3 className="font-semibold text-lg">Giá cả</h3>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Giá bán (trước thuế)</Label>
                      <Input
                        type="number"
                        value={formData.sale_price_before_tax}
                        onChange={(e) =>
                          handleChange('sale_price_before_tax', parseFloat(e.target.value) || 0)
                        }
                        min={0}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>VAT bán (%)</Label>
                      <Input
                        type="number"
                        value={formData.vat_sale}
                        onChange={(e) => handleChange('vat_sale', parseFloat(e.target.value) || 0)}
                        min={0}
                        max={100}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Giá bán (sau thuế)</Label>
                      <Input
                        type="number"
                        value={formData.sale_price_after_tax}
                        readOnly
                        className="bg-muted"
                      />
                      <p className="text-xs text-muted-foreground">= Giá trước thuế × (1 + VAT%)</p>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div className="bg-card rounded-lg border p-6 space-y-4">
                  <h3 className="font-semibold text-lg">Ghi chú</h3>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    placeholder="Nhập ghi chú về sản phẩm..."
                    rows={4}
                  />
                </div>
              </TabsContent>
            </Tabs>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
              <X className="w-4 h-4 mr-2" />
              Hủy
            </Button>
            <Button onClick={handleSave} disabled={isSaving || isLoading}>
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Đang lưu...' : 'Lưu'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Category Dialog */}
      <Dialog open={isCreateCategoryOpen} onOpenChange={setIsCreateCategoryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tạo nhóm hàng mới</DialogTitle>
            <DialogDescription>Thêm nhóm hàng để phân loại sản phẩm</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tên nhóm hàng</Label>
              <Input
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Nhập tên nhóm hàng"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateCategory();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateCategoryOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleCreateCategory} disabled={createCategory.isPending}>
              Tạo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
