# Changelog

Tất cả thay đổi quan trọng của project được ghi lại tại đây.

## [2.0.0] - 2026-01-22

### ✨ Features Mới

#### Product Management
- **Modal Edit** - Chỉnh sửa sản phẩm qua modal overlay thay vì chuyển trang
  - Form edit đầy đủ với tất cả fields
  - Auto-calculation cho giá sau thuế
  - Tự động refresh data sau khi lưu
  - UX giống KiotViet - modal "emerge" trên detail page
  
- **Create Category in Modal** - Tạo nhóm hàng mới ngay trong modal edit
  - Link "Tạo mới" bên cạnh dropdown Nhóm hàng
  - Nested dialog cho create category
  - Auto-select category mới tạo
  - Hỗ trợ Enter key để tạo nhanh

- **Cascade Delete** - Xóa sản phẩm với tất cả dữ liệu liên quan
  - Tự động xóa: inventory_transactions, purchase_order_items, sales_invoice_items
  - Warning dialog rõ ràng về hậu quả
  - Console logging chi tiết để debug
  - Không còn foreign key constraint errors

#### Import Management  
- **Delete All Import Types** - Xóa phiếu nhập với mọi trạng thái
  - Trước: chỉ draft mới xóa được
  - Sau: draft, completed, cancelled đều xóa được
  - Fixed query cache invalidation
  - Đúng table name: `purchase_orders` thay vì `purchase_receipts`
  - Đúng query key: `purchase_orders` thay vì `purchase-orders`

### 🐛 Bug Fixes

- **Query Cache Issues**
  - Fixed import list không refresh sau delete
  - Sửa query key từ `purchase-orders` → `purchase_orders`
  - Thêm `queryClient.invalidateQueries` vào tất cả delete handlers
  
- **Delete Errors** 
  - Sửa cascade delete cho products
  - Xóa đúng thứ tự: transactions → order items → sales items → product
  - Handle missing tables gracefully với try-catch

- **TypeScript Errors**
  - Fixed type errors cho product status field
  - Proper type casting: `(data.status as 'active' | 'inactive')`
  - Removed references đến tables không tồn tại

### 🔧 Improvements

- **Better UX**
  - Loading states rõ ràng (Đang xóa..., Đang lưu...)
  - Toast notifications informative
  - Warning icons và text nổi bật
  - Confirmation dialogs với product/import names

- **Code Quality**
  - Console logging để debug
  - Error messages chi tiết
  - Comments trong code giải thích logic
  - Consistent naming conventions

### 📁 Files Changed

#### Created
- `src/pages/products/ProductEditModal.tsx` - Modal component mới

#### Modified  
- `src/pages/products/ProductDetail.tsx` - Thêm delete button, integrate modal
- `src/pages/imports/ImportDetail.tsx` - Delete functionality cho imports
- `README.md` - Cập nhật documentation đầy đủ

### 🗄️ Database Changes

Không có migration mới - tất cả thay đổi đều ở application layer.

---

## [1.0.0] - 2026-01-21

### Initial Release

- ✅ Product CRUD với auto-code generation
- ✅ Category management
- ✅ Import/Purchase order management  
- ✅ Customer & Supplier management
- ✅ Sales invoice system
- ✅ Inventory tracking
- ✅ Dashboard & reports
- ✅ User authentication & authorization
- ✅ Supabase integration
- ✅ shadcn/ui components
- ✅ Responsive design

---

## Ghi chú Format

Format version:
- **Major.Minor.Patch** (Semantic Versioning)
- Major: Breaking changes
- Minor: New features (backward compatible)
- Patch: Bug fixes

Loại thay đổi:
- ✨ Features - Tính năng mới
- 🐛 Bug Fixes - Sửa lỗi
- 🔧 Improvements - Cải thiện
- 📝 Documentation - Tài liệu
- 🗄️ Database - Thay đổi database
- 🔐 Security - Bảo mật
- ⚡ Performance - Hiệu suất
- 🎨 UI/UX - Giao diện người dùng
