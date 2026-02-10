/**
 * Invoice Items Table Component
 * Cart table displaying all products in the invoice
 */

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2 } from 'lucide-react';
import type { SaleItem } from '@/hooks/useInvoiceState';
import { formatCurrency } from '@/lib/formatters';

interface InvoiceItemsTableProps {
  items: SaleItem[];
  onUpdateItem: (index: number, field: keyof SaleItem, value: number | string) => void;
  onRemoveItem: (index: number) => void;
}

export function InvoiceItemsTable({
  items,
  onUpdateItem,
  onRemoveItem,
}: InvoiceItemsTableProps) {
  if (items.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <div className="text-center space-y-2">
          <p className="text-lg font-medium">Chưa có sản phẩm nào</p>
          <p className="text-sm">Nhấn F3 để tìm và thêm sản phẩm</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      <Table>
        <TableHeader className="sticky top-0 bg-card/95 backdrop-blur border-b z-10">
          <TableRow>
            <TableHead className="w-12">#</TableHead>
            <TableHead className="w-32">Mã SP</TableHead>
            <TableHead className="min-w-[200px]">Tên sản phẩm</TableHead>
            <TableHead className="w-24 text-right">Đơn giá</TableHead>
            <TableHead className="w-24 text-right">SL</TableHead>
            <TableHead className="w-24 text-right">Giảm giá</TableHead>
            <TableHead className="w-32 text-right">Thành tiền</TableHead>
            <TableHead className="w-20"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item, index) => (
            <TableRow key={item.product_id}>
              {/* Index */}
              <TableCell className="text-muted-foreground">
                {index + 1}
              </TableCell>

              {/* Product Code */}
              <TableCell className="font-mono text-sm">
                {item.product_code}
              </TableCell>

              {/* Product Name */}
              <TableCell>
                <div className="space-y-1">
                  <div className="font-medium">{item.product_name}</div>
                  {item.note && (
                    <div className="text-xs text-muted-foreground">
                      Ghi chú: {item.note}
                    </div>
                  )}
                </div>
              </TableCell>

              {/* Unit Price */}
              <TableCell className="text-right">
                <Input
                  type="number"
                  value={item.sale_price}
                  onChange={(e) =>
                    onUpdateItem(index, 'sale_price', Number(e.target.value))
                  }
                  className="w-24 text-right"
                  min={0}
                />
              </TableCell>

              {/* Quantity */}
              <TableCell className="text-right">
                <Input
                  type="number"
                  value={item.quantity}
                  onChange={(e) =>
                    onUpdateItem(index, 'quantity', Number(e.target.value))
                  }
                  className="w-20 text-right"
                  min={1}
                  max={item.max_qty}
                />
              </TableCell>

              {/* Discount */}
              <TableCell className="text-right">
                <Input
                  type="number"
                  value={item.discount}
                  onChange={(e) =>
                    onUpdateItem(index, 'discount', Number(e.target.value))
                  }
                  className="w-24 text-right"
                  min={0}
                />
              </TableCell>

              {/* Total Price */}
              <TableCell className="text-right font-semibold">
                {formatCurrency(item.total_price)}
              </TableCell>

              {/* Actions */}
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemoveItem(index)}
                  className="hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
