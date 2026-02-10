/**
 * Product Form Component with Zod Validation
 * Uses React Hook Form + Zod for robust form validation
 */

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { productFormSchema, type ProductFormData } from '@/schemas/forms.schema';
import type { Product } from '@/lib/api';

interface ProductFormProps {
  defaultValues?: Partial<Product>;
  onSubmit: (data: ProductFormData) => void | Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function ProductForm({
  defaultValues,
  onSubmit,
  onCancel,
  isLoading = false,
}: ProductFormProps) {
  // Initialize form with Zod validation
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      sku: defaultValues?.sku || '',
      name: defaultValues?.name || '',
      type: (defaultValues?.type as 'product' | 'service') || 'product',
      groupId: defaultValues?.groupId || undefined,
      brandId: defaultValues?.brandId || undefined,
      costPrice: defaultValues?.costPrice || 0,
      salePrice: defaultValues?.salePrice || 0,
      salePriceBeforeTax: defaultValues?.salePriceBeforeTax || undefined,
      vatImport: defaultValues?.vatImport || 0,
      vatSale: defaultValues?.vatSale || 0,
      stockQty: defaultValues?.stockQty || 0,
      minStock: defaultValues?.minStock || 0,
      unit: defaultValues?.unit || 'cái',
      status: (defaultValues?.status as 'active' | 'inactive' | 'discontinued') || 'active',
      imageUrl: defaultValues?.imageUrl || undefined,
      images: defaultValues?.images || [],
      notes: defaultValues?.notes || undefined,
      description: defaultValues?.description || undefined,
      warranty: defaultValues?.warranty || undefined,
      directSale: defaultValues?.directSale || false,
      loyaltyPoints: defaultValues?.loyaltyPoints || 0,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Thông tin cơ bản</h3>
          
          <div className="grid grid-cols-2 gap-4">
            {/* SKU */}
            <FormField
              control={form.control}
              name="sku"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mã sản phẩm *</FormLabel>
                  <FormControl>
                    <Input placeholder="VD: SP001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Type */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Loại *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn loại" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="product">Sản phẩm</SelectItem>
                      <SelectItem value="service">Dịch vụ</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tên sản phẩm *</FormLabel>
                <FormControl>
                  <Input placeholder="Nhập tên sản phẩm" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Unit */}
          <FormField
            control={form.control}
            name="unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Đơn vị tính *</FormLabel>
                <FormControl>
                  <Input placeholder="VD: cái, bộ, kg" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Pricing */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Giá cả</h3>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Cost Price */}
            <FormField
              control={form.control}
              name="costPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Giá vốn *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>Giá nhập kho</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Sale Price */}
            <FormField
              control={form.control}
              name="salePrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Giá bán *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>Giá bán ra cho khách</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* VAT Import */}
            <FormField
              control={form.control}
              name="vatImport"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>VAT nhập (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* VAT Sale */}
            <FormField
              control={form.control}
              name="vatSale"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>VAT bán (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Inventory */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Tồn kho</h3>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Stock Quantity */}
            <FormField
              control={form.control}
              name="stockQty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Số lượng tồn *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Min Stock */}
            <FormField
              control={form.control}
              name="minStock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tồn kho tối thiểu</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>Cảnh báo khi tồn dưới mức này</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Additional Info */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Thông tin bổ sung</h3>
          
          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mô tả</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Mô tả chi tiết sản phẩm"
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Notes */}
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ghi chú</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Ghi chú nội bộ"
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Status */}
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Trạng thái *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="active">Đang kinh doanh</SelectItem>
                    <SelectItem value="inactive">Tạm ngưng</SelectItem>
                    <SelectItem value="discontinued">Ngưng kinh doanh</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              Hủy
            </Button>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Đang lưu...' : defaultValues ? 'Cập nhật' : 'Tạo mới'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
