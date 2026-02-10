import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable, Column } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  useSuppliers,
  useCreateSupplier,
  useUpdateSupplier,
  useDeleteSupplier,
} from '@/hooks/useSuppliers';

type Supplier = {
  id: string;
  code: string | null;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

export default function Suppliers() {
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [deletingSupplier, setDeletingSupplier] = useState<Supplier | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
  });

  // Use hooks for suppliers data and mutations
  const { data: suppliers, isLoading } = useSuppliers();
  const createSupplierMutation = useCreateSupplier();
  const updateSupplierMutation = useUpdateSupplier();
  const deleteSupplierMutation = useDeleteSupplier();

  const resetForm = () => {
    setFormData({ code: '', name: '', phone: '', email: '', address: '', notes: '' });
    setEditingSupplier(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      code: supplier.code || '',
      name: supplier.name,
      phone: supplier.phone || '',
      email: supplier.email || '',
      address: supplier.address || '',
      notes: supplier.notes || '',
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng nhập tên nhà cung cấp',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (editingSupplier) {
        await updateSupplierMutation.mutateAsync({
          id: editingSupplier.id,
          data: {
            code: formData.code || undefined,
            name: formData.name,
            phone: formData.phone || undefined,
            email: formData.email || undefined,
            address: formData.address || undefined,
          },
        });
        toast({ title: 'Thành công', description: 'Đã cập nhật nhà cung cấp' });
      } else {
        await createSupplierMutation.mutateAsync({
          code: formData.code || undefined,
          name: formData.name,
          phone: formData.phone || undefined,
          email: formData.email || undefined,
          address: formData.address || undefined,
          status: 'active',
        });
        toast({ title: 'Thành công', description: 'Đã thêm nhà cung cấp mới' });
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể lưu nhà cung cấp',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!deletingSupplier) return;
    try {
      await deleteSupplierMutation.mutateAsync(deletingSupplier.id);
      toast({ title: 'Thành công', description: 'Đã xóa nhà cung cấp' });
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể xóa nhà cung cấp',
        variant: 'destructive',
      });
    }
    setIsDeleteDialogOpen(false);
    setDeletingSupplier(null);
  };

  // Filter suppliers by search term
  const filteredSuppliers = (suppliers || []).filter((s) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      s.name.toLowerCase().includes(search) ||
      s.code?.toLowerCase().includes(search) ||
      s.phone?.toLowerCase().includes(search)
    );
  });

  const columns: Column<Supplier>[] = [
    {
      key: 'code',
      header: 'Mã NCC',
      render: (s) => (
        <Badge variant="outline" className="font-mono">
          {s.code || '-'}
        </Badge>
      ),
    },
    { key: 'name', header: 'Tên nhà cung cấp' },
    { key: 'phone', header: 'Số điện thoại' },
    { key: 'address', header: 'Địa chỉ' },
    {
      key: 'notes',
      header: 'Ghi chú',
      render: (s) => (
        <span className="text-muted-foreground truncate max-w-[200px] block">{s.notes || '-'}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Thao tác',
      render: (supplier) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => openEditDialog(supplier)}>
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setDeletingSupplier(supplier);
              setIsDeleteDialogOpen(true);
            }}
          >
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AppLayout title="Nhà cung cấp">
      <div className="animate-fade-in">
        <PageHeader
          title="Nhà cung cấp"
          description="Quản lý thông tin nhà cung cấp"
          actions={
            <Button onClick={openCreateDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Thêm NCC
            </Button>
          }
        />

        <DataTable
          data={filteredSuppliers}
          columns={columns}
          searchKey="name"
          searchPlaceholder="Tìm theo tên, mã NCC hoặc SĐT..."
          emptyMessage={isLoading ? 'Đang tải...' : 'Chưa có nhà cung cấp nào'}
        />
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingSupplier ? 'Chỉnh sửa nhà cung cấp' : 'Thêm nhà cung cấp mới'}
            </DialogTitle>
            <DialogDescription>Điền thông tin chi tiết nhà cung cấp</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="code">Mã nhà cung cấp</Label>
              <Input
                id="code"
                placeholder="NCC00001"
                value={formData.code}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))
                }
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground mt-1">Để trống để tự động sinh mã</p>
            </div>
            <div>
              <Label htmlFor="name">Tên nhà cung cấp *</Label>
              <Input
                id="name"
                placeholder="VD: Công ty ABC"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input
                id="phone"
                placeholder="VD: 0281234567"
                value={formData.phone}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="address">Địa chỉ</Label>
              <Input
                id="address"
                placeholder="VD: 123 Đường XYZ, Quận 1, TP.HCM"
                value={formData.address}
                onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="notes">Ghi chú</Label>
              <Textarea
                id="notes"
                placeholder="Ghi chú thêm..."
                value={formData.notes}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Hủy
            </Button>
            <Button
              onClick={handleSave}
              disabled={createSupplierMutation.isPending || updateSupplierMutation.isPending}
            >
              {editingSupplier ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Xác nhận xóa"
        description={`Bạn có chắc chắn muốn xóa nhà cung cấp "${deletingSupplier?.name}"?`}
        confirmText="Xóa"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </AppLayout>
  );
}
