// Mock data for now - will be replaced with Keycloak Admin API calls
const mockStats = {
  totalTenants: 1,
  activeTenants: 1,
  totalUsers: 2,
  activeUsers: 2,
  monthlyRevenue: 0,
  platformHealth: 99.9,
};

const mockTenants = [
  {
    id: 'gr-kitchens',
    name: 'GR Kitchens',
    status: 'active',
    users: 1,
    plan: 'Free Trial',
    createdAt: '2026-01-11',
  },
];

const mockRecentActivity = [
  { id: 1, type: 'user_login', tenant: 'GR Kitchens', user: 'owner@grkitchens.com', time: '2 min ago' },
  { id: 2, type: 'tenant_created', tenant: 'GR Kitchens', user: 'admin', time: '1 hour ago' },
];

export default function AdminDashboard() {
  // Using mock data for now - will be replaced with Keycloak Admin API
  const stats = mockStats;
  const tenants = mockTenants;
  const activity = mockRecentActivity;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Tenants"
          value={stats.totalTenants}
          subtitle={`${stats.activeTenants} active`}
          color="violet"
        />
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          subtitle={`${stats.activeUsers} active (30d)`}
          color="blue"
        />
        <StatCard
          title="Monthly Revenue"
          value={`₹${stats.monthlyRevenue.toLocaleString()}`}
          subtitle="MRR"
          color="green"
        />
        <StatCard
          title="Platform Health"
          value={`${stats.platformHealth}%`}
          subtitle="Uptime"
          color="emerald"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <button className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors">
            + Add Tenant
          </button>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            Send Announcement
          </button>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            View Reports
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tenants */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Tenants</h2>
          <div className="space-y-3">
            {tenants.map((tenant) => (
              <div
                key={tenant.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">{tenant.name}</p>
                  <p className="text-sm text-gray-500">
                    {tenant.users} user{tenant.users !== 1 ? 's' : ''} • {tenant.plan}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded ${
                    tenant.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {tenant.status}
                </span>
              </div>
            ))}
          </div>
          <button className="mt-4 text-sm text-violet-600 hover:text-violet-700 font-medium">
            View all tenants →
          </button>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {activity.map((item) => (
              <div key={item.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                    item.type === 'user_login'
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-violet-100 text-violet-600'
                  }`}
                >
                  {item.type === 'user_login' ? '👤' : '🏢'}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">
                    {item.type === 'user_login'
                      ? `${item.user} logged in`
                      : `Tenant "${item.tenant}" created`}
                  </p>
                  <p className="text-xs text-gray-500">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-4 text-sm text-violet-600 hover:text-violet-700 font-medium">
            View all activity →
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  color,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  color: 'violet' | 'blue' | 'green' | 'emerald';
}) {
  const colorClasses = {
    violet: 'bg-violet-50 border-violet-200',
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    emerald: 'bg-emerald-50 border-emerald-200',
  };

  return (
    <div className={`rounded-xl p-6 border ${colorClasses[color]}`}>
      <p className="text-sm font-medium text-gray-600">{title}</p>
      <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
    </div>
  );
}
