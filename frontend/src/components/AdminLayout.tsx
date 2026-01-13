import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: '🏠', end: true },
  { to: '/admin/tenants', label: 'Tenants', icon: '🏢' },
  { to: '/admin/usage', label: 'Usage', icon: '📊' },
  { to: '/admin/billing', label: 'Billing', icon: '💳' },
  { to: '/admin/comms', label: 'Communications', icon: '📨' },
];

export default function AdminLayout() {
  const auth = useAuth();
  const user = auth.user?.profile;

  const handleSignOut = () => {
    auth.signoutRedirect();
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-violet-950 text-white flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-violet-800">
          <h1 className="text-xl font-bold">Restaurant Daily</h1>
          <p className="text-sm text-violet-300 mt-1">Admin Portal</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
                  isActive
                    ? 'bg-violet-600 text-white'
                    : 'text-violet-200 hover:bg-violet-800'
                }`
              }
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-violet-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center text-lg font-semibold">
              {user?.given_name?.[0] || user?.name?.[0] || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user?.name || 'Super Admin'}
              </p>
              <p className="text-xs text-violet-300 truncate">
                {user?.email || 'admin@mindweave.tech'}
              </p>
            </div>
          </div>
          <div className="inline-block px-2 py-1 bg-violet-600 rounded text-xs font-medium mb-3">
            Super Admin
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-violet-200 hover:bg-violet-800 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>

        {/* Footer */}
        <div className="p-4 text-xs text-violet-400">
          Mindweave Technologies
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}
