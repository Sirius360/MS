import { User } from 'lucide-react';

export function Header() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">
          {/* Page title will be set by individual pages */}
        </h2>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <User size={20} className="text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              {user.username || 'User'}
            </span>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
              {user.role || 'staff'}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="text-sm text-red-600 hover:text-red-700"
          >
            Đăng xuất
          </button>
        </div>
      </div>
    </header>
  );
}
