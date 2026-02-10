import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Save, X, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSuppliers } from '@/hooks/useSuppliers';
import { formatCurrency } from '@/lib/formatters';
import { usePurchaseOrderWithItems, useUpdatePurchaseReceipt } from '@/hooks/usePurchaseOrders';
import { useQueryClient } from '@tanstack/react-query';

interface EditImportModalProps {
  importId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ImportItem {
  id?: string;
  product_id: string;
  product_name?: string;
  product_code?: string;
  unit?: string;
  quantity: number;
  unit_price: number;
  discount: number;
}

interface ImportFormData {
  code: string;
  supplier_id: string | null;
  discount_type: 'amount' | 'percent';
  discount_value: number;
  other_fee: number;
  note: string;
  items: ImportItem[];
}

export function EditImportModal({ importId, open, onOpenChange }: EditImportModalProps) {
  const { toast } = useToast();
  const { data: suppliers = [] } = useSuppliers();
  const { data: order } = usePurchaseOrderWithItems(importId);
  const updatePurchase = useUpdatePurchaseReceipt();
  const queryClient = useQueryClient();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<ImportFormData>({
    code: '',
    supplier_id: null,
    discount_type: 'amount',
    discount_value: 0,
    other_fee: 0,
    note: '',
    items: [],
  });

  // Load import data when modal opens
  useEffect(() => {
    if (open && order) {
      loadImportData();
    }
  }, [open, order]);

  const loadImportData = async () => {
    if (!order) return;

    setIsLoading(true);
    try {
      setFormData({
        code: order.code,
        supplier_id: order.supplier_id,
        discount_type: (order.discount_type as 'amount' | 'percent') || 'amount',
        discount_value: order.discount_value || 0,
        other_fee: order.other_fee || 0,
        note: order.note || '',
        items: order.items.map((item) => ({
          id: item.id,
          product_id: item.product_id,
          product_name: item.product?.name,
          product_code: item.product?.code,
          unit: item.product?.unit,
          quantity: item.quantity,
          unit_price: item.unit_price,
          discount: item.discount || 0,
        })),
      });
    } catch (error) {
      console.error('Error loading import:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải thông tin phiếu nhập',
        variant: 'destructive',
      });
      onOpenChange(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof ImportFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateItem = (index: number, field: keyof ImportItem, value: number) => {
    setFormData((prev) => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };
      return { ...prev, items: newItems };
    });
  };

  const removeItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    // Validation
    if (formData.items.length === 0) {
      toast({
        title: 'Lỗi',
        description: 'Phiếu nhập phải có ít nhất 1 sản phẩm',
        variant: 'destructive',
      });
      return;
    }

    for (const item of formData.items) {
      if (item.quantity <= 0) {
        toast({ title: 'Lỗi', description: 'Số lượng phải lớn hơn 0', variant: 'destructive' });
        return;
      }
      if (item.unit_price < 0) {
        toast({ title: 'Lỗi', description: 'Đơn giá không được âm', variant: 'destructive' });
        return;
      }
    }

    setIsSaving(true);
    try {
      // Use MySQL API hook to update purchase receipt
      await updatePurchase.mutateAsync({
        id: importId,
        data: {
          supplier_id: formData.supplier_id,
          items: formData.items.map((item) => ({
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            discount: item.discount || 0,
          })),
          discount_type: formData.discount_type,
          discount_value: formData.discount_value,
          other_fee: formData.other_fee,
          note: formData.note,
        },
      });

      toast({
        title: 'Thành công',
        description: 'Đã cập nhật thông tin phiếu nhập',
      });

      onOpenChange(false);
    } catch (error: any) {
      console.error('Error updating import:', error);
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể cập nhật phiếu nhập',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const totalAmount = formData.items.reduce(
    (sum, item) => sum + (item.quantity * item.unit_price - item.discount),
    0
  );

  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa phiếu nhập</DialogTitle>
          <DialogDescription>Cập nhật thông tin phiếu nhập {formData.code}</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground">Đang tải...</div>
        ) : (
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Mã phiếu nhập</Label>
                <Input value={formData.code} disabled className="bg-muted" />
              </div>
              <div>
                <Label>Nhà cung cấp</Label>
                <Select
                  value={formData.supplier_id || ''}
                  onValueChange={(value) => handleChange('supplier_id', value || null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn nhà cung cấp" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.code} - {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Items Table */}
            <div>
              <Label className="mb-2 block">Danh sách sản phẩm</Label>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">STT</TableHead>
                      <TableHead>Mã hàng</TableHead>
                      <TableHead>Tên hàng</TableHead>
                      <TableHead className="w-24">Số lượng</TableHead>
                      <TableHead className="w-32">Đơn giá</TableHead>
                      <TableHead className="w-28">Giảm giá</TableHead>
                      <TableHead className="w-32">Thành tiền</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {formData.items.map((item, index) => {
                      const amount = item.quantity * item.unit_price - item.discount;
                      return (
                        <TableRow key={index}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell className="font-mono text-sm">{item.product_code}</TableCell>
                          <TableCell>{item.product_name}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) =>
                                updateItem(
                                  index,
                                  'quantity',
                                  Math.max(1, parseInt(e.target.value) || 1)
                                )
                              }
                              min={1}
                              className="w-20"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={item.unit_price}
                              onChange={(e) =>
                                updateItem(
                                  index,
                                  'unit_price',
                                  Math.max(0, parseFloat(e.target.value) || 0)
                                )
                              }
                              min={0}
                              className="w-28"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={item.discount}
                              onChange={(e) =>
                                updateItem(
                                  index,
                                  'discount',
                                  Math.max(0, parseFloat(e.target.value) || 0)
                                )
                              }
                              min={0}
                              className="w-24"
                            />
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(amount)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeItem(index)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {formData.items.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          Chưa có sản phẩm
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Pricing Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Loại giảm giá</Label>
                <Select
                  value={formData.discount_type}
                  onValueChange={(v: 'amount' | 'percent') => handleChange('discount_type', v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="amount">Tiền (VNĐ)</SelectItem>
                    <SelectItem value="percent">Phần trăm (%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Giá trị giảm giá</Label>
                <Input
                  type="number"
                  value={formData.discount_value}
                  onChange={(e) =>
                    handleChange('discount_value', Math.max(0, parseFloat(e.target.value) || 0))
                  }
                  min={0}
                />
              </div>
              <div>
                <Label>Chi phí khác</Label>
                <Input
                  type="number"
                  value={formData.other_fee}
                  onChange={(e) =>
                    handleChange('other_fee', Math.max(0, parseFloat(e.target.value) || 0))
                  }
                  min={0}
                />
              </div>
            </div>

            {/* Note */}
            <div>
              <Label>Ghi chú</Label>
              <Textarea
                value={formData.note}
                onChange={(e) => handleChange('note', e.target.value)}
                placeholder="Nhập ghi chú..."
                rows={3}
              />
            </div>

            {/* Summary */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tổng tiền hàng:</span>
                <span className="font-medium">{formatCurrency(totalAmount)}</span>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            <X className="w-4 h-4 mr-2" />
            Hủy
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
