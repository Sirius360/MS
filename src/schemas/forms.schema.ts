/**
 * Zod validation schemas for product forms
 * Ensures data integrity before submitting to backend
 */

import { z } from 'zod';

/**
 * Product form schema with validation rules
 */
export const productFormSchema = z
  .object({
    sku: z
      .string()
      .min(1, 'Mã sản phẩm là bắt buộc')
      .max(50, 'Mã sản phẩm tối đa 50 ký tự')
      .regex(/^[A-Z0-9-_]+$/i, 'Mã sản phẩm chỉ chứa chữ, số, gạch ngang và gạch dưới'),

    name: z
      .string()
      .min(1, 'Tên sản phẩm là bắt buộc')
      .max(255, 'Tên sản phẩm tối đa 255 ký tự'),

    type: z.enum(['product', 'service'], {
      errorMap: () => ({ message: 'Loại sản phẩm không hợp lệ' }),
    }).default('product'),

    groupId: z.string().uuid('ID nhóm hàng không hợp lệ').nullable().optional(),

    brandId: z.string().uuid('ID thương hiệu không hợp lệ').nullable().optional(),

    costPrice: z.coerce
      .number({
        required_error: 'Giá vốn là bắt buộc',
        invalid_type_error: 'Giá vốn phải là số',
      })
      .nonnegative('Giá vốn phải lớn hơn hoặc bằng 0')
      .default(0),

    salePrice: z.coerce
      .number({
        required_error: 'Giá bán là bắt buộc',
        invalid_type_error: 'Giá bán phải là số',
      })
      .nonnegative('Giá bán phải lớn hơn hoặc bằng 0')
      .default(0),

    salePriceBeforeTax: z.coerce
      .number()
      .nonnegative('Giá chưa VAT phải lớn hơn hoặc bằng 0')
      .nullable()
      .optional(),

    vatImport: z.coerce
      .number()
      .min(0, 'VAT nhập phải lớn hơn hoặc bằng 0')
      .max(100, 'VAT nhập không thể lớn hơn 100%')
      .default(0),

    vatSale: z.coerce
      .number()
      .min(0, 'VAT bán phải lớn hơn hoặc bằng 0')
      .max(100, 'VAT bán không thể lớn hơn 100%')
      .default(0),

    stockQty: z.coerce
      .number()
      .int('Tồn kho phải là số nguyên')
      .nonnegative('Tồn kho phải lớn hơn hoặc bằng 0')
      .default(0),

    minStock: z.coerce
      .number()
      .int('Tồn kho tối thiểu phải là số nguyên')
      .nonnegative('Tồn kho tối thiểu phải lớn hơn hoặc bằng 0')
      .default(0),

    unit: z
      .string()
      .min(1, 'Đơn vị tính là bắt buộc')
      .max(20, 'Đơn vị tính tối đa 20 ký tự')
      .default('cái'),

    status: z
      .enum(['active', 'inactive', 'discontinued'], {
        errorMap: () => ({ message: 'Trạng thái không hợp lệ' }),
      })
      .default('active'),

    imageUrl: z.string().url('URL hình ảnh không hợp lệ').nullable().optional(),

    images: z.array(z.string().url('URL hình ảnh không hợp lệ')).optional(),

    notes: z.string().max(1000, 'Ghi chú tối đa 1000 ký tự').nullable().optional(),

    description: z
      .string()
      .max(2000, 'Mô tả tối đa 2000 ký tự')
      .nullable()
      .optional(),

    warranty: z
      .string()
      .max(500, 'Thông tin bảo hành tối đa 500 ký tự')
      .nullable()
      .optional(),

    directSale: z.boolean().default(false),

    loyaltyPoints: z.coerce
      .number()
      .int('Điểm thưởng phải là số nguyên')
      .nonnegative('Điểm thưởng phải lớn hơn hoặc bằng 0')
      .default(0),
  })
  .refine((data) => data.salePrice >= data.costPrice, {
    message: 'Giá bán phải lớn hơn hoặc bằng giá vốn',
    path: ['salePrice'],
  });

/**
 * TypeScript type inferred from schema
 */
export type ProductFormData = z.infer<typeof productFormSchema>;

/**
 * Customer form schema
 */
export const customerFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Tên khách hàng là bắt buộc')
    .max(255, 'Tên khách hàng tối đa 255 ký tự'),

  phone: z
    .string()
    .regex(/^(\+84|0)[0-9]{9,10}$/, 'Số điện thoại không hợp lệ')
    .nullable()
    .optional()
    .or(z.literal('')),

  email: z
    .string()
    .email('Email không hợp lệ')
    .nullable()
    .optional()
    .or(z.literal('')),

  address: z
    .string()
    .max(500, 'Địa chỉ tối đa 500 ký tự')
    .nullable()
    .optional(),

  notes: z
    .string()
    .max(1000, 'Ghi chú tối đa 1000 ký tự')
    .nullable()
    .optional(),
});

export type CustomerFormData = z.infer<typeof customerFormSchema>;

/**
 * Supplier form schema
 */
export const supplierFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Tên nhà cung cấp là bắt buộc')
    .max(255, 'Tên nhà cung cấp tối đa 255 ký tự'),

  phone: z
    .string()
    .regex(/^(\+84|0)[0-9]{9,10}$/, 'Số điện thoại không hợp lệ')
    .nullable()
    .optional()
    .or(z.literal('')),

  email: z
    .string()
    .email('Email không hợp lệ')
    .nullable()
    .optional()
    .or(z.literal('')),

  address: z
    .string()
    .max(500, 'Địa chỉ tối đa 500 ký tự')
    .nullable()
    .optional(),

  notes: z
    .string()
    .max(1000, 'Ghi chú tối đa 1000 ký tự')
    .nullable()
    .optional(),
});

export type SupplierFormData = z.infer<typeof supplierFormSchema>;

/**
 * Product Group / Category form schema
 */
export const productGroupFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Tên nhóm hàng là bắt buộc')
    .max(255, 'Tên nhóm hàng tối đa 255 ký tự'),

  minPrice: z.coerce
    .number()
    .nonnegative('Giá tối thiểu phải lớn hơn hoặc bằng 0')
    .nullable()
    .optional(),

  maxPrice: z.coerce
    .number()
    .nonnegative('Giá tối đa phải lớn hơn hoặc bằng 0')
    .nullable()
    .optional(),

  description: z
    .string()
    .max(1000, 'Mô tả tối đa 1000 ký tự')
    .nullable()
    .optional(),

  status: z
    .enum(['active', 'inactive'], {
      errorMap: () => ({ message: 'Trạng thái không hợp lệ' }),
    })
    .default('active'),
}).refine(
  (data) => {
    if (data.minPrice && data.maxPrice) {
      return data.maxPrice >= data.minPrice;
    }
    return true;
  },
  {
    message: 'Giá tối đa phải lớn hơn hoặc bằng giá tối thiểu',
    path: ['maxPrice'],
  }
);

export type ProductGroupFormData = z.infer<typeof productGroupFormSchema>;
