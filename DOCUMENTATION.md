# Tài Liệu Hệ Thống Quản Lý Bán Hàng

## Mục Lục

1. [Tổng Quan Dự Án](#1-tổng-quan-dự-án)
2. [Kiến Trúc Hệ Thống](#2-kiến-trúc-hệ-thống)
3. [Công Nghệ Sử Dụng](#3-công-nghệ-sử-dụng)
4. [Cấu Trúc Thư Mục](#4-cấu-trúc-thư-mục)
5. [Database Schema](#5-database-schema)
6. [API Endpoints](#6-api-endpoints)
7. [Frontend Components](#7-frontend-components)
8. [Tính Năng Chính](#8-tính-năng-chính)
9. [Quy Trình Nghiệp Vụ](#9-quy-trình-nghiệp-vụ)
10. [Hướng Dẫn Phát Triển](#10-hướng-dẫn-phát-triển)

---

## 1. Tổng Quan Dự Án

### 1.1. Giới Thiệu

Hệ thống **Quản Lý Bán Hàng** là một ứng dụng web full-stack được thiết kế để hỗ trợ các doanh nghiệp trong việc quản lý:
- Sản phẩm và kho hàng
- Khách hàng và nhà cung cấp
- Phiếu nhập hàng
- Hóa đơn bán hàng
- Báo cáo và thống kê

### 1.2. Mục Tiêu

- ✅ Quản lý sản phẩm với cấu hình linh hoạt
- ✅ Theo dõi tồn kho tự động
- ✅ Quản lý khách hàng và nhà cung cấp
- ✅ Tạo phiếu nhập và hóa đơn bán hàng
- ✅ Thống kê và báo cáo chi tiết
- ✅ Giao diện thân thiện, dễ sử dụng

### 1.3. Phạm Vi Hệ Thống

**Người dùng:**
- **Admin:** Toàn quyền quản lý hệ thống
- **Staff:** Quyền hạn hạn chế (tùy cấu hình)

**Module chính:**
- Quản lý sản phẩm (Products Management)
- Quản lý nhóm sản phẩm (Product Groups)
- Quản lý thương hiệu (Brands)
- Quản lý khách hàng (Customers)
- Quản lý nhà cung cấp (Suppliers)
- Quản lý phiếu nhập (Imports)
- Quản lý hóa đơn (Invoices/Sales)
- Dashboard & Reports

---

## 2. Kiến Trúc Hệ Thống

### 2.1. Tổng Quan Kiến Trúc

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT SIDE                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         React + TypeScript + Vite                     │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐     │  │
│  │  │   Pages    │  │ Components │  │   Hooks    │     │  │
│  │  └────────────┘  └────────────┘  └────────────┘     │  │
│  │            shadcn-ui + Tailwind CSS                   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/REST API
┌─────────────────────────────────────────────────────────────┐
│                       SERVER SIDE                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Node.js + Express                        │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐     │  │
│  │  │   Routes   │  │Middleware  │  │  Database  │     │  │
│  │  │  (API)     │  │  (Auth)    │  │ Connection │     │  │
│  │  └────────────┘  └────────────┘  └────────────┘     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↕ MySQL Driver
┌─────────────────────────────────────────────────────────────┐
│                      DATABASE LAYER                         │
│                        MySQL 8.0+                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Tables: users, products, customers, suppliers,       │  │
│  │          imports, invoices, brands, product_groups    │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 2.2. Luồng Dữ Liệu

1. **User Interaction:** Người dùng tương tác với giao diện React
2. **API Request:** Frontend gửi HTTP request đến Backend API
3. **Authentication:** Middleware xác thực JWT token
4. **Business Logic:** Route xử lý logic nghiệp vụ
5. **Database Query:** Truy vấn/cập nhật dữ liệu từ MySQL
6. **Response:** Trả kết quả về Frontend dưới dạng JSON

---

## 3. Công Nghệ Sử Dụng

### 3.1. Frontend

| Công nghệ | Version | Mục đích |
|-----------|---------|----------|
| **React** | 18.3.1 | Framework UI chính |
| **TypeScript** | 5.8.3 | Type safety |
| **Vite** | 5.4.19 | Build tool & Dev server |
| **shadcn-ui** | Latest | Component library |
| **Tailwind CSS** | 3.4.17 | Styling framework |
| **React Router** | 6.30.1 | Client-side routing |
| **React Hook Form** | 7.61.1 | Form management |
| **Zod** | 3.25.76 | Schema validation |
| **TanStack Query** | 5.83.0 | Data fetching & caching |
| **Lucide React** | 0.462.0 | Icon library |
| **Recharts** | 2.15.4 | Charts & visualization |
| **date-fns** | 3.6.0 | Date manipulation |

### 3.2. Backend

| Công nghệ | Version | Mục đích |
|-----------|---------|----------|
| **Node.js** | 18+ | Runtime environment |
| **Express** | 4.18.2 | Web framework |
| **MySQL2** | 3.6.5 | MySQL client |
| **bcryptjs** | 2.4.3 | Password hashing |
| **jsonwebtoken** | 9.0.2 | JWT authentication |
| **cors** | 2.8.5 | Cross-Origin Resource Sharing |
| **dotenv** | 16.3.1 | Environment variables |

### 3.3. Database

- **MySQL** 8.0+
- **Character Set:** utf8mb4
- **Collation:** utf8mb4_unicode_ci

---

## 4. Cấu Trúc Thư Mục

```
quanlybanhang/
│
├── src/                          # Frontend source code
│   ├── components/               # React components
│   │   ├── ui/                   # shadcn-ui components
│   │   ├── layout/               # Layout components
│   │   └── ...
│   ├── pages/                    # Page components
│   │   ├── Dashboard.tsx
│   │   ├── Products.tsx
│   │   ├── Customers.tsx
│   │   ├── Suppliers.tsx
│   │   ├── Imports.tsx
│   │   ├── Sales.tsx
│   │   └── ...
│   ├── hooks/                    # Custom React hooks
│   ├── lib/                      # Utility functions
│   ├── types/                    # TypeScript type definitions
│   ├── contexts/                 # React contexts
│   ├── App.tsx                   # Main App component
│   └── main.tsx                  # Entry point
│
├── server/                       # Backend source code
│   ├── routes/                   # API routes
│   │   ├── auth.js               # Authentication routes
│   │   ├── products.js           # Product routes
│   │   ├── customers.js          # Customer routes
│   │   ├── suppliers.js          # Supplier routes
│   │   ├── imports.js            # Import routes
│   │   ├── invoices.js           # Invoice routes
│   │   ├── brands.js             # Brand routes
│   │   ├── productGroups.js      # Product group routes
│   │   └── dashboard.js          # Dashboard routes
│   ├── database/                 # Database files
│   │   ├── connection.js         # MySQL connection
│   │   └── schema.sql            # Database schema
│   ├── scripts/                  # Setup scripts
│   │   ├── setupDatabase.js      # Database setup
│   │   └── seedData.js           # Seed data
│   ├── middleware/               # Express middleware
│   ├── index.js                  # Server entry point
│   ├── package.json
│   └── .env                      # Environment variables
│
├── public/                       # Static assets
├── .vscode/                      # VS Code configuration
├── README.md                     # Main documentation
├── SETUP.md                      # Setup guide
├── DOCUMENTATION.md              # This file
├── package.json                  # Frontend dependencies
└── vite.config.ts               # Vite configuration
```

---

## 5. Database Schema

### 5.1. Sơ Đồ Quan Hệ

```
┌─────────────┐
│    users    │
└─────────────┘

┌─────────────────┐         ┌──────────────┐
│ product_groups  │────┐    │    brands    │─┐
└─────────────────┘    │    └──────────────┘ │
                       ↓                      ↓
                  ┌─────────────┐
                  │  products   │
                  └─────────────┘
                       ↑    ↑
          ┌────────────┘    └────────────┐
          │                               │
┌─────────────────┐              ┌─────────────────┐
│  import_items   │              │ invoice_items   │
└─────────────────┘              └─────────────────┘
          ↑                               ↑
          │                               │
    ┌──────────┐                   ┌──────────┐
    │ imports  │                   │ invoices │
    └──────────┘                   └──────────┘
          ↑                               ↑
          │                               │
   ┌──────────────┐               ┌──────────────┐
   │  suppliers   │               │  customers   │
   └──────────────┘               └──────────────┘
```

### 5.2. Mô Tả Chi Tiết Các Bảng

#### 5.2.1. users (Người dùng)

Lưu trữ thông tin người dùng hệ thống.

| Column | Type | Description |
|--------|------|-------------|
| id | VARCHAR(36) | Primary key (UUID) |
| username | VARCHAR(50) | Tên đăng nhập (unique) |
| email | VARCHAR(100) | Email (unique) |
| password | VARCHAR(255) | Mật khẩu đã hash (bcrypt) |
| role | ENUM | Vai trò: 'admin' hoặc 'staff' |
| isActive | BOOLEAN | Trạng thái hoạt động |
| createdAt | TIMESTAMP | Thời gian tạo |
| updatedAt | TIMESTAMP | Thời gian cập nhật |

**Indexes:**
- `idx_username` trên `username`
- `idx_email` trên `email`

---

#### 5.2.2. product_groups (Nhóm sản phẩm)

Phân loại sản phẩm theo nhóm.

| Column | Type | Description |
|--------|------|-------------|
| id | VARCHAR(36) | Primary key (UUID) |
| name | VARCHAR(255) | Tên nhóm sản phẩm |
| minPrice | DECIMAL(15,2) | Giá tối thiểu |
| maxPrice | DECIMAL(15,2) | Giá tối đa |
| description | TEXT | Mô tả |
| configTemplate | JSON | Template cấu hình |
| status | ENUM | Trạng thái: 'active', 'inactive' |
| createdAt | TIMESTAMP | Thời gian tạo |
| updatedAt | TIMESTAMP | Thời gian cập nhật |

---

#### 5.2.3. brands (Thương hiệu)

Quản lý thương hiệu sản phẩm.

| Column | Type | Description |
|--------|------|-------------|
| id | VARCHAR(36) | Primary key (UUID) |
| name | VARCHAR(255) | Tên thương hiệu |
| description | TEXT | Mô tả |
| status | ENUM | Trạng thái: 'active', 'inactive' |
| createdAt | TIMESTAMP | Thời gian tạo |
| updatedAt | TIMESTAMP | Thời gian cập nhật |

---

#### 5.2.4. products (Sản phẩm)

Lưu trữ thông tin chi tiết sản phẩm.

| Column | Type | Description |
|--------|------|-------------|
| id | VARCHAR(36) | Primary key (UUID) |
| sku | VARCHAR(50) | Mã SKU (unique) |
| name | VARCHAR(255) | Tên sản phẩm |
| type | ENUM | Loại: 'product', 'service' |
| groupId | VARCHAR(36) | Foreign key → product_groups |
| brandId | VARCHAR(36) | Foreign key → brands |
| config | JSON | Cấu hình sản phẩm |
| costPrice | DECIMAL(15,2) | Giá vốn |
| salePriceBeforeTax | DECIMAL(15,2) | Giá bán trước thuế |
| salePrice | DECIMAL(15,2) | Giá bán sau thuế |
| vatImport | DECIMAL(5,2) | VAT nhập (%) |
| vatSale | DECIMAL(5,2) | VAT bán (%) |
| stockQty | INT | Số lượng tồn kho |
| minStock | INT | Tồn kho tối thiểu |
| maxStock | INT | Tồn kho tối đa |
| unit | VARCHAR(50) | Đơn vị tính |
| status | ENUM | Trạng thái: 'in_stock', 'out_of_stock', 'discontinued' |
| imageUrl | VARCHAR(500) | URL ảnh chính |
| images | JSON | Danh sách ảnh |
| notes | TEXT | Ghi chú |
| description | TEXT | Mô tả chi tiết |
| warranty | VARCHAR(255) | Thông tin bảo hành |
| directSale | BOOLEAN | Bán trực tiếp |
| loyaltyPoints | BOOLEAN | Tích điểm |
| isDeleted | BOOLEAN | Soft delete |
| createdAt | TIMESTAMP | Thời gian tạo |
| updatedAt | TIMESTAMP | Thời gian cập nhật |

**Indexes:**
- `idx_sku` trên `sku`
- `idx_status` trên `status`
- `idx_isDeleted` trên `isDeleted`
- `idx_groupId` trên `groupId`
- `idx_brandId` trên `brandId`

---

#### 5.2.5. customers (Khách hàng)

Quản lý thông tin khách hàng.

| Column | Type | Description |
|--------|------|-------------|
| id | VARCHAR(36) | Primary key (UUID) |
| name | VARCHAR(255) | Tên khách hàng |
| phone | VARCHAR(20) | Số điện thoại |
| address | TEXT | Địa chỉ |
| notes | TEXT | Ghi chú |
| createdAt | TIMESTAMP | Thời gian tạo |
| updatedAt | TIMESTAMP | Thời gian cập nhật |

---

#### 5.2.6. suppliers (Nhà cung cấp)

Quản lý thông tin nhà cung cấp.

| Column | Type | Description |
|--------|------|-------------|
| id | VARCHAR(36) | Primary key (UUID) |
| name | VARCHAR(255) | Tên nhà cung cấp |
| phone | VARCHAR(20) | Số điện thoại |
| address | TEXT | Địa chỉ |
| notes | TEXT | Ghi chú |
| createdAt | TIMESTAMP | Thời gian tạo |
| updatedAt | TIMESTAMP | Thời gian cập nhật |

---

#### 5.2.7. imports (Phiếu nhập hàng)

Quản lý phiếu nhập hàng từ nhà cung cấp.

| Column | Type | Description |
|--------|------|-------------|
| id | VARCHAR(36) | Primary key (UUID) |
| supplierId | VARCHAR(36) | Foreign key → suppliers |
| date | DATE | Ngày nhập |
| totalAmount | DECIMAL(15,2) | Tổng tiền |
| notes | TEXT | Ghi chú |
| createdAt | TIMESTAMP | Thời gian tạo |

**Indexes:**
- `idx_date` trên `date`
- `idx_supplierId` trên `supplierId`

---

#### 5.2.8. import_items (Chi tiết phiếu nhập)

Chi tiết sản phẩm trong mỗi phiếu nhập.

| Column | Type | Description |
|--------|------|-------------|
| id | VARCHAR(36) | Primary key (UUID) |
| importId | VARCHAR(36) | Foreign key → imports |
| productId | VARCHAR(36) | Foreign key → products |
| quantity | INT | Số lượng |
| unitPrice | DECIMAL(15,2) | Đơn giá |
| total | DECIMAL(15,2) | Thành tiền |

---

#### 5.2.9. invoices (Hóa đơn bán hàng)

Quản lý hóa đơn bán hàng.

| Column | Type | Description |
|--------|------|-------------|
| id | VARCHAR(36) | Primary key (UUID) |
| customerId | VARCHAR(36) | Foreign key → customers |
| date | DATE | Ngày bán |
| subtotal | DECIMAL(15,2) | Tổng tiền trước giảm giá |
| discountType | ENUM | Loại giảm giá: 'percent', 'amount' |
| discountValue | DECIMAL(15,2) | Giá trị giảm giá |
| discountAmount | DECIMAL(15,2) | Số tiền giảm |
| totalAmount | DECIMAL(15,2) | Tổng tiền sau giảm giá |
| paymentMethod | ENUM | Phương thức: 'cash', 'transfer' |
| amountPaid | DECIMAL(15,2) | Tiền khách đưa |
| change | DECIMAL(15,2) | Tiền thừa |
| notes | TEXT | Ghi chú |
| createdAt | TIMESTAMP | Thời gian tạo |

---

#### 5.2.10. invoice_items (Chi tiết hóa đơn)

Chi tiết sản phẩm trong mỗi hóa đơn.

| Column | Type | Description |
|--------|------|-------------|
| id | VARCHAR(36) | Primary key (UUID) |
| invoiceId | VARCHAR(36) | Foreign key → invoices |
| productId | VARCHAR(36) | Foreign key → products |
| quantity | INT | Số lượng |
| unitPrice | DECIMAL(15,2) | Đơn giá |
| total | DECIMAL(15,2) | Thành tiền |

---

## 6. API Endpoints

Backend API chạy tại: `http://localhost:3001/api`

### 6.1. Authentication (Xác thực)

#### POST /api/auth/login
Đăng nhập hệ thống.

**Request Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "username": "admin",
      "email": "admin@example.com",
      "role": "admin"
    },
    "token": "jwt-token-here"
  }
}
```

---

#### POST /api/auth/register
Đăng ký user mới (Admin only).

**Request Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "username": "staff01",
  "email": "staff01@example.com",
  "password": "password123",
  "role": "staff"
}
```

---

#### GET /api/auth/me
Lấy thông tin user hiện tại.

**Request Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "username": "admin",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

---

### 6.2. Products (Sản phẩm)

#### GET /api/products
Lấy danh sách sản phẩm.

**Query Parameters:**
- `search` (optional): Tìm kiếm theo tên hoặc SKU
- `groupId` (optional): Lọc theo nhóm sản phẩm
- `brandId` (optional): Lọc theo thương hiệu
- `status` (optional): Lọc theo trạng thái

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "sku": "PROD001",
      "name": "Sản phẩm A",
      "salePrice": 100000,
      "stockQty": 50,
      "status": "in_stock",
      "groupName": "Nhóm A",
      "brandName": "Thương hiệu X"
    }
  ]
}
```

---

#### GET /api/products/:id
Lấy chi tiết sản phẩm.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "sku": "PROD001",
    "name": "Sản phẩm A",
    "costPrice": 80000,
    "salePrice": 100000,
    "stockQty": 50,
    "unit": "cái",
    "description": "Mô tả sản phẩm",
    "groupId": "group-uuid",
    "brandId": "brand-uuid"
  }
}
```

---

#### POST /api/products
Tạo sản phẩm mới.

**Request Body:**
```json
{
  "sku": "PROD002",
  "name": "Sản phẩm B",
  "groupId": "group-uuid",
  "brandId": "brand-uuid",
  "costPrice": 90000,
  "salePrice": 120000,
  "stockQty": 30,
  "minStock": 10,
  "unit": "cái"
}
```

---

#### PUT /api/products/:id
Cập nhật sản phẩm.

**Request Body:** (Tương tự POST, chỉ gửi các field cần update)

---

#### DELETE /api/products/:id
Xóa sản phẩm (soft delete).

---

### 6.3. Product Groups (Nhóm sản phẩm)

#### GET /api/product-groups
Lấy danh sách nhóm sản phẩm.

#### GET /api/product-groups/:id
Lấy chi tiết nhóm sản phẩm.

#### POST /api/product-groups
Tạo nhóm sản phẩm mới.

#### PUT /api/product-groups/:id
Cập nhật nhóm sản phẩm.

#### DELETE /api/product-groups/:id
Xóa nhóm sản phẩm.

---

### 6.4. Brands (Thương hiệu)

#### GET /api/brands
Lấy danh sách thương hiệu.

#### POST /api/brands
Tạo thương hiệu mới.

#### PUT /api/brands/:id
Cập nhật thương hiệu.

#### DELETE /api/brands/:id
Xóa thương hiệu.

---

### 6.5. Customers (Khách hàng)

#### GET /api/customers
Lấy danh sách khách hàng.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Nguyễn Văn A",
      "phone": "0123456789",
      "address": "Hà Nội"
    }
  ]
}
```

#### POST /api/customers
Tạo khách hàng mới.

**Request Body:**
```json
{
  "name": "Nguyễn Văn B",
  "phone": "0987654321",
  "address": "TP. HCM",
  "notes": "Khách VIP"
}
```

---

### 6.6. Suppliers (Nhà cung cấp)

#### GET /api/suppliers
Lấy danh sách nhà cung cấp.

#### POST /api/suppliers
Tạo nhà cung cấp mới.

---

### 6.7. Imports (Phiếu nhập hàng)

#### GET /api/imports
Lấy danh sách phiếu nhập.

**Query Parameters:**
- `fromDate` (optional): Lọc từ ngày
- `toDate` (optional): Lọc đến ngày
- `supplierId` (optional): Lọc theo nhà cung cấp

**Response:**
```json
{
  "success": true,
  "data": {
    "imports": [
      {
        "id": "uuid",
        "date": "2024-01-15",
        "supplierName": "NCC A",
        "totalAmount": 5000000,
        "itemCount": 3
      }
    ],
    "totalRecords": 10,
    "totalAmount": 50000000
  }
}
```

---

#### GET /api/imports/:id
Lấy chi tiết phiếu nhập.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "date": "2024-01-15",
    "supplierId": "supplier-uuid",
    "supplierName": "NCC A",
    "totalAmount": 5000000,
    "items": [
      {
        "productId": "product-uuid",
        "productName": "Sản phẩm A",
        "quantity": 10,
        "unitPrice": 80000,
        "total": 800000
      }
    ]
  }
}
```

---

#### POST /api/imports
Tạo phiếu nhập mới.

**Request Body:**
```json
{
  "supplierId": "supplier-uuid",
  "date": "2024-01-20",
  "items": [
    {
      "productId": "product-uuid",
      "quantity": 20,
      "unitPrice": 85000
    }
  ],
  "notes": "Nhập hàng định kỳ"
}
```

**Hệ thống tự động:**
- Tính tổng tiền phiếu nhập
- Cập nhật tồn kho sản phẩm (+quantity)

---

### 6.8. Invoices (Hóa đơn bán hàng)

#### GET /api/invoices
Lấy danh sách hóa đơn.

**Query Parameters:**
- `fromDate` (optional): Lọc từ ngày
- `toDate` (optional): Lọc đến ngày
- `customerId` (optional): Lọc theo khách hàng

---

#### GET /api/invoices/:id
Lấy chi tiết hóa đơn.

---

#### POST /api/invoices
Tạo hóa đơn mới.

**Request Body:**
```json
{
  "customerId": "customer-uuid",
  "date": "2024-01-20",
  "items": [
    {
      "productId": "product-uuid",
      "quantity": 2,
      "unitPrice": 100000
    }
  ],
  "discountType": "percent",
  "discountValue": 10,
  "paymentMethod": "cash",
  "amountPaid": 200000
}
```

**Hệ thống tự động:**
- Tính subtotal (tổng tiền hàng)
- Tính discountAmount (số tiền giảm)
- Tính totalAmount (tổng sau giảm giá)
- Tính change (tiền thừa)
- Cập nhật tồn kho sản phẩm (-quantity)

---

### 6.9. Dashboard (Thống kê)

#### GET /api/dashboard/stats
Lấy thống kê tổng quan.

**Query Parameters:**
- `fromDate` (optional): Từ ngày
- `toDate` (optional): Đến ngày

**Response:**
```json
{
  "success": true,
  "data": {
    "totalRevenue": 150000000,
    "totalOrders": 450,
    "totalProducts": 235,
    "lowStockProducts": 12,
    "revenueByDay": [
      { "date": "2024-01-15", "revenue": 5000000 }
    ],
    "topProducts": [
      {
        "productId": "uuid",
        "productName": "Sản phẩm A",
        "totalSold": 150,
        "revenue": 15000000
      }
    ]
  }
}
```

---

## 7. Frontend Components

### 7.1. Cấu Trúc Pages

| Page | Route | Mô tả |
|------|-------|-------|
| Dashboard | `/` | Trang tổng quan, thống kê |
| Products | `/products` | Quản lý sản phẩm |
| Product Groups | `/product-groups` | Quản lý nhóm sản phẩm |
| Brands | (Tích hợp) | Quản lý thương hiệu |
| Customers | `/customers` | Quản lý khách hàng |
| Suppliers | `/suppliers` | Quản lý nhà cung cấp |
| Imports | `/imports` | Quản lý phiếu nhập |
| Sales/Invoices | `/sales` | Quản lý hóa đơn |
| Reports | `/reports` | Báo cáo |
| Settings | `/settings` | Cài đặt |

### 7.2. UI Components (shadcn-ui)

Hệ thống sử dụng các component từ shadcn-ui:

- **Form Components:** Input, Select, Textarea, Checkbox, Radio, DatePicker
- **Layout:** Card, Tabs, Accordion, Separator
- **Feedback:** Toast, Alert, Dialog, AlertDialog
- **Data Display:** Table, Badge, Avatar
- **Navigation:** Dropdown Menu, Navigation Menu
- **Overlay:** Sheet, Popover, Tooltip, HoverCard

### 7.3. Custom Hooks

| Hook | Mục đích |
|------|----------|
| `useAuth` | Quản lý authentication |
| `useProducts` | Fetch và quản lý products |
| `useCustomers` | Fetch và quản lý customers |
| `useSuppliers` | Fetch và quản lý suppliers |
| `useImports` | Fetch và quản lý imports |
| `useInvoices` | Fetch và quản lý invoices |
| `useDashboard` | Fetch dashboard stats |

---

## 8. Tính Năng Chính

### 8.1. Quản Lý Sản Phẩm

**Chức năng:**
- ✅ Thêm/sửa/xóa sản phẩm (soft delete)
- ✅ Tìm kiếm sản phẩm theo tên, SKU
- ✅ Lọc theo nhóm, thương hiệu, trạng thái
- ✅ Quản lý giá vốn, giá bán
- ✅ Quản lý tồn kho (min/max stock)
- ✅ Hỗ trợ cấu hình linh hoạt (JSON config)
- ✅ Upload nhiều ảnh sản phẩm
- ✅ Thông tin bảo hành

**Trường đặc biệt:**
- `config`: Lưu thông tin cấu hình sản phẩm (RAM, CPU, màu sắc, v.v.)
- `directSale`: Đánh dấu sản phẩm bán trực tiếp
- `loyaltyPoints`: Hỗ trợ tích điểm thành viên

### 8.2. Quản Lý Phiếu Nhập

**Chức năng:**
- ✅ Tạo phiếu nhập từ nhà cung cấp
- ✅ Chọn nhiều sản phẩm trong một phiếu
- ✅ Tự động tính tổng tiền
- ✅ Tự động cập nhật tồn kho
- ✅ Lọc theo ngày, nhà cung cấp
- ✅ Xem chi tiết phiếu nhập
- ✅ Thống kê tổng tiền nhập theo khoảng thời gian

**Quy trình:**
1. Chọn nhà cung cấp
2. Thêm sản phẩm và số lượng
3. Nhập đơn giá nhập
4. Hệ thống tự tính tổng tiền
5. Lưu phiếu → Tồn kho tự động tăng

### 8.3. Quản Lý Hóa Đơn

**Chức năng:**
- ✅ Tạo hóa đơn bán hàng
- ✅ Chọn khách hàng (hoặc khách lẻ)
- ✅ Thêm nhiều sản phẩm
- ✅ Tính giảm giá (theo % hoặc số tiền)
- ✅ Tự động tính tổng tiền, tiền thừa
- ✅ Hỗ trợ thanh toán tiền mặt/chuyển khoản
- ✅ Tự động trừ tồn kho
- ✅ In hóa đơn

**Quy trình:**
1. Chọn khách hàng (optional)
2. Thêm sản phẩm vào giỏ
3. Áp dụng giảm giá (nếu có)
4. Nhập số tiền khách đưa
5. Hệ thống tính tiền thừa
6. Lưu → Tồn kho tự động giảm

### 8.4. Dashboard & Báo Cáo

**Thống kê hiển thị:**
- 📊 Tổng doanh thu
- 📊 Tổng đơn hàng
- 📊 Số lượng sản phẩm
- 📊 Sản phẩm sắp hết hàng
- 📊 Biểu đồ doanh thu theo ngày
- 📊 Top sản phẩm bán chạy
- 📊 Doanh thu theo thương hiệu/nhóm

---

## 9. Quy Trình Nghiệp Vụ

### 9.1. Quy Trình Nhập Hàng

```
[Nhà Cung Cấp] → [Tạo Phiếu Nhập] → [Thêm Sản Phẩm] 
                                            ↓
                        [Lưu Phiếu] ← [Nhập Đơn Giá & SL]
                            ↓
                    [Cập Nhật Tồn Kho] → [Hoàn Thành]
```

**Chi tiết:**
1. Nhân viên nhận hàng từ nhà cung cấp
2. Tạo phiếu nhập mới, chọn nhà cung cấp
3. Thêm từng sản phẩm: chọn sản phẩm, nhập SL và đơn giá
4. Hệ thống tự tính thành tiền và tổng phiếu
5. Lưu phiếu → Tồn kho các sản phẩm tự động tăng

### 9.2. Quy Trình Bán Hàng

```
[Khách Hàng] → [Tạo Hóa Đơn] → [Thêm Sản Phẩm]
                                      ↓
                [Thanh Toán] ← [Áp Dụng Giảm Giá]
                     ↓
         [Cập Nhật Tồn Kho] → [In Hóa Đơn] → [Hoàn Thành]
```

**Chi tiết:**
1. Khách hàng chọn sản phẩm muốn mua
2. Nhân viên tạo hóa đơn, chọn khách (hoặc khách lẻ)
3. Thêm sản phẩm vào hóa đơn
4. Áp dụng giảm giá nếu có
5. Nhập số tiền khách đưa
6. Hệ thống tính tiền thừa
7. Lưu hóa đơn → Tồn kho tự động giảm
8. In hóa đơn cho khách

### 9.3. Quy Trình Kiểm Kho

```
[Dashboard] → [Xem Cảnh Báo] → [Sản Phẩm Sắp Hết]
                                        ↓
                    [Tạo Phiếu Nhập] → [Nhập Thêm Hàng]
```

**Chi tiết:**
1. Hệ thống cảnh báo sản phẩm < minStock
2. Nhân viên kho kiểm tra danh sách
3. Liên hệ nhà cung cấp đặt hàng
4. Tạo phiếu nhập khi hàng về

---

## 10. Hướng Dẫn Phát Triển

### 10.1. Setup Môi Trường Development

#### Prerequisites
- Node.js 18+
- MySQL 8.0+
- npm hoặc yarn
- Git

#### Cài Đặt

```bash
# 1. Clone repository
git clone <your-repo-url>
cd quanlybanhang

# 2. Cài đặt dependencies Frontend
npm install

# 3. Cài đặt dependencies Backend
cd server
npm install

# 4. Cấu hình database
cp .env.example .env
# Chỉnh sửa thông tin MySQL trong .env

# 5. Setup database
npm run setup-db

# 6. Quay về thư mục gốc
cd ..
```

#### Chạy Development

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
# Backend chạy tại http://localhost:3001
```

**Terminal 2 - Frontend:**
```bash
npm run dev
# Frontend chạy tại http://localhost:5173
```

### 10.2. Thêm Tính Năng Mới

#### Thêm API Endpoint Mới

**Bước 1:** Tạo route file trong `server/routes/`

```javascript
// server/routes/myfeature.js
import express from 'express';
import { db } from '../database/connection.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM my_table');
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
```

**Bước 2:** Đăng ký route trong `server/index.js`

```javascript
import myFeatureRoutes from './routes/myfeature.js';
app.use('/api/myfeature', myFeatureRoutes);
```

#### Thêm Page Mới

**Bước 1:** Tạo file page trong `src/pages/`

```tsx
// src/pages/MyFeature.tsx
import React from 'react';

export default function MyFeature() {
  return (
    <div>
      <h1>My New Feature</h1>
    </div>
  );
}
```

**Bước 2:** Thêm route trong `src/App.tsx`

```tsx
import MyFeature from './pages/MyFeature';

// Trong Router
<Route path="/my-feature" element={<MyFeature />} />
```

### 10.3. Best Practices

#### Backend
- ✅ Luôn sử dụng try-catch cho async functions
- ✅ Validate input data trước khi xử lý
- ✅ Sử dụng prepared statements để tránh SQL injection
- ✅ Trả về response chuẩn: `{ success, data/error }`
- ✅ Log errors để debug

#### Frontend
- ✅ Sử dụng TypeScript types
- ✅ Tách logic ra custom hooks
- ✅ Sử dụng React Query cho data fetching
- ✅ Validate forms với Zod + React Hook Form
- ✅ Responsive design với Tailwind CSS
- ✅ Accessibility: sử dụng semantic HTML

#### Database
- ✅ Sử dụng indexes cho columns thường query
- ✅ Normalize data khi cần
- ✅ Sử dụng transactions cho operations phức tạp
- ✅ Soft delete thay vì hard delete

### 10.4. Testing

#### Manual Testing
1. Test trên nhiều trình duyệt (Chrome, Firefox, Safari)
2. Test responsive trên mobile/tablet
3. Test các edge cases (empty state, errors, loading)

#### API Testing
Sử dụng Postman hoặc curl:

```bash
# Test login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Test get products với token
curl -X GET http://localhost:3001/api/products \
  -H "Authorization: Bearer <your-token>"
```

### 10.5. Deployment

#### Build Production

**Frontend:**
```bash
npm run build
# Output trong thư mục dist/
```

**Backend:**
```bash
# Set NODE_ENV=production trong .env
NODE_ENV=production npm start
```

#### Deployment Checklist
- [ ] Update `.env` với production credentials
- [ ] Đổi JWT_SECRET thành giá trị bảo mật
- [ ] Đổi mật khẩu admin mặc định
- [ ] Enable HTTPS
- [ ] Setup database backup
- [ ] Configure CORS cho production domain
- [ ] Minify & optimize assets
- [ ] Setup error monitoring (Sentry, etc.)
- [ ] Setup logging

---

## Phụ Lục

### A. Environment Variables

**Backend (.env):**
```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=quanlybanhang

# Server
PORT=3001
NODE_ENV=development

# Authentication
JWT_SECRET=your-secret-key-change-in-production

# Admin Account
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
ADMIN_EMAIL=admin@example.com
```

### B. Scripts Cheat Sheet

**Frontend:**
```bash
npm run dev         # Dev server
npm run build       # Build production
npm run preview     # Preview build
npm run lint        # Lint code
```

**Backend:**
```bash
npm run dev         # Dev server với auto-reload
npm start           # Production server
npm run setup-db    # Setup database
npm run seed        # Seed sample data
```

### C. Port Usage

- **Frontend Dev Server:** 5173
- **Backend API Server:** 3001
- **MySQL Database:** 3306

### D. Common Issues & Solutions

#### Issue: Cannot connect to database
**Solution:**
- Kiểm tra MySQL service đang chạy
- Verify credentials trong `.env`
- Check firewall không block port 3306

#### Issue: CORS error
**Solution:**
- Kiểm tra CORS config trong `server/index.js`
- Đảm bảo frontend URL được whitelist

#### Issue: JWT token expired
**Solution:**
- Login lại để lấy token mới
- Tăng expiration time trong auth logic

---

## Liên Hệ & Hỗ Trợ

Để được hỗ trợ hoặc đóng góp vào dự án, vui lòng:
- Tạo issue trên GitHub
- Liên hệ team phát triển

---

**Version:** 1.0.0  
**Last Updated:** 2024-01-21  
**Maintained by:** Development Team
