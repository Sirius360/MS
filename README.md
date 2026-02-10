# Hệ Thống Quản Lý Bán Hàng

Hệ thống quản lý bán hàng hiện đại được xây dựng với React, TypeScript và Supabase.

## 🚀 Công nghệ sử dụng

### Frontend
- **Framework:** React 18 + TypeScript + Vite
- **UI Library:** shadcn/ui Components + Tailwind CSS
- **State Management:** TanStack Query (React Query)
- **Form Handling:** React Hook Form + Zod Validation
- **Routing:** React Router v6
- **Icons:** Lucide React

### Backend & Database
- **Backend:** Supabase (PostgreSQL + Edge Functions)
- **Authentication:** Supabase Auth
- **Real-time:** Supabase Realtime
- **Storage:** Supabase Storage

## ✨ Tính năng chính

### 1. Quản lý sản phẩm
- ✅ CRUD sản phẩm đầy đủ
- ✅ **Modal edit** - Chỉnh sửa sản phẩm qua modal overlay (không chuyển trang)
- ✅ **Tạo nhóm hàng nhanh** - Nút "Tạo mới" trong form edit để tạo category mới
- ✅ **Cascade delete** - Xóa sản phẩm và tất cả giao dịch liên quan
- ✅ Quản lý nhóm hàng (categories)
- ✅ Tự động sinh mã sản phẩm (PROD00001, PROD00002...)
- ✅ Quản lý tồn kho real-time
- ✅ Tính toán giá sau thuế tự động
- ✅ Trạng thái sản phẩm (Đang kinh doanh / Ngừng kinh doanh)

### 2. Quản lý nhập hàng
- ✅ Tạo phiếu nhập hàng
- ✅ Thêm/xóa sản phẩm trong phiếu
- ✅ Tính toán tự động: giảm giá, VAT, phí khác
- ✅ **Delete imports** - Xóa phiếu nhập (tất cả trạng thái)
- ✅ Hoàn thành phiếu nhập → tự động cập nhật tồn kho
- ✅ In phiếu nhập
- ✅ Tự động sinh mã phiếu (PN00001, PN00002...)
- ✅ Lọc theo ngày, nhà cung cấp

### 3. Quản lý khách hàng & nhà cung cấp
- ✅ CRUD khách hàng
- ✅ CRUD nhà cung cấp
- ✅ Tự động sinh mã (KH00001, NCC00001...)
- ✅ Lịch sử giao dịch

### 4. Quản lý bán hàng
- ✅ Tạo hóa đơn bán hàng
- ✅ Tìm kiếm sản phẩm nhanh
- ✅ Tính toán tự động
- ✅ Cập nhật tồn kho sau bán

### 5. Dashboard & Báo cáo
- ✅ Thống kê tổng quan
- ✅ Biểu đồ doanh thu
- ✅ Top sản phẩm bán chạy
- ✅ Cảnh báo tồn kho

### 6. Quản lý người dùng
- ✅ Đăng nhập/Đăng xuất
- ✅ Phân quyền (Admin/Staff)
- ✅ Quản lý profile

## 🎨 Tính năng UX đặc biệt

### Modal Edit (Giống KiotViet)
- Không chuyển trang khi edit
- Form edit "emerge" trên màn hình detail
- Tự động refresh data sau khi lưu
- Đóng modal = ESC hoặc click ngoài

### Cascade Delete với cảnh báo
- Xóa sản phẩm → xóa luôn tất cả giao dịch liên quan
- Dialog cảnh báo rõ ràng: "⚠️ Sẽ xóa TẤT CẢ giao dịch..."
- Không thể hoàn tác
- Console logging để debug

### Auto-generated Codes
- Tự động sinh mã cho: Sản phẩm, Phiếu nhập, Khách hàng, NCC
- Format: PROD00001, PN00001, KH00001, NCC00001
- Tăng dần tự động

## 📦 Yêu cầu hệ thống

- **Node.js** v18 trở lên
- **npm** hoặc **yarn**
- **Supabase Account** (miễn phí tạo tại [supabase.com](https://supabase.com))

## 🛠️ Hướng dẫn cài đặt

### 1. Clone repository

```bash
git clone <YOUR_GIT_URL>
cd quanlybanhang
```

### 2. Cài đặt dependencies

```bash
npm install
```

### 3. Cấu hình Supabase

1. Tạo project mới tại [supabase.com](https://supabase.com)
2. Copy Project URL và Anon Key
3. Tạo file `.env` trong thư mục gốc:

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. Setup Database

Chạy migration scripts trong thư mục `supabase/migrations/`:

```bash
# Sử dụng Supabase CLI hoặc copy SQL vào Supabase SQL Editor
```

Các file migration bao gồm:
- Schema tables
- RLS policies  
- Edge functions
- Triggers cho auto-code generation

### 5. Khởi động ứng dụng

```bash
npm run dev
```

Ứng dụng sẽ chạy tại: **http://localhost:8080**

## 📂 Cấu trúc thư mục

```
quanlybanhang/
├── src/
│   ├── components/       # UI Components
│   │   ├── layout/      # Layout components (Header, Sidebar, etc.)
│   │   └── ui/          # shadcn/ui components
│   ├── pages/           # Page components
│   │   ├── products/    # Product pages
│   │   │   ├── ProductList.tsx
│   │   │   ├── ProductDetail.tsx
│   │   │   ├── ProductCreate.tsx
│   │   │   └── ProductEditModal.tsx  # ⭐ Modal edit
│   │   ├── imports/     # Import pages
│   │   ├── customers/   # Customer pages
│   │   └── suppliers/   # Supplier pages
│   ├── hooks/           # Custom React hooks
│   ├── integrations/    # API integrations
│   │   └── supabase/    # Supabase client & types
│   └── lib/             # Utilities
├── supabase/            # Supabase config & migrations
├── public/              # Static assets
└── package.json
```

## 🔑 Đăng nhập

Tài khoản admin mặc định:
- **Email:** admin@example.com  
- **Password:** admin123

⚠️ **Đổi mật khẩu ngay sau lần đăng nhập đầu tiên!**

## 🗄️ Database Schema

### Core Tables

- **products** - Sản phẩm
  - `id`, `code`, `name`, `category_id`, `sale_price_default`, `unit`, `status`
  
- **categories** - Nhóm hàng
  - `id`, `name`, `description`, `status`

- **purchase_orders** - Phiếu nhập hàng
  - `id`, `code`, `supplier_id`, `status`, `final_amount`

- **purchase_order_items** - Chi tiết phiếu nhập
  - `id`, `purchase_order_id`, `product_id`, `quantity`, `unit_price`

- **inventory_transactions** - Giao dịch tồn kho
  - `id`, `product_id`, `type`, `quantity`, `reference_id`

- **customers** - Khách hàng
- **suppliers** - Nhà cung cấp
- **sales_invoices** - Hóa đơn bán
- **sales_invoice_items** - Chi tiết hóa đơn

### Support Tables

- **code_counters** - Bộ đếm cho auto-generate codes
- **profiles** - User profiles
- **user_roles** - Phân quyền

## 🎯 API Endpoints (Supabase Edge Functions)

```
POST /functions/v1/purchase-order
- action: 'list' - Lấy danh sách phiếu nhập
- action: 'get' - Lấy chi tiết phiếu nhập
- action: 'create' - Tạo phiếu nhập mới
- action: 'complete' - Hoàn thành phiếu nhập
```

## 🚨 Troubleshooting

### Lỗi kết nối Supabase

```bash
# Kiểm tra .env file
# Đảm bảo VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY đúng
```

### Lỗi xóa sản phẩm

- Kiểm tra browser console (F12)
- Xem chi tiết bảng nào đang block deletion
- Cascade delete sẽ tự động xóa các bảng con

### Port đã được sử dụng

```bash
# Đổi port trong vite.config.ts
# hoặc kill process đang dùng port 8080
```

## 📝 Scripts

```bash
npm run dev          # Development server
npm run build        # Build production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 🔐 Bảo mật

- ✅ Row Level Security (RLS) enabled
- ✅ JWT authentication
- ✅ API rate limiting
- ✅ Input validation với Zod
- ✅ XSS protection
- ✅ CSRF protection

## 📚 Tài liệu bổ sung

- [DOCUMENTATION.md](./DOCUMENTATION.md) - Chi tiết implementation
- [API_REFERENCE.md](./API_REFERENCE.md) - API documentation
- [USER_GUIDE.md](./USER_GUIDE.md) - Hướng dẫn sử dụng
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Hướng dẫn deploy

## 🆕 Cập nhật gần đây

### Version 2.0 (2026-01-22)

**Modal Edit Feature:**
- ✅ ProductEditModal với full form fields
- ✅ Tạo category mới ngay trong modal edit
- ✅ Auto-refresh data sau khi lưu
- ✅ Floating dialog UX như KiotViet

**Delete Features:**
- ✅ Cascade delete cho products
- ✅ Delete imports (all statuses)
- ✅ Warning dialogs với thông tin chi tiết
- ✅ Console logging để debug

**Improvements:**
- ✅ Query invalidation cho data consistency
- ✅ Toast notifications cho user feedback
- ✅ Loading states everywhere
- ✅ Error handling comprehensive

## 🤝 Contributing

Pull requests are welcome! Vui lòng:
1. Fork repo
2. Tạo branch mới (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

## 📄 License

MIT License - xem file LICENSE để biết thêm chi tiết

## 💡 Support

Nếu gặp vấn đề:
1. Kiểm tra browser console (F12)
2. Kiểm tra Supabase logs
3. Xem [Issues](github.com/your-repo/issues)
4. Tạo issue mới với:
   - Mô tả chi tiết
   - Screenshots
   - Console logs

---

Được xây dựng với ❤️ bởi [Your Name]
