import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowLeft, Edit, Package, Trash2 } from 'lucide-react';
import { ProductEditModal } from './ProductEditModal';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/apiClient';
import { formatCurrency, formatDateTime } from '@/lib/formatters';
import { useToast } from '@/hooks/use-toast';
import { useProductById } from '@/hooks/useProducts';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch product using MySQL hook
  const { data: product, isLoading: isLoadingProduct } = useProductById(id!);

  // Fetch stock ledger (inventory transactions) from API
  const { data: stockLedger = [], isLoading: isLoadingLedger } = useQuery({
    queryKey: ['stock_ledger', id],
    queryFn: async () => {
      if (!id) return [];
      const response = await api.get(`/products/${id}/transactions`);
      return response.data;
    },
    enabled: !!id,
  });

  if (isLoadingProduct) {
    return (
      <AppLayout title="Chi tiết hàng hóa">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      </AppLayout>
    );
  }

  if (!product) {
    return (
      <AppLayout title="Chi tiết hàng hóa">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <Package className="w-16 h-16 text-muted-foreground/30" />
          <p className="text-muted-foreground">Không tìm thấy sản phẩm</p>
          <Button onClick={() => navigate('/products')}>Quay lại</Button>
        </div>
      </AppLayout>
    );
  }

  const getTransactionType = (type: string) => {
    switch (type) {
      case 'IN':
        return { label: 'Nhập kho', color: 'bg-success/10 text-success' };
      case 'OUT':
        return { label: 'Xuất kho', color: 'bg-destructive/10 text-destructive' };
      case 'ADJUST':
        return { label: 'Điều chỉnh', color: 'bg-warning/10 text-warning' };
      case 'RETURN':
        return { label: 'Trả hàng', color: 'bg-primary/10 text-primary' };
      default:
        return { label: type, color: 'bg-muted text-muted-foreground' };
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    setIsDeleting(true);
    try {
      // Call backend DELETE endpoint - backend should handle cascade delete
      await api.products.delete(id);

      toast({
        title: 'Thành công',
        description: 'Đã xóa sản phẩm và tất cả dữ liệu liên quan',
      });

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['products'] });

      navigate('/products');
    } catch (error: any) {
      console.error('Delete failed:', error);
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể xóa sản phẩm',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <AppLayout title={product.name}>
      <div className="animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/products')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{product.name}</h1>
              <p className="text-sm text-muted-foreground font-mono">{product.code}</p>
            </div>
            <Badge
              variant={product.status === 'active' ? 'default' : 'secondary'}
              className={
                product.status === 'active' ? 'bg-success/10 text-success border-success/20' : ''
              }
            >
              {product.status === 'active' ? 'Đang kinh doanh' : 'Ngừng kinh doanh'}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setIsEditModalOpen(true)}>
              <Edit className="w-4 h-4 mr-2" />
              Sửa
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Xóa
            </Button>
          </div>
        </div>

        {/* General Info */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-card rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Mã hàng</p>
            <p className="font-mono font-semibold text-lg">{product.code}</p>
          </div>
          <div className="bg-card rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Nhóm hàng</p>
            <p className="font-semibold text-lg">{(product.category as any)?.name || '-'}</p>
          </div>
          <div className="bg-card rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Giá bán</p>
            <p className="font-semibold text-lg text-primary">
              {formatCurrency(product.sale_price_default)}
            </p>
          </div>
          <div className="bg-card rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Tồn kho</p>
            <p className="font-semibold text-lg">{product.stock_qty || 0}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-card rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Giá vốn bình quân</p>
            <p className="font-semibold text-lg">{formatCurrency(product.average_cost || 0)}</p>
          </div>
          <div className="bg-card rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Đơn vị tính</p>
            <p className="font-semibold text-lg">{product.unit}</p>
          </div>
          <div className="bg-card rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Theo dõi tồn kho</p>
            <p className="font-semibold text-lg">{product.track_inventory ? 'Có' : 'Không'}</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="ledger" className="space-y-4">
          <TabsList>
            <TabsTrigger value="ledger">Sổ kho</TabsTrigger>
          </TabsList>

          <TabsContent value="ledger">
            <div className="rounded-lg border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Chứng từ</TableHead>
                    <TableHead>Thời gian</TableHead>
                    <TableHead>Loại giao dịch</TableHead>
                    <TableHead>Đối tác</TableHead>
                    <TableHead className="text-right">Giá</TableHead>
                    <TableHead className="text-right">Số lượng</TableHead>
                    <TableHead className="text-right">Tồn cuối</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingLedger ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        Đang tải...
                      </TableCell>
                    </TableRow>
                  ) : stockLedger.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Chưa có giao dịch nào
                      </TableCell>
                    </TableRow>
                  ) : (
                    stockLedger.map((tx: any) => {
                      const txType = getTransactionType(tx.transaction_type);
                      return (
                        <TableRow key={tx.id}>
                          <TableCell className="font-mono text-sm">{tx.documentCode}</TableCell>
                          <TableCell>{formatDateTime(tx.created_at)}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={txType.color}>
                              {txType.label}
                            </Badge>
                          </TableCell>
                          <TableCell>{tx.partnerName}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(tx.unit_cost || 0)}
                          </TableCell>
                          <TableCell className="text-right">
                            <span className={tx.quantity > 0 ? 'text-success' : 'text-destructive'}>
                              {tx.quantity > 0 ? '+' : ''}
                              {tx.quantity}
                            </span>
                          </TableCell>
                          <TableCell className="text-right font-medium">{tx.endingStock}</TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Modal */}
      {id && (
        <ProductEditModal productId={id} open={isEditModalOpen} onOpenChange={setIsEditModalOpen} />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa sản phẩm</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa vĩnh viễn sản phẩm <strong>{product?.name}</strong>?
              <br />
              <br />
              <span className="text-warning">⚠️ Cảnh báo:</span> Hành động này sẽ xóa sản phẩm và
              TẤT CẢ các giao dịch liên quan (nhập hàng, bán hàng, tồn kho) và KHÔNG THỂ HOÀN TÁC.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? 'Đang xóa...' : 'Xóa'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
