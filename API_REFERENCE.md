# API Reference - Sales Management System

## Base URL

```
http://localhost:3001/api
```

## Authentication

Most endpoints require authentication using JWT token.

**Include token in headers:**
```
Authorization: Bearer <your-jwt-token>
```

---

## Table of Contents

- [Authentication](#authentication-endpoints)
- [Products](#products-endpoints)
- [Product Groups](#product-groups-endpoints)
- [Brands](#brands-endpoints)
- [Customers](#customers-endpoints)
- [Suppliers](#suppliers-endpoints)
- [Imports](#imports-endpoints)
- [Invoices](#invoices-endpoints)
- [Dashboard](#dashboard-endpoints)

---

## Authentication Endpoints

### POST /api/auth/login

Login to the system.

**Request:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "username": "admin",
      "email": "admin@example.com",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error (401):**
```json
{
  "success": false,
  "error": "Invalid username or password"
}
```

---

### POST /api/auth/register

Register new user (Admin only).

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "username": "staff01",
  "email": "staff01@example.com",
  "password": "password123",
  "role": "staff"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "username": "staff01",
    "email": "staff01@example.com",
    "role": "staff"
  }
}
```

---

### GET /api/auth/me

Get current user information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "admin",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

---

## Products Endpoints

### GET /api/products

Get list of products.

**Query Parameters:**
- `search` (optional): Search by name or SKU
- `groupId` (optional): Filter by product group
- `brandId` (optional): Filter by brand
- `status` (optional): Filter by status (in_stock, out_of_stock, discontinued)

**Example:**
```
GET /api/products?search=laptop&status=in_stock
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "prod-001",
      "sku": "LAPTOP001",
      "name": "Laptop Dell XPS 13",
      "type": "product",
      "groupId": "group-001",
      "groupName": "Laptops",
      "brandId": "brand-001",
      "brandName": "Dell",
      "costPrice": 15000000,
      "salePrice": 20000000,
      "stockQty": 25,
      "minStock": 5,
      "unit": "cái",
      "status": "in_stock",
      "imageUrl": "https://example.com/image.jpg"
    }
  ]
}
```

---

### GET /api/products/:id

Get product details.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "prod-001",
    "sku": "LAPTOP001",
    "name": "Laptop Dell XPS 13",
    "type": "product",
    "groupId": "group-001",
    "brandId": "brand-001",
    "config": {
      "cpu": "Intel i7",
      "ram": "16GB",
      "storage": "512GB SSD"
    },
    "costPrice": 15000000,
    "salePriceBeforeTax": 18181818,
    "salePrice": 20000000,
    "vatImport": 10,
    "vatSale": 10,
    "stockQty": 25,
    "minStock": 5,
    "maxStock": 100,
    "unit": "cái",
    "status": "in_stock",
    "imageUrl": "https://example.com/image.jpg",
    "images": ["img1.jpg", "img2.jpg"],
    "description": "Laptop cao cấp",
    "warranty": "24 tháng",
    "directSale": true,
    "loyaltyPoints": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-20T00:00:00.000Z"
  }
}
```

---

### POST /api/products

Create new product.

**Request:**
```json
{
  "sku": "LAPTOP002",
  "name": "Laptop HP Pavilion",
  "type": "product",
  "groupId": "group-001",
  "brandId": "brand-002",
  "config": {
    "cpu": "Intel i5",
    "ram": "8GB"
  },
  "costPrice": 10000000,
  "salePrice": 13000000,
  "stockQty": 15,
  "minStock": 3,
  "unit": "cái",
  "description": "Laptop tầm trung"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "prod-002",
    "sku": "LAPTOP002",
    "name": "Laptop HP Pavilion",
    ...
  }
}
```

---

### PUT /api/products/:id

Update product.

**Request:** (same as POST, only send fields to update)
```json
{
  "salePrice": 12500000,
  "stockQty": 20
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Product updated successfully"
}
```

---

### DELETE /api/products/:id

Delete product (soft delete).

**Response (200):**
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

---

## Product Groups Endpoints

### GET /api/product-groups

Get list of product groups.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "group-001",
      "name": "Laptops",
      "minPrice": 10000000,
      "maxPrice": 50000000,
      "description": "Nhóm laptop",
      "status": "active",
      "productCount": 45
    }
  ]
}
```

---

### POST /api/product-groups

Create new product group.

**Request:**
```json
{
  "name": "Smartphones",
  "minPrice": 3000000,
  "maxPrice": 30000000,
  "description": "Điện thoại thông minh",
  "configTemplate": {
    "fields": ["brand", "model", "storage", "color"]
  }
}
```

---

### PUT /api/product-groups/:id

Update product group.

---

### DELETE /api/product-groups/:id

Delete product group.

---

## Brands Endpoints

### GET /api/brands

Get list of brands.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "brand-001",
      "name": "Dell",
      "description": "Thương hiệu máy tính",
      "status": "active",
      "productCount": 23
    }
  ]
}
```

---

### POST /api/brands

Create new brand.

**Request:**
```json
{
  "name": "HP",
  "description": "Hewlett-Packard",
  "status": "active"
}
```

---

## Customers Endpoints

### GET /api/customers

Get list of customers.

**Query Parameters:**
- `search` (optional): Search by name or phone

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "cust-001",
      "name": "Nguyễn Văn A",
      "phone": "0123456789",
      "address": "123 Đường ABC, Hà Nội",
      "notes": "Khách VIP",
      "totalOrders": 15,
      "totalSpent": 50000000,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### POST /api/customers

Create new customer.

**Request:**
```json
{
  "name": "Trần Thị B",
  "phone": "0987654321",
  "address": "456 Đường XYZ, TP.HCM",
  "notes": "Khách quen"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "cust-002",
    "name": "Trần Thị B",
    ...
  }
}
```

---

### PUT /api/customers/:id

Update customer.

---

### DELETE /api/customers/:id

Delete customer.

---

## Suppliers Endpoints

### GET /api/suppliers

Get list of suppliers.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "supp-001",
      "name": "Công ty TNHH ABC",
      "phone": "0241234567",
      "address": "789 Đường DEF, Hà Nội",
      "notes": "NCC uy tín",
      "totalImports": 25,
      "totalAmount": 500000000
    }
  ]
}
```

---

### POST /api/suppliers

Create new supplier.

**Request:**
```json
{
  "name": "Công ty XYZ",
  "phone": "0289876543",
  "address": "Quận 1, TP.HCM",
  "notes": "NCC mới"
}
```

---

## Imports Endpoints

### GET /api/imports

Get list of import orders.

**Query Parameters:**
- `fromDate` (optional): Filter from date (YYYY-MM-DD)
- `toDate` (optional): Filter to date (YYYY-MM-DD)
- `supplierId` (optional): Filter by supplier
- `code` (optional): Search by import code

**Example:**
```
GET /api/imports?fromDate=2024-01-01&toDate=2024-01-31&supplierId=supp-001
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "imports": [
      {
        "id": "imp-001",
        "code": "IMP00001",
        "date": "2024-01-15",
        "supplierId": "supp-001",
        "supplierName": "Công ty ABC",
        "totalAmount": 50000000,
        "itemCount": 5,
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "totalRecords": 25,
    "totalAmount": 500000000
  }
}
```

---

### GET /api/imports/:id

Get import order details.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "imp-001",
    "code": "IMP00001",
    "date": "2024-01-15",
    "supplierId": "supp-001",
    "supplierName": "Công ty ABC",
    "totalAmount": 50000000,
    "notes": "Nhập hàng định kỳ",
    "items": [
      {
        "id": "item-001",
        "productId": "prod-001",
        "productName": "Laptop Dell XPS 13",
        "sku": "LAPTOP001",
        "quantity": 10,
        "unitPrice": 15000000,
        "total": 150000000
      }
    ],
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### POST /api/imports

Create new import order.

**Request:**
```json
{
  "supplierId": "supp-001",
  "date": "2024-01-20",
  "items": [
    {
      "productId": "prod-001",
      "quantity": 15,
      "unitPrice": 14500000
    },
    {
      "productId": "prod-002",
      "quantity": 20,
      "unitPrice": 10000000
    }
  ],
  "notes": "Nhập hàng tháng 1"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "imp-002",
    "code": "IMP00002",
    "totalAmount": 417500000,
    "message": "Import created and stock updated successfully"
  }
}
```

**Important:** Creating import automatically:
- Generates unique import code (IMP00XXX)
- Calculates total amount
- Updates product stock quantities (+quantity)

---

## Invoices Endpoints

### GET /api/invoices

Get list of invoices.

**Query Parameters:**
- `fromDate` (optional): Filter from date
- `toDate` (optional): Filter to date
- `customerId` (optional): Filter by customer
- `code` (optional): Search by invoice code

**Response (200):**
```json
{
  "success": true,
  "data": {
    "invoices": [
      {
        "id": "inv-001",
        "code": "INV00001",
        "date": "2024-01-20",
        "customerId": "cust-001",
        "customerName": "Nguyễn Văn A",
        "subtotal": 40000000,
        "discountAmount": 4000000,
        "totalAmount": 36000000,
        "paymentMethod": "cash",
        "itemCount": 2,
        "createdAt": "2024-01-20T14:30:00.000Z"
      }
    ],
    "totalRecords": 150,
    "totalRevenue": 500000000
  }
}
```

---

### GET /api/invoices/:id

Get invoice details.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "inv-001",
    "code": "INV00001",
    "date": "2024-01-20",
    "customerId": "cust-001",
    "customerName": "Nguyễn Văn A",
    "subtotal": 40000000,
    "discountType": "percent",
    "discountValue": 10,
    "discountAmount": 4000000,
    "totalAmount": 36000000,
    "paymentMethod": "cash",
    "amountPaid": 40000000,
    "change": 4000000,
    "notes": "Khách VIP giảm 10%",
    "items": [
      {
        "id": "item-001",
        "productId": "prod-001",
        "productName": "Laptop Dell XPS 13",
        "sku": "LAPTOP001",
        "quantity": 2,
        "unitPrice": 20000000,
        "total": 40000000
      }
    ],
    "createdAt": "2024-01-20T14:30:00.000Z"
  }
}
```

---

### POST /api/invoices

Create new invoice.

**Request:**
```json
{
  "customerId": "cust-001",
  "date": "2024-01-20",
  "items": [
    {
      "productId": "prod-001",
      "quantity": 2,
      "unitPrice": 20000000
    }
  ],
  "discountType": "percent",
  "discountValue": 10,
  "paymentMethod": "cash",
  "amountPaid": 40000000,
  "notes": "Khách VIP"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "inv-002",
    "code": "INV00002",
    "subtotal": 40000000,
    "discountAmount": 4000000,
    "totalAmount": 36000000,
    "change": 4000000,
    "message": "Invoice created and stock updated successfully"
  }
}
```

**Important:** Creating invoice automatically:
- Generates unique invoice code (INV00XXX)
- Calculates subtotal (sum of all items)
- Calculates discount amount
- Calculates total amount (subtotal - discount)
- Calculates change (amountPaid - totalAmount)
- Updates product stock quantities (-quantity)

---

## Dashboard Endpoints

### GET /api/dashboard/stats

Get dashboard statistics.

**Query Parameters:**
- `fromDate` (optional): Statistics from date (default: 30 days ago)
- `toDate` (optional): Statistics to date (default: today)

**Example:**
```
GET /api/dashboard/stats?fromDate=2024-01-01&toDate=2024-01-31
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalRevenue": 500000000,
      "totalOrders": 350,
      "totalProducts": 245,
      "lowStockProducts": 12
    },
    "revenueByDay": [
      {
        "date": "2024-01-15",
        "revenue": 15000000,
        "orders": 12
      },
      {
        "date": "2024-01-16",
        "revenue": 18000000,
        "orders": 15
      }
    ],
    "topProducts": [
      {
        "productId": "prod-001",
        "productName": "Laptop Dell XPS 13",
        "sku": "LAPTOP001",
        "totalSold": 45,
        "revenue": 90000000
      }
    ],
    "revenueByGroup": [
      {
        "groupId": "group-001",
        "groupName": "Laptops",
        "revenue": 300000000,
        "percentage": 60
      }
    ],
    "revenueByBrand": [
      {
        "brandId": "brand-001",
        "brandName": "Dell",
        "revenue": 250000000,
        "percentage": 50
      }
    ]
  }
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message description"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created successfully
- `400` - Bad request (validation error)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not found
- `500` - Internal server error

---

## Rate Limiting

Currently no rate limiting implemented.

## API Versioning

Current version: **v1** (implicit in base URL)

---

**Last Updated:** 2024-01-21
