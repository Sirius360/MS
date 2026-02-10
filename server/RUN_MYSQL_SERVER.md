# 🚀 Hướng Dẫn Chạy MySQL Backend Server

## Yêu Cầu

- ✅ MySQL 9.6.0 đã cài đặt và đang chạy
- ✅ Database `quanlybanhang` đã được tạo và có dữ liệu
- ✅ Node.js đã cài đặt

---

## Cách 1: Chạy Trực Tiếp (Recommended)

**Mở terminal trong thư mục `server`:**

```powershell
cd "d:\ProjectWeb\quanlybanhang (2)\quanlybanhang\server"
```

**Chạy server:**

```powershell
node index-mysql-complete.js
```

**Hoặc chỉ định port:**

```powershell
$env:PORT=3002; node index-mysql-complete.js
```

---

## Cách 2: Chạy Từ Thư Mục Gốc

```powershell
cd "d:\ProjectWeb\quanlybanhang (2)\quanlybanhang"
cd server
node index-mysql-complete.js
```

---

## Kiểm Tra Server Đang Chạy

**Mở terminal mới, test API:**

```powershell
# Test health check
curl http://localhost:3002/health

# Test products API
curl http://localhost:3002/api/products

# Test categories
curl http://localhost:3002/api/categories

# Test customers
curl http://localhost:3002/api/customers
```

---

## Output Khi Server Chạy Thành Công

Bạn sẽ thấy:

```
======================================================================
🚀 COMPLETE HIGH-PERFORMANCE MySQL API SERVER
======================================================================

📍 URL: http://localhost:3002
🗄️  Database: MySQL 9.6.0

✅ MySQL: CONNECTED

📊 Records:
   products: 32
   customers: 8
   suppliers: 7
   product_groups: 7

💾 Cache: 0 entries

⚡ Optimizations:
   ✅ Connection Pooling (10 connections)
   ✅ LRU Cache (TTL-based)
   ✅ Query Optimization
   ✅ Batch Operations

📡 Complete API Endpoints:
   GET  /health                    - Health check
   GET  /api/products              - List products
   ...

======================================================================
✅ COMPLETE API SERVER READY
======================================================================
```

---

## Dừng Server

Trong terminal đang chạy server:

- **Nhấn:** `Ctrl + C`

---

## Troubleshooting

### Lỗi: EADDRINUSE (Port đã được sử dụng)

**Kill tất cả node processes:**

```powershell
Stop-Process -Name node -Force
```

**Sau đó chạy lại:**

```powershell
node index-mysql-complete.js
```

### Lỗi: MySQL Connection Refused

**Kiểm tra MySQL đang chạy:**

```powershell
# Kiểm tra service MySQL
Get-Service | Where-Object {$_.Name -like "*mysql*"}

# Hoặc connect trực tiếp
mysql -u root -p
```

**Nếu MySQL chưa chạy:**

- Mở MySQL Workbench
- Hoặc start service: `net start mysql90`

### Lỗi: Database không tồn tại

**Tạo lại database:**

```powershell
mysql -u root -p < database/schema.sql
node migrate-final.js
node seed-test-data.js
```

---

## Chạy Cả Frontend + Backend

**Terminal 1 (Backend):**

```powershell
cd "d:\ProjectWeb\quanlybanhang (2)\quanlybanhang\server"
node index-mysql-complete.js
```

**Terminal 2 (Frontend):**

```powershell
cd "d:\ProjectWeb\quanlybanhang (2)\quanlybanhang"
npm run dev
```

**Truy cập:**

- Frontend: `http://localhost:8080`
- Backend API: `http://localhost:3002`

---

## Quick Commands

```powershell
# Vào thư mục server
cd "d:\ProjectWeb\quanlybanhang (2)\quanlybanhang\server"

# Chạy server
node index-mysql-complete.js

# Test API (terminal mới)
curl http://localhost:3002/health
curl http://localhost:3002/api/products
```

**Done! Server sẽ chạy ở port 3002** 🎉
