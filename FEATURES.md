# Tính Năng Hệ Thống

Danh sách đầy đủ các tính năng của Hệ Thống Quản Lý Bán Hàng.

## 📦 Quản Lý Sản Phẩm

### Danh sách sản phẩm
- ✅ Hiển thị danh sách sản phẩm với pagination
- ✅ Tìm kiếm theo tên, mã sản phẩm
- ✅ Lọc theo nhóm hàng
- ✅ Lọc theo trạng thái (Đang kinh doanh / Ngừng kinh doanh)
- ✅ Sắp xếp theo: tên, mã, giá, tồn kho
- ✅ Export danh sách ra Excel (coming soon)

### Chi tiết sản phẩm
- ✅ Xem thông tin đầy đủ
- ✅ Lịch sử nhập/xuất kho
- ✅ Thẻ kho (Stock Card)
- ✅ Thống kê bán hàng
- ✅ Badge trạng thái trực quan

### Tạo sản phẩm mới
- ✅ Auto-generate mã sản phẩm (PROD00001, PROD00002...)
- ✅ Chọn nhóm hàng từ dropdown
- ✅ Nhập thông tin cơ bản: tên, đơn vị tính
- ✅ Cài đặt giá: giá trước thuế, VAT%, giá sau thuế
- ✅ Auto-calculation giá sau thuế = giá trước thuế × (1 + VAT%)
- ✅ Ghi chú sản phẩm
- ✅ Validation đầy đủ với Zod

### 🆕 Chỉnh sửa sản phẩm (Modal Edit)
- ✅ **Modal overlay** - Form edit xuất hiện trên detail page
- ✅ **Không chuyển trang** - UX mượt mà như KiotViet
- ✅ **Full-screen modal** - Không gian làm việc thoải mái
- ✅ **Pre-fill data** - Tự động load dữ liệu hiện tại
- ✅ **Auto-refresh** - Trang detail tự động cập nhật sau khi lưu
  
**Các trường chỉnh sửa:**
- ✅ Tên sản phẩm
- ✅ Nhóm hàng (với nút "Tạo mới")
- ✅ Đơn vị tính  
- ✅ Giá bán (trước thuế, VAT, sau thuế)
- ✅ Ghi chú
- ✅ Trạng thái (Active/Inactive)
- ❌ Mã sản phẩm (read-only, không cho sửa)

### 🆕 Tạo Nhóm Hàng Nhanh (Quick Create Category)
- ✅ Link **"Tạo mới"** bên cạnh dropdown Nhóm hàng
- ✅ Nested dialog để tạo category mới
- ✅ Auto-select category vừa tạo
- ✅ Enter key để submit nhanh
- ✅ Không cần rời khỏi form edit
- ✅ Query invalidation tự động

### 🆕 Xóa Sản Phẩm (Cascade Delete)
- ✅ **Xóa vĩnh viễn** sản phẩm khỏi hệ thống
- ✅ **Auto-delete related records:**
  - inventory_transactions (giao dịch tồn kho)
  - purchase_order_items (chi tiết phiếu nhập)
  - sales_invoice_items (chi tiết hóa đơn bán)
- ✅ **Strong warning dialog:**
  - ⚠️ Icon cảnh báo
  - Hiện tên sản phẩm
  - Text: "TẤT CẢ giao dịch liên quan"
  - Text: "KHÔNG THỂ HOÀN TÁC"
- ✅ **Console logging** để debug
- ✅ **Error handling** chi tiết

---

## 📥 Quản Lý Nhập Hàng

### Danh sách phiếu nhập
- ✅ Hiển thị tất cả phiếu nhập
- ✅ Tìm kiếm theo mã phiếu
- ✅ Lọc nâng cao:
  - Mã phiếu nhập
  - Mã nhà cung cấp
  - Tên nhà cung cấp
  - Ghi chú
  - Từ ngày - Đến ngày
- ✅ Badge trạng thái: Nháp / Hoàn thành / Đã hủy
- ✅ Pagination

### Chi tiết phiếu nhập
- ✅ Thông tin phiếu: mã, NCC, thời gian, trạng thái
- ✅ Danh sách hàng hóa:
  - Mã hàng, tên hàng, ĐVT
  - Số lượng, đơn giá, giảm giá, thành tiền
- ✅ Tổng kết:
  - Tổng tiền hàng
  - Giảm giá (% hoặc số tiền)
  - VAT nhập hàng
  - Chi phí khác
  - **Cần trả NCC** (tổng cuối cùng)
- ✅ In phiếu nhập (Print)
- ✅ Hoàn thành phiếu (Draft → Completed)

### Tạo phiếu nhập mới
- ✅ Auto-generate mã phiếu (PN00001, PN00002...)
- ✅ Chọn nhà cung cấp
- ✅ Chọn thời gian nhập
- ✅ Thêm sản phẩm:
  - Tìm kiếm sản phẩm nhanh
  - Nhập số lượng, đơn giá
  - Giảm giá từng item
  - Tự động tính thành tiền
- ✅ Cài đặt giảm giá phiếu (% hoặc VND)
- ✅ VAT nhập hàng
- ✅ Chi phí khác (vận chuyển, bốc xếp...)
- ✅ Ghi chú
- ✅ Lưu nháp hoặc hoàn thành ngay

### 🆕 Xóa Phiếu Nhập
- ✅ **Xóa tất cả trạng thái** - Draft, Completed, Cancelled
- ✅ Confirmation dialog
- ✅ Hard delete từ database
- ✅ Query invalidation → list tự refresh
- ✅ Navigate về /imports sau xóa thành công

**Bugfix quan trọng:**
- ✅ Fixed table name: `purchase_orders` (không phải `purchase_receipts`)
- ✅ Fixed query key: `purchase_orders` (không phải `purchase-orders`)
- ✅ Cascade delete cho purchase_order_items

---

## 👥 Quản Lý Khách Hàng

### Danh sách khách hàng
- ✅ Tìm kiếm theo tên, số điện thoại, mã
- ✅ Lọc theo trạng thái
- ✅ Sắp xếp
- ✅ Pagination

### CRUD Khách hàng
- ✅ Tạo khách hàng mới
- ✅ Auto-generate mã (KH00001, KH00002...)
- ✅ Thông tin:
  - Họ tên
  - Số điện thoại
  - Email
  - Địa chỉ
  - Ghi chú
- ✅ Sửa thông tin khách hàng
- ✅ Xem chi tiết & lịch sử mua hàng
- ✅ Xóa khách hàng (với warning)

---

## 🏢 Quản Lý Nhà Cung Cấp

### Danh sách NCC
- ✅ Tìm kiếm theo tên, mã
- ✅ Lọc theo trạng thái
- ✅ Pagination

### CRUD Nhà cung cấp
- ✅ Tạo NCC mới
- ✅ Auto-generate mã (NCC00001, NCC00002...)
- ✅ Thông tin:
  - Tên công ty
  - Mã số thuế (optional)
  - Người liên hệ
  - Số điện thoại
  - Email
  - Địa chỉ
  - Ghi chú
- ✅ Sửa thông tin
- ✅ Xem chi tiết & lịch sử nhập hàng
- ✅ Xóa NCC

---

## 🛒 Quản Lý Bán Hàng

### Tạo hóa đơn
- ✅ Auto-generate mã hóa đơn
- ✅ Chọn khách hàng (hoặc khách lẻ)
- ✅ Tìm kiếm sản phẩm nhanh
- ✅ Thêm sản phẩm vào giỏ
- ✅ Điều chỉnh số lượng
- ✅ Giảm giá từng item
- ✅ Giảm giá hóa đơn
- ✅ Tính toán tự động
- ✅ Thanh toán
- ✅ In hóa đơn

### Danh sách hóa đơn
- ✅ Xem tất cả hóa đơn
- ✅ Tìm kiếm theo mã, khách hàng
- ✅ Lọc theo ngày, trạng thái
- ✅ Chi tiết hóa đơn

---

## 📊 Dashboard & Báo Cáo

### Dashboard
- ✅ Cards tổng quan:
  - Doanh thu hôm nay
  - Đơn hàng hôm nay
  - Sản phẩm bán chạy
  - Cảnh báo tồn kho thấp
- ✅ Biểu đồ doanh thu theo ngày
- ✅ Top sản phẩm bán chạy
- ✅ Hoạt động gần đây

### Báo cáo (Coming soon)
- ⏳ Báo cáo doanh thu
- ⏳ Báo cáo tồn kho
- ⏳ Báo cáo công nợ
- ⏳ Báo cáo lãi/lỗ

---

## 👤 Quản Lý Người Dùng

### Authentication
- ✅ Đăng nhập (username/email + password)
- ✅ Đăng xuất
- ✅ Session management
- ✅ Auto logout khi hết session

### User Management
- ✅ Xem profile
- ✅ Đổi mật khẩu
- ✅ Cập nhật thông tin cá nhân
- ✅ Avatar (coming soon)

### Phân quyền
- ✅ Role-based access control
- ✅ Admin - full access
- ✅ Staff - limited access
- ✅ Permissions per module

---

## 🎨 UI/UX Features

### Design System
- ✅ shadcn/ui components
- ✅ Tailwind CSS
- ✅ Custom color palette
- ✅ Dark mode ready
- ✅ Responsive design

### Components
- ✅ Data tables với sort, filter, pagination
- ✅ Forms với validation
- ✅ Modal dialogs
- ✅ Toast notifications
- ✅ Loading states
- ✅ Empty states
- ✅ Error states
- ✅ Badges & status indicators

### Interactions
- ✅ Hover effects
- ✅ Smooth transitions
- ✅ Keyboard shortcuts
- ✅ Accessibility (a11y)
- ✅ Mobile-friendly

---

## ⚡ Performance Features

### Optimization
- ✅ React Query caching
- ✅ Query invalidation strategy
- ✅ Lazy loading routes
- ✅ Code splitting
- ✅ Memoization
- ✅ Debounced search

### Data Loading
- ✅ Pagination
- ✅ Infinite scroll (where applicable)
- ✅ Optimistic updates
- ✅ Stale-while-revalidate
- ✅ Background refetch

---

## 🔐 Security Features

### Backend Security
- ✅ Row Level Security (RLS)
- ✅ JWT authentication
- ✅ API rate limiting
- ✅ SQL injection prevention
- ✅ XSS protection

### Frontend Security
- ✅ Input validation (Zod)
- ✅ Sanitization
- ✅ HTTPS only
- ✅ Environment variables
- ✅ Secure storage (httpOnly cookies)

---

## 🛠️ Developer Features

### DX (Developer Experience)
- ✅ TypeScript strict mode
- ✅ ESLint configuration
- ✅ Prettier formatting
- ✅ Hot module replacement
- ✅ Auto-imports
- ✅ Type-safe API calls

### Code Quality
- ✅ Components atomic design
- ✅ Custom hooks
- ✅ Reusable utilities
- ✅ Consistent naming
- ✅ Code comments
- ✅ Error boundaries

---

## 🔮 Upcoming Features

### Planned
- ⏳ Export/Import Excel
- ⏳ Print templates customization
- ⏳ Multi-store support
- ⏳ Warehouse management
- ⏳ Barcode scanning
- ⏳ Email notifications
- ⏳ SMS notifications
- ⏳ Mobile app

### Under Consideration
- 💭 Real-time collaboration
- 💭 Offline mode
- 💭 Advanced analytics
- 💭 AI-powered insights
- 💭 Integration với sàn TMĐT

---

**Legend:**
- ✅ Implemented
- ⏳ In Progress / Coming Soon
- 💭 Under Consideration
- ❌ Not Supported
