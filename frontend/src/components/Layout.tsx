import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';
import { useTenant } from '../context/TenantContext';

const navItems = [
  { to: '', label: 'Dashboard', icon: '📊' },
  { to: 'sales', label: 'Sales', icon: '💰' },
  { to: 'expenses', label: 'Expenses', icon: '📝' },
  { to: 'staff', label: 'Staff', icon: '👥' },
];

export default function Layout() {
  const auth = useAuth();
  const { displayName, tenant } = useTenant();

  const user = auth.user?.profile;
  const userName = user?.name || user?.preferred_username || user?.email || 'User';

  const handleLogout = () => {
    auth.signoutRedirect({
      post_logout_redirect_uri: window.location.origin + `/${tenant}/`,
    });
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-xl font-bold">Restaurant Daily</h1>
          <p className="text-gray-400 text-sm">{displayName}</p>
        </div>
        <nav className="flex-1 p-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === ''}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800'
                }`
              }
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User info & logout */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-medium">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{userName}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>

        <div className="px-4 pb-4 text-xs text-gray-500">
          Powered by Odoo
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto bg-gray-50">
        <Outlet />
      </main>
    </div>
  );
}
