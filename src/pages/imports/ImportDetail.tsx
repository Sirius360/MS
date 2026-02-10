import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { ArrowLeft, Printer, Package, CheckCircle, Trash2, Edit } from 'lucide-react';
import { usePurchaseOrderWithItems, useDeletePurchaseReceipt } from '@/hooks/usePurchaseOrders';
import { EditImportModal } from './EditImportModal';
import { formatCurrency, formatDateTime } from '@/lib/formatters';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

export default function ImportDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: order, isLoading, refetch } = usePurchaseOrderWithItems(id || '');
  const deleteMutation = useDeletePurchaseReceipt();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  // Note: Purchase receipts are automatically completed when created in MySQL
  const handleComplete = async () => {
    toast({
      title: 'Thông báo',
      description: 'Phiếu nhập đã được hoàn thành khi tạo',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-success/10 text-success border-success/20">Hoàn thành</Badge>;
      case 'draft':
        return <Badge variant="secondary">Nháp</Badge>;
      case 'cancelled':
        return (
          <Badge className="bg-destructive/10 text-destructive border-destructive/20">Đã hủy</Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    setIsDeleting(true);
    try {
      await deleteMutation.mutateAsync(id);

      toast({
        title: 'Thành công',
        description: 'Đã xóa phiếu nhập',
      });

      navigate('/imports');
    } catch (error) {
      console.error('Error deleting import:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa phiếu nhập.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  if (isLoading) {
    return (
      <AppLayout title="Chi tiết phiếu nhập">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      </AppLayout>
    );
  }

  if (!order) {
    return (
      <AppLayout title="Chi tiết phiếu nhập">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <Package className="w-16 h-16 text-muted-foreground/30" />
          <p className="text-muted-foreground">Không tìm thấy phiếu nhập</p>
          <Button onClick={() => navigate('/imports')}>Quay lại</Button>
        </div>
      </AppLayout>
    );
  }

  // Calculate items total
  const itemsTotal = (order.items || []).reduce(
    (sum, item) => sum + Number(item.total_amount || 0),
    0
  );

  return (
    <AppLayout title={order.code}>
      <div className="animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/imports')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{order.code}</h1>
              <p className="text-sm text-muted-foreground">Chi tiết phiếu nhập hàng</p>
            </div>
            {getStatusBadge(order.status)}
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
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              In
            </Button>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-card rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Mã phiếu</p>
            <p className="font-mono font-semibold text-lg">{order.code}</p>
          </div>
          <div className="bg-card rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Nhà cung cấp</p>
            <p className="font-semibold text-lg">{order.supplier_name || 'Khách lẻ'}</p>
            {order.supplier_code && (
              <p className="text-sm text-muted-foreground font-mono">{order.supplier_code}</p>
            )}
          </div>
          <div className="bg-card rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Thời gian nhập</p>
            <p className="font-semibold text-lg">{formatDateTime(order.created_at)}</p>
          </div>
          <div className="bg-card rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Tổng tiền hàng</p>
            <p className="font-semibold text-lg text-primary">{formatCurrency(itemsTotal)}</p>
          </div>
        </div>

        {/* Items Table */}
        <div className="bg-card rounded-lg border mb-6">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Danh sách hàng hóa</h3>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">STT</TableHead>
                <TableHead>Mã hàng</TableHead>
                <TableHead>Tên hàng</TableHead>
                <TableHead>ĐVT</TableHead>
                <TableHead className="text-right">Số lượng</TableHead>
                <TableHead className="text-right">Đơn giá</TableHead>
                <TableHead className="text-right">Giảm giá</TableHead>
                <TableHead className="text-right">Thành tiền</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(order.items || []).map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-mono text-sm">
                    {(item.product as any)?.code || '-'}
                  </TableCell>
                  <TableCell>{(item.product as any)?.name || '-'}</TableCell>
                  <TableCell>{(item.product as any)?.unit || '-'}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.unit_price)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.discount || 0)}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(item.total_amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Summary */}
        <div className="bg-card rounded-lg border p-4">
          <div className="max-w-sm ml-auto space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tổng tiền hàng</span>
              <span>{formatCurrency(itemsTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Giảm giá</span>
              <span>
                {order.discount_type === 'percent'
                  ? `${order.discount_value}%`
                  : formatCurrency(order.discount_value || 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">VAT nhập hàng</span>
              <span>{formatCurrency(0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Chi phí khác</span>
              <span>{formatCurrency(order.other_fee || 0)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t font-semibold text-lg">
              <span>Cần trả NCC</span>
              <span className="text-primary">{formatCurrency(order.total_amount)}</span>
            </div>
          </div>
          {order.note && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">Ghi chú:</p>
              <p>{order.note}</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa phiếu nhập</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa phiếu nhập <strong>{order?.code}</strong>?
              <br />
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Hủy bỏ</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? 'Đang xóa...' : 'Xóa phiếu'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Import Modal */}
      <EditImportModal
        importId={id || ''}
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
      />
    </AppLayout>
  );
}
