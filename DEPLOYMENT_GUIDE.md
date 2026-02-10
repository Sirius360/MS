# Hệ Thống Quản Lý Nhập Hàng & Kho - Hướng Dẫn Triển Khai

## Tóm tắt thay đổi

Hệ thống đã được cập nhật với các tính năng giống KiotViet:

### Backend (Node.js + Express + MySQL)

✅ **Database Schema**
- Thêm cột `importDateTime` (DATETIME) vào bảng `imports`
- Thêm cột `code` vào bảng `imports`, `suppliers` với auto-generation
- Thêm cột `email` vào bảng `suppliers`
- Thêm cột `discount` vào bảng `import_items`
- Thêm cột `createdBy`, `discountAmount` vào bảng `imports`

✅ **Auto Code Generation**
- Function `generateNextCode(prefix, table, column, padLen)` trong `helpers.js`
- Imports: PN000001, PN000002...
- Suppliers: NCC000001, NCC000002...
- Products: SP000001, SP000002...

✅ **API Endpoints Mới**
- `POST /api/imports` - Nhận `importDateTime`, tự động sinh mã PN
- `GET /api/imports/:id/print` - Template in phiếu nhập KiotViet-style
- `POST /api/suppliers` - Tự động sinh mã NCC, hỗ trợ email
- `GET /api/products/:id/stock-card` - Thẻ kho sản phẩm
- `GET /api/products/:id/cogs` - Tính giá vốn hàng bán

### Frontend (React + TypeScript)

✅ **Components Mới**
- `DateTimePicker.tsx` - Chọn ngày giờ với quick select (Hôm nay 00:00, 23:59, Hôm qua 23:59)
- `SupplierFormDialog.tsx` - Popup tạo nhà cung cấp từ form nhập hàng

✅ **Cập nhật CreateImport.tsx**
- Tích hợp DateTimePicker cho thời gian nhập
- Nút "+ Thêm NCC" bên cạnh dropdown nhà cung cấp
- Gửi `importDateTime` thay vì `date` + `time` riêng
- Auto-select NCC sau khi tạo mới

## Hướng dẫn triển khai

### Bước 1: Chạy Migration Database

```bash
cd server
node scripts/runMigration.js
```

Hoặc chạy thủ công trong MySQL:

```bash
mysql -u root -p quanlybanhang < server/database/migration_001_add_features.sql
```

### Bước 2: Khởi động lại Backend

Backend đã được cập nhật, khởi động lại server:

```bash
cd server
npm run dev
```

### Bước 3: Khởi động Frontend

Frontend đã tích hợp components mới:

```bash
# Từ thư mục gốc
npm run dev
```

## Kiểm tra tính năng

### 1. Tạo Phiếu Nhập với DateTime

- Mở http://localhost:5173/imports/create
- Click vào "Thời gian nhập" → Thử quick select buttons
- Chọn sản phẩm và nhà cung cấp
- Lưu phiếu nhập
- Kiểm tra trong DB: `SELECT code, importDateTime FROM imports ORDER BY createdAt DESC LIMIT 5;`

### 2. Tạo Nhà Cung Cấp Mới

- Trong form phiếu nhập, click nút "+" bên cạnh dropdown NCC
- Nhập tên, SĐT, email, địa chỉ
- Lưu → NCC mới tự động được chọn
- Kiểm tra mã NCC được sinh tự động (NCC000001...)

### 3. In Phiếu Nhập

- Mở danh sách phiếu nhập
- Click vào một phiếu để xem chi tiết
- Mở trực tiếp: http://localhost:3001/api/imports/:id/print
- Click "In phiếu" → window.print()

### 4. Thẻ Kho Sản Phẩm

API endpoint: `GET /api/products/:id/stock-card`

Test với curl:
```bash
curl http://localhost:3001/api/products/{product_id}/stock-card
```

Response:
```json
{
  "success": true,
  "data": {
    "product": { "id": "...", "sku": "SP000001", "name": "..." },
    "transactions": [
      {
        "dateTime": "2026-01-22T10:30:00",
        "type": "IMPORT",
        "documentCode": "PN000001",
        "qtyIn": 50,
        "qtyOut": 0,
        "stockAfter": 50,
        "unitPrice": 100000,
        "total": 5000000
      }
    ]
  }
}
```

### 5. Tính Giá Vốn (COGS)

API endpoint: `GET /api/products/:id/cogs?fromDate=2026-01-01&toDate=2026-01-31`

Test:
```bash
curl "http://localhost:3001/api/products/{product_id}/cogs?fromDate=2026-01-01&toDate=2026-01-31"
```

Response:
```json
{
  "success": true,
  "data": {
    "product": { "id": "...", "sku": "SP000001", "name": "...", "costPrice": 100000 },
    "period": { "fromDate": "2026-01-01", "toDate": "2026-01-31" },
    "openingStock": { "qty": 0, "value": 0 },
    "purchases": { "qty": 100, "value": 10000000 },
    "closingStock": { "qty": 80, "value": 8000000 },
    "cogs": 2000000
  }
}
```

## Các Files Đã Thay Đổi

### Backend
- ✅ `server/database/migration_001_add_features.sql` (MỚI)
- ✅ `server/utils/helpers.js` (CẬP NHẬT)
- ✅ `server/routes/imports.js` (CẬP NHẬT)
- ✅ `server/routes/suppliers.js` (CẬP NHẬT)
- ✅ `server/routes/stockCard.js` (MỚI)
- ✅ `server/index.js` (CẬP NHẬT)
- ✅ `server/scripts/runMigration.js` (MỚI)

### Frontend
- ✅ `src/components/ui/DateTimePicker.tsx` (MỚI)
- ✅ `src/components/imports/SupplierFormDialog.tsx` (MỚI)
- ✅ `src/pages/CreateImport.tsx` (CẬP NHẬT)

## Các Tính Năng Còn Lại (Sẽ Triển Khai Tiếp)

### Frontend Components Cần Thêm:
- [ ] Stock Card Tab trong trang Product Detail
- [ ] COGS Report Component
- [ ] Print Import Page (route /imports/:id/print)
- [ ] Product Edit Form với VAT auto-calculation

### Backend Enhancements:
- [ ] Invoice auto-decrease stock (đã có trong code nhưng cần test)
- [ ] Validation: Reject invoice if stock insufficient

## Lưu Ý Quan Trọng

1. **Backup Database** trước khi chạy migration
2. **Auto-code generation** sử dụng table locking để tránh duplicate
3. **ImportDateTime** mặc định là NOW() nếu không được gửi từ client
4. **Stock updates** dùng transaction để đảm bảo tính toàn vẹn dữ liệu
5. **Print template** dùng pure HTML/CSS, không cần frontend framework

## Troubleshooting

### Lỗi: Column already exists
- Migration đã chạy rồi, có thể bỏ qua hoặc drop database và setup lại

### Lỗi: Cannot read property 'code'
- Chạy migration để thêm cột `code` vào bảng

### DateTimePicker không hiển thị
- Kiểm tra `date-fns` đã install chưa: `npm install date-fns`
- Import locale: `import { vi } from 'date-fns/locale'`

### SupplierFormDialog không auto-select
- Kiểm tra callback `onSupplierCreated` đã được gọi chưa
- Check network tab xem API trả về supplier mới chưa

## Liên Hệ Hỗ Trợ

Nếu gặp vấn đề, kiểm tra:
1. Console log trong browser (F12)
2. Server logs trong terminal
3. Network tab để xem API requests/responses
4. Database để verify data
