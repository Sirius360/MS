# Hướng Dẫn Sử Dụng Hệ Thống Quản Lý Bán Hàng

## Mục Lục

1. [Đăng Nhập Hệ Thống](#1-đăng-nhập-hệ-thống)
2. [Trang Chủ (Dashboard)](#2-trang-chủ-dashboard)
3. [Quản Lý Sản Phẩm](#3-quản-lý-sản-phẩm)
4. [Quản Lý Khách Hàng](#4-quản-lý-khách-hàng)
5. [Quản Lý Nhà Cung Cấp](#5-quản-lý-nhà-cung-cấp)
6. [Nhập Hàng](#6-nhập-hàng)
7. [Bán Hàng](#7-bán-hàng)
8. [Báo Cáo & Thống Kê](#8-báo-cáo--thống-kê)

---

## 1. Đăng Nhập Hệ Thống

### Bước 1: Truy cập hệ thống

Mở trình duyệt web và truy cập: `http://localhost:5173`

### Bước 2: Nhập thông tin đăng nhập

**Tài khoản Admin mặc định:**
- **Tên đăng nhập:** `admin`
- **Mật khẩu:** `admin123`

> ⚠️ **Lưu ý bảo mật:** Sau lần đăng nhập đầu tiên, hãy đổi mật khẩu ngay!

### Bước 3: Đăng nhập

Nhấn nút **"Đăng nhập"** để vào hệ thống.

---

## 2. Trang Chủ (Dashboard)

Sau khi đăng nhập thành công, bạn sẽ thấy **Dashboard** hiển thị:

### Các Thông Tin Tổng Quan

📊 **Thẻ Thống Kê:**
- Tổng doanh thu
- Tổng số đơn hàng
- Tổng số sản phẩm
- Sản phẩm sắp hết hàng

📈 **Biểu Đồ:**
- Biểu đồ doanh thu theo ngày
- Top sản phẩm bán chạy
- Doanh thu theo nhóm sản phẩm

### Menu Điều Hướng

Bên trái màn hình là **menu chính** với các mục:
- 🏠 **Trang chủ** (Dashboard)
- 📦 **Sản phẩm** (Products)
- 👥 **Khách hàng** (Customers)
- 🏢 **Nhà cung cấp** (Suppliers)
- 📥 **Nhập hàng** (Imports)
- 💰 **Bán hàng** (Sales)
- 📊 **Báo cáo** (Reports)
- ⚙️ **Cài đặt** (Settings)

---

## 3. Quản Lý Sản Phẩm

### 3.1. Xem Danh Sách Sản Phẩm

1. Nhấn vào **"Sản phẩm"** trên menu
2. Danh sách sản phẩm hiển thị với thông tin:
   - Mã SKU
   - Tên sản phẩm
   - Nhóm sản phẩm
   - Thương hiệu
   - Giá bán
   - Tồn kho
   - Trạng thái

### 3.2. Tìm Kiếm Sản Phẩm

- **Thanh tìm kiếm:** Nhập tên hoặc mã SKU
- **Bộ lọc:**
  - Lọc theo nhóm sản phẩm
  - Lọc theo thương hiệu
  - Lọc theo trạng thái (Còn hàng/Hết hàng/Ngưng kinh doanh)

### 3.3. Thêm Sản Phẩm Mới

**Bước 1:** Nhấn nút **"+ Thêm sản phẩm"**

**Bước 2:** Điền thông tin sản phẩm:

**Thông Tin Cơ Bản:**
- Mã SKU (bắt buộc, duy nhất)
- Tên sản phẩm (bắt buộc)
- Loại: Hàng hóa / Dịch vụ

**Phân Loại:**
- Nhóm sản phẩm (chọn từ danh sách)
- Thương hiệu (chọn từ danh sách)

**Giá Cả:**
- Giá vốn
- Giá bán (trước thuế)
- Giá bán (sau thuế)
- VAT nhập (%)
- VAT bán (%)

**Tồn Kho:**
- Số lượng tồn kho
- Tồn kho tối thiểu (cảnh báo khi dưới mức này)
- Tồn kho tối đa
- Đơn vị tính (cái, hộp, kg, ...)

**Thông Tin Thêm:**
- Mô tả sản phẩm
- Ghi chú
- Thông tin bảo hành
- Hình ảnh sản phẩm

**Bước 3:** Nhấn **"Lưu"** để thêm sản phẩm

### 3.4. Sửa Sản Phẩm

1. Tìm sản phẩm cần sửa trong danh sách
2. Nhấn vào biểu tượng **✏️ (Sửa)**
3. Chỉnh sửa thông tin
4. Nhấn **"Lưu"**

### 3.5. Xóa Sản Phẩm

1. Tìm sản phẩm cần xóa
2. Nhấn vào biểu tượng **🗑️ (Xóa)**
3. Xác nhận xóa

> 💡 **Lưu ý:** Sản phẩm sẽ được xóa mềm (soft delete), không xóa hoàn toàn khỏi database.

### 3.6. Quản Lý Nhóm Sản Phẩm

**Tạo Nhóm Mới:**
1. Vào trang **"Nhóm sản phẩm"**
2. Nhấn **"+ Thêm nhóm"**
3. Nhập:
   - Tên nhóm
   - Mô tả
   - Khoảng giá (min-max)
4. Lưu

### 3.7. Quản Lý Thương Hiệu

Tương tự như quản lý nhóm sản phẩm.

---

## 4. Quản Lý Khách Hàng

### 4.1. Thêm Khách Hàng Mới

**Bước 1:** Vào trang **"Khách hàng"**

**Bước 2:** Nhấn **"+ Thêm khách hàng"**

**Bước 3:** Nhập thông tin:
- Tên khách hàng (bắt buộc)
- Số điện thoại
- Địa chỉ
- Ghi chú (khách VIP, ưu đãi, v.v.)

**Bước 4:** Nhấn **"Lưu"**

### 4.2. Tìm Kiếm Khách Hàng

- Sử dụng thanh tìm kiếm để tìm theo tên hoặc số điện thoại

### 4.3. Sửa/Xóa Khách Hàng

- Sửa: Nhấn biểu tượng **✏️**
- Xóa: Nhấn biểu tượng **🗑️**

---

## 5. Quản Lý Nhà Cung Cấp

### 5.1. Thêm Nhà Cung Cấp

**Bước 1:** Vào trang **"Nhà cung cấp"**

**Bước 2:** Nhấn **"+ Thêm nhà cung cấp"**

**Bước 3:** Nhập thông tin:
- Tên nhà cung cấp
- Số điện thoại
- Địa chỉ
- Ghi chú

**Bước 4:** Nhấn **"Lưu"**

### 5.2. Quản Lý Danh Sách

Tương tự như quản lý khách hàng (tìm kiếm, sửa, xóa).

---

## 6. Nhập Hàng

### 6.1. Tạo Phiếu Nhập Hàng Mới

**Bước 1:** Vào trang **"Nhập hàng"**

**Bước 2:** Nhấn **"+ Tạo phiếu nhập"**

**Bước 3:** Chọn thông tin cơ bản:
- **Nhà cung cấp:** Chọn từ danh sách
- **Ngày nhập:** Chọn ngày (mặc định hôm nay)

**Bước 4:** Thêm sản phẩm vào phiếu:

1. Nhấn **"+ Thêm sản phẩm"**
2. Chọn sản phẩm từ danh sách
3. Nhập:
   - **Số lượng nhập**
   - **Đơn giá nhập**
4. Hệ thống tự động tính **thành tiền** = số lượng × đơn giá

> 💡 Có thể thêm nhiều sản phẩm vào cùng một phiếu nhập

**Bước 5:** Kiểm tra tổng tiền

Hệ thống tự động tính **tổng tiền phiếu nhập** = tổng thành tiền của tất cả sản phẩm

**Bước 6:** Thêm ghi chú (nếu cần)

**Bước 7:** Nhấn **"Lưu phiếu nhập"**

### 6.2. Kết Quả Sau Khi Lưu

✅ Phiếu nhập được lưu vào hệ thống  
✅ **Tồn kho các sản phẩm tự động tăng**  
✅ Có thể xem lại chi tiết phiếu nhập

### 6.3. Xem Chi Tiết Phiếu Nhập

1. Trong danh sách phiếu nhập, nhấn vào **phiếu cần xem**
2. Hiển thị:
   - Thông tin nhà cung cấp
   - Ngày nhập
   - Danh sách sản phẩm đã nhập
   - Tổng tiền

### 6.4. Lọc Phiếu Nhập

**Lọc theo:**
- Khoảng thời gian (từ ngày - đến ngày)
- Nhà cung cấp
- Mã phiếu nhập

**Thống kê:**
- Tổng số phiếu
- Tổng tiền nhập trong khoảng thời gian

---

## 7. Bán Hàng

### 7.1. Tạo Hóa Đơn Bán Hàng

**Bước 1:** Vào trang **"Bán hàng"**

**Bước 2:** Nhấn **"+ Tạo hóa đơn"**

**Bước 3:** Chọn khách hàng

- Chọn khách hàng từ danh sách (nếu có tài khoản)
- Hoặc để trống nếu **khách lẻ**

**Bước 4:** Chọn ngày bán (mặc định hôm nay)

**Bước 5:** Thêm sản phẩm vào giỏ hàng

1. Nhấn **"+ Thêm sản phẩm"**
2. Chọn sản phẩm
3. Nhập **số lượng**
4. Đơn giá tự động lấy từ **giá bán** của sản phẩm (có thể chỉnh sửa)
5. Thành tiền = số lượng × đơn giá

> 💡 Có thể thêm nhiều sản phẩm vào hóa đơn

**Bước 6:** Tính tổng tiền hàng

Hệ thống tự động tính **tổng tiền hàng** (subtotal)

**Bước 7:** Áp dụng giảm giá (nếu có)

Chọn loại giảm giá:
- **Theo phần trăm (%):** Ví dụ: giảm 10%
- **Theo số tiền (VNĐ):** Ví dụ: giảm 50,000đ

Hệ thống tự động tính **số tiền giảm** và **tổng tiền sau giảm**

**Bước 8:** Thanh toán

1. Chọn **phương thức thanh toán:**
   - Tiền mặt (Cash)
   - Chuyển khoản (Transfer)

2. Nhập **số tiền khách đưa**

3. Hệ thống tự động tính **tiền thừa trả khách**

**Bước 9:** Thêm ghi chú (nếu cần)

**Bước 10:** Nhấn **"Lưu hóa đơn"**

### 7.2. Kết Quả Sau Khi Lưu

✅ Hóa đơn được lưu vào hệ thống  
✅ **Tồn kho các sản phẩm tự động giảm**  
✅ **Doanh thu được cập nhật**  
✅ Có thể in hóa đơn cho khách

### 7.3. In Hóa Đơn

1. Sau khi tạo hóa đơn thành công
2. Nhấn nút **"In hóa đơn"**
3. Chọn máy in hoặc lưu PDF

### 7.4. Xem Danh Sách Hóa Đơn

Hiển thị tất cả hóa đơn đã tạo với thông tin:
- Mã hóa đơn
- Ngày bán
- Tên khách hàng
- Tổng tiền
- Phương thức thanh toán
- Trạng thái

### 7.5. Lọc Hóa Đơn

**Lọc theo:**
- Khoảng thời gian
- Khách hàng
- Phương thức thanh toán

---

## 8. Báo Cáo & Thống Kê

### 8.1. Báo Cáo Doanh Thu

**Xem:**
- Doanh thu theo ngày/tuần/tháng
- Biểu đồ xu hướng doanh thu

**Lọc:**
- Chọn khoảng thời gian
- Chọn nhóm sản phẩm (optional)

### 8.2. Báo Cáo Sản Phẩm Bán Chạy

**Hiển thị:**
- Top sản phẩm bán nhiều nhất
- Số lượng đã bán
- Doanh thu từ mỗi sản phẩm

### 8.3. Báo Cáo Tồn Kho

**Xem:**
- Danh sách sản phẩm tồn kho
- **Cảnh báo:** Sản phẩm sắp hết hàng (< minStock)
- Sản phẩm tồn kho cao

**Hành động:**
- Tạo phiếu nhập để bổ sung hàng

### 8.4. Báo Cáo Công Nợ (Nếu có)

- Công nợ khách hàng
- Công nợ nhà cung cấp

### 8.5. Export Báo Cáo

Nhấn nút **"Xuất Excel"** hoặc **"Xuất PDF"** để tải báo cáo về máy.

---

## Các Tính Năng Khác

### 🔔 Thông Báo

Hệ thống sẽ hiển thị thông báo khi:
- ✅ Thêm/sửa/xóa thành công
- ⚠️ Sản phẩm sắp hết hàng
- ❌ Lỗi xảy ra (với hướng dẫn khắc phục)

### 🔍 Tìm Kiếm Nhanh

- Sử dụng thanh tìm kiếm toàn cục (góc trên phải)
- Tìm kiếm nhanh sản phẩm, khách hàng, hóa đơn

### 👤 Quản Lý Tài Khoản

**Đổi Mật Khẩu:**
1. Vào **"Cài đặt"**
2. Chọn **"Đổi mật khẩu"**
3. Nhập mật khẩu cũ
4. Nhập mật khẩu mới
5. Xác nhận mật khẩu mới
6. Lưu

**Đăng Xuất:**
- Nhấn biểu tượng **người dùng** góc trên phải
- Chọn **"Đăng xuất"**

---

## Mẹo & Thủ Thuật

### 💡 Tối Ưu Quy Trình Bán Hàng

1. **Tạo sẵn danh sách khách hàng thường xuyên** → bán hàng nhanh hơn
2. **Sử dụng mã SKU ngắn gọn, dễ nhớ** → tìm sản phẩm nhanh
3. **Kiểm tra tồn kho trước khi nhận đơn** → tránh thiếu hàng

### 💡 Quản Lý Tồn Kho Hiệu Quả

1. **Đặt minStock hợp lý** → nhận cảnh báo kịp thời
2. **Xem báo cáo tồn kho hàng tuần** → tránh tồn đọng
3. **Nhập hàng định kỳ** → đảm bảo nguồn cung

### 💡 Tăng Doanh Thu

1. **Phân tích sản phẩm bán chạy** → tăng cường nhập hàng
2. **Sử dụng giảm giá hợp lý** → kích thích mua hàng
3. **Quản lý khách hàng VIP** → ưu đãi đặc biệt

---

## Câu Hỏi Thường Gặp (FAQ)

### ❓ Tôi quên mật khẩu, làm sao để lấy lại?

Hiện tại hệ thống chưa có tính năng quên mật khẩu. Vui lòng liên hệ quản trị viên để reset.

### ❓ Tôi nhập sai số lượng trong phiếu nhập, có sửa được không?

Hiện tại chưa hỗ trợ sửa phiếu đã lưu. Bạn cần tạo phiếu điều chỉnh mới hoặc liên hệ admin.

### ❓ Hóa đơn đã lưu có xóa được không?

Không nên xóa hóa đơn đã lưu vì ảnh hưởng đến tồn kho và báo cáo. Nếu cần, liên hệ admin.

### ❓ Làm sao để in nhiều hóa đơn cùng lúc?

Vào danh sách hóa đơn, chọn các hóa đơn cần in, sau đó nhấn "In hàng loạt".

### ❓ Tôi muốn thêm trường thông tin mới cho sản phẩm?

Liên hệ team phát triển để yêu cầu thêm tính năng.

---

## Hỗ Trợ

Nếu gặp vấn đề hoặc cần hỗ trợ:
- 📧 Email: support@yourcompany.com
- 📞 Hotline: 1900-xxxx
- 💬 Chat: Sử dụng nút chat góc dưới phải

---

**Chúc bạn sử dụng hệ thống hiệu quả! 🎉**
