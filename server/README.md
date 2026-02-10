# MySQL Backend Setup Guide

## Bước 1: Cài đặt MySQL

### Windows:

1. Download MySQL Installer: https://dev.mysql.com/downloads/installer/
2. Chọn "MySQL Installer for Windows" → Download
3. Chạy installer, chọn "Developer Default"
4. Đặt root password (nhớ password này!)
5. Hoàn tất cài đặt

### macOS (dùng Homebrew):

```bash
brew install mysql
brew services start mysql
mysql_secure_installation
```

### Linux (Ubuntu/Debian):

```bash
sudo apt update
sudo apt install mysql-server
sudo mysql_secure_installation
```

## Bước 2: Cấu hình .env

Cập nhật file `.env` với thông tin MySQL của bạn:

```env
# MySQL Configuration
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=quanlybanhang
MYSQL_USER=root
MYSQL_PASSWORD=your_password_here  # <-- CẬP NHẬT PASSWORD

# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:8080
```

## Bước 3: Tạo Database và Chạy Migration

```bash
# Chạy migration để tạo database và tables
tsx server/migrations/run.ts
```

## Bước 4: Khởi động Backend Server

```bash
# Chạy server (development mode with auto-reload)
npm run server:watch

# HOẶC chạy server (production mode)
npm run server
```

Server sẽ chạy tại: http://localhost:3001

## Bước 5: Test API

```bash
# Test health check
curl http://localhost:3001/health

# Test categories endpoint
curl http://localhost:3001/api/categories

# Test products endpoint
curl http://localhost:3001/api/products
```

## API Endpoints

### Categories

- `GET /api/categories` - Get all active categories
- `POST /api/categories` - Create new category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Products

- `GET /api/products` - Get all active products with stock
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
