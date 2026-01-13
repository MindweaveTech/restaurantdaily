export default function Usage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Usage Analytics</h1>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-600">Total API Calls</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">12,450</p>
          <p className="text-sm text-green-600 mt-1">+15% from last month</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-600">Storage Used</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">2.4 GB</p>
          <p className="text-sm text-gray-500 mt-1">of 10 GB total</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-600">Active Sessions</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">8</p>
          <p className="text-sm text-gray-500 mt-1">across all tenants</p>
        </div>
      </div>

      {/* Usage by Tenant */}
      <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Usage by Tenant</h2>
        <table className="w-full">
          <thead className="border-b border-gray-200">
            <tr>
              <th className="text-left py-3 text-sm font-medium text-gray-500">Tenant</th>
              <th className="text-left py-3 text-sm font-medium text-gray-500">API Calls</th>
              <th className="text-left py-3 text-sm font-medium text-gray-500">Storage</th>
              <th className="text-left py-3 text-sm font-medium text-gray-500">Users</th>
              <th className="text-left py-3 text-sm font-medium text-gray-500">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <tr>
              <td className="py-3">
                <p className="font-medium text-gray-900">GR Kitchens</p>
              </td>
              <td className="py-3 text-gray-600">12,450</td>
              <td className="py-3 text-gray-600">2.4 GB</td>
              <td className="py-3 text-gray-600">1</td>
              <td className="py-3">
                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded">
                  Normal
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Placeholder for Charts */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Usage Trends</h2>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg text-gray-500">
          📊 Usage trend charts will be displayed here
        </div>
      </div>
    </div>
  );
}
