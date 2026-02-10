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
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/apiClient';

type Customer = {
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

export default function Customers() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    phone: '',
    address: '',
    notes: '',
  });

  // Fetch customers from MySQL backend
  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const data = await api.customers.getAll();
      return data as Customer[];
    },
  });

  // Create customer
  const createCustomer = useMutation({
    mutationFn: async (customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) => {
      return await api.customers.create(customer);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });

  // Update customer
  const updateCustomer = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Customer>) => {
      return await api.customers.update(id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });

  // Delete customer
  const deleteCustomer = useMutation({
    mutationFn: async (id: string) => {
      await api.customers.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });

  const resetForm = () => {
    setFormData({ code: '', name: '', phone: '', address: '', notes: '' });
    setEditingCustomer(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      code: customer.code || '',
      name: customer.name,
      phone: customer.phone || '',
      address: customer.address || '',
      notes: customer.notes || '',
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng nhập tên khách hàng',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (editingCustomer) {
        await updateCustomer.mutateAsync({
          id: editingCustomer.id,
          code: formData.code || null,
          name: formData.name,
          phone: formData.phone || null,
          address: formData.address || null,
          notes: formData.notes || null,
        });
        toast({ title: 'Thành công', description: 'Đã cập nhật khách hàng' });
      } else {
        await createCustomer.mutateAsync({
          code: formData.code || null,
          name: formData.name,
          phone: formData.phone || null,
          address: formData.address || null,
          notes: formData.notes || null,
          email: null,
          status: 'active',
        });
        toast({ title: 'Thành công', description: 'Đã thêm khách hàng mới' });
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể lưu khách hàng',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!deletingCustomer) return;
    try {
      await deleteCustomer.mutateAsync(deletingCustomer.id);
      toast({ title: 'Thành công', description: 'Đã xóa khách hàng' });
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể xóa khách hàng',
        variant: 'destructive',
      });
    }
    setIsDeleteDialogOpen(false);
    setDeletingCustomer(null);
  };

  // Filter customers by search term
  const filteredCustomers = customers.filter((c) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      c.name.toLowerCase().includes(search) ||
      c.code?.toLowerCase().includes(search) ||
      c.phone?.toLowerCase().includes(search)
    );
  });

  const columns: Column<Customer>[] = [
    {
      key: 'code',
      header: 'Mã KH',
      render: (c) => (
        <Badge variant="outline" className="font-mono">
          {c.code || '-'}
        </Badge>
      ),
    },
    { key: 'name', header: 'Tên khách hàng' },
    { key: 'phone', header: 'Số điện thoại' },
    { key: 'address', header: 'Địa chỉ' },
    {
      key: 'notes',
      header: 'Ghi chú',
      render: (c) => (
        <span className="text-muted-foreground truncate max-w-[200px] block">{c.notes || '-'}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Thao tác',
      render: (customer) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => openEditDialog(customer)}>
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setDeletingCustomer(customer);
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
    <AppLayout title="Khách hàng">
      <div className="animate-fade-in">
        <PageHeader
          title="Khách hàng"
          description="Quản lý thông tin khách hàng"
          actions={
            <Button onClick={openCreateDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Thêm khách hàng
            </Button>
          }
        />

        <DataTable
          data={filteredCustomers}
          columns={columns}
          searchKey="name"
          searchPlaceholder="Tìm theo tên, mã KH hoặc SĐT..."
          emptyMessage={isLoading ? 'Đang tải...' : 'Chưa có khách hàng nào'}
        />
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCustomer ? 'Chỉnh sửa khách hàng' : 'Thêm khách hàng mới'}
            </DialogTitle>
            <DialogDescription>Điền thông tin chi tiết khách hàng</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="code">Mã khách hàng</Label>
              <Input
                id="code"
                placeholder="KH00001"
                value={formData.code}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))
                }
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground mt-1">Để trống để tự động sinh mã</p>
            </div>
            <div>
              <Label htmlFor="name">Tên khách hàng *</Label>
              <Input
                id="name"
                placeholder="VD: Nguyễn Văn A"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input
                id="phone"
                placeholder="VD: 0901234567"
                value={formData.phone}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="address">Địa chỉ</Label>
              <Input
                id="address"
                placeholder="VD: 123 Đường ABC, Quận 1, TP.HCM"
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
              disabled={createCustomer.isPending || updateCustomer.isPending}
            >
              {editingCustomer ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Xác nhận xóa"
        description={`Bạn có chắc chắn muốn xóa khách hàng "${deletingCustomer?.name}"?`}
        confirmText="Xóa"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </AppLayout>
  );
}
