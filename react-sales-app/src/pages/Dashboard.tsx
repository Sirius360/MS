import { AppLayout } from '../components/layout/AppLayout';
import { LayoutDashboard, ShoppingCart, DollarSign, Package } from 'lucide-react';

export function Dashboard() {
  return (
    <AppLayout>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Tổng quan hệ thống</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Revenue Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Doanh thu hôm nay</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                0 ₫
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <DollarSign size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        {/* Orders Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Đơn hàng hôm nay</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                0
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <ShoppingCart size={24} className="text-green-600" />
            </div>
          </div>
        </div>

        {/* Products Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tổng sản phẩm</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                0
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Package size={24} className="text-purple-600" />
            </div>
          </div>
        </div>

        {/* Low Stock Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Sản phẩm sắp hết</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                0
              </p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <LayoutDashboard size={24} className="text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-8 text-white">
        <h2 className="text-2xl font-bold mb-2">Chào mừng đến với hệ thống quản lý!</h2>
        <p className="text-blue-100">
          Bắt đầu bằng cách thêm sản phẩm hoặc tạo đơn hàng mới.
        </p>
      </div>
    </AppLayout>
  );
}
