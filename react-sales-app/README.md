# React Sales Management Frontend

Ứng dụng frontend React kết nối với backend Node.js + MySQL để quản lý bán hàng.

## 🚀 Đã hoàn thành

✅ **Cấu trúc dự án hoàn chỉnh**
✅ **API Layer** với Axios và TypeScript types
✅ **Authentication** với JWT tokens
✅ **React Router** với protected routes
✅ **React Query** để quản lý server state
✅ **Tailwind CSS** cho styling
✅ **Responsive UI** với mobile support

## 📁 Cấu trúc thư mục

```
react-sales-app/
├── src/
│   ├── api/          # API service layer
│   │   ├── client.ts      # Axios instance với interceptors
│   │   ├── products.ts    # Product API
│   │   ├── categories.ts  # Category API
│   │   └── index.ts       # Customers, Suppliers, Sales API
│   ├── components/
│   │   └── layout/        # Layout components
│   │       ├── AppLayout.tsx    # Main layout wrapper
│   │       ├── Sidebar.tsx      # Navigation sidebar
│   │       └── Header.tsx       # Top header
│   ├── pages/
│   │   ├── Dashboard.tsx        # Dashboard page
│   │   ├── Login.tsx            # Login page
│   │   └── products/
│   │       └── ProductList.tsx  # Product list with CRUD
│   ├── hooks/
│   │   └── useProducts.ts # React Query hooks
│   ├── types/
│   │   └── index.ts       # TypeScript interfaces
│   ├── utils/
│   │   └── formatters.ts  # Format currency, dates
│   ├── App.tsx            # Main app with routing
│   ├── main.tsx           # Entry point
│   └── index.css          # Global styles
└── package.json
```

## 🛠 Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router v6** - Routing
- **TanStack React Query** - Server state management
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **date-fns** - Date formatting

## 🎯 Features Implemented

### 1. Authentication

- ✅ Login page với JWT
- ✅ Protected routes
- ✅ Token storage trong localStorage
- ✅ Auto-redirect nếu chưa đăng nhập

### 2. Dashboard

- ✅ Tổng quan với stat cards
- ✅ Doanh thu, đơn hàng, sản phẩm
- ✅ Responsive layout

### 3. Products Management

- ✅ Danh sách sản phẩm với table
- ✅ Search theo mã hoặc tên
- ✅ Hiển thị giá, tồn kho, trạng thái
- ✅ Delete functionality
- ✅ Link to create page (sẽ implement)

### 4. Layout & Navigation

- ✅ Sidebar với menu items
- ✅ Active route highlighting
- ✅ Mobile responsive với hamburger menu
- ✅ Header với user info và logout

## 🚀 Cách chạy

### 1. Backend (Port 3001)

\`\`\`bash
cd server
npm run dev
\`\`\`

Backend sẽ chạy tại: http://localhost:3001

### 2. Frontend (Port 5173)

\`\`\`bash
cd react-sales-app
npm run dev
\`\`\`

Frontend sẽ chạy tại: http://localhost:5173

### 3. Truy cập ứng dụng

Mở browser và vào: **http://localhost:5173**

## 🔐 Authentication

Backend sử dụng JWT authentication. Check file `server.routes/auth.js` để biết credentials mặc định.

## 📝 API Endpoints (Backend)

Tất cả API đều ở base URL: `http://localhost:3001/api`

### Authentication

- `POST /auth/login` - Đăng nhập
- `GET /auth/me` - Lấy thông tin user hiện tại

### Products

- `GET /products` - Lấy tất cả sản phẩm
- `GET /products/:id` - Lấy 1 sản phẩm
- `POST /products` - Tạo sản phẩm mới
- `PUT /products/:id` - Cập nhật sản phẩm
- `DELETE /products/:id` - Xóa sản phẩm

### Categories

- `GET /categories` - Lấy danh mục
- `POST /categories` - Tạo danh mục

### Customers

- `GET /customers` - Lấy khách hàng
- `POST /customers` - Tạo khách hàng

### Sales

- `GET /sales` - Lấy đơn hàng
- `POST /sales` - Tạo đơn hàng
- `GET /sales/generate/code` - Tạo mã đơn hàng

## 🎨 UI Features

### Responsive Design

- Desktop: Full sidebar + content
- Mobile: Hamburger menu + overlay

### Color Scheme

- Primary: Blue (#2563EB)
- Success: Green
- Error: Red
- Gray: Slate tones

### Components

- Tables với hover effects
- Search bars với icons
- Stat cards với gradients
- Loading states
- Error handling

## 📦 Packages Đã cài

\`\`\`json
{
"dependencies": {
"react": "^18.3.1",
"react-dom": "^18.3.1",
"react-router-dom": "^6.x",
"@tanstack/react-query": "^5.x",
"axios": "^1.x",
"lucide-react": "^0.x",
"date-fns": "^4.x"
},
"devDependencies": {
"@vitejs/plugin-react": "^4.x",
"typescript": "~5.x",
"tailwindcss": "^3.x",
"postcss": "^8.x",
"autoprefixer": "^10.x"
}
}
\`\`\`

## 🔮 Tính năng cần thêm (Next Steps)

1. **Product Create Page** - Form tạo sản phẩm mới
2. **Product Edit Page** - Form chỉnh sửa sản phẩm
3. **Sales POS Page** - Tạo hóa đơn bán hàng
4. **Customers Page** - Quản lý khách hàng
5. **Suppliers Page** - Quản lý nhà cung cấp
6. **Reports Page** - Báo cáo doanh thu
7. **Settings Page** - Cài đặt hệ thống

## 🐛 Troubleshooting

### Backend không kết nối được

- Check xem server có chạy ở port 3001 không
- Kiểm tra file `.env` trong `server/`
- Check MySQL database có running không

### CORS errors

- Backend đã config CORS cho `http://localhost:5173`
- Nếu dùng port khác, update trong `server/index.ts`

### Authentication errors

- Clear localStorage trong browser DevTools
- Check JWT token có hợp lệ không
- Verify backend auth endpoints hoạt động

## 📸 Screenshots

### Login Page

- Gradient background xanh-tím
- Form với username/password
- Error handling
- Demo credentials hint

### Dashboard

- 4 stat cards (Revenue, Orders, Products, Low Stock)
- Welcome banner
- Responsive grid layout

### Products Page

- Search bar
- Data table
- Edit/Delete actions
- Status badges
- Stock display

## 👨‍💻 Development Notes

### Code Organization

- API calls tách riêng trong `/api`
- TypeScript types trong `/types`
- React Query hooks trong `/hooks`
- Reusable components trong `/components`

### Best Practices

- ✅ TypeScript strict mode
- ✅ Error boundaries (có thể thêm)
- ✅ Loading states
- ✅ Protected routes
- ✅ API interceptors
- ✅ Responsive design

## 🚀 Deployment (Tương lai)

### Frontend

- Build: `npm run build`
- Output: `dist/` folder
- Deploy lên Vercel, Netlify, hoặc static hosting

### Backend

- Đã có sẵn, chạy Node.js server
- Deploy lên Railway, Render, hoặc VPS

## 📞 Support

Nếu gặp vấn đề:

1. Check console logs (F12)
2. Check network tab cho API errors
3. Verify backend đang chạy
4. Clear cache và localStorage

---

**Created:** February 3, 2026
**Status:** ✅ Working - Backend & Frontend running successfully!
**Ports:** Backend: 3001 | Frontend: 5173
