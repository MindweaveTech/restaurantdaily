export default function Billing() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Billing & Subscriptions</h1>

      {/* Revenue Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">₹0</p>
          <p className="text-sm text-gray-500 mt-1">MRR</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-600">Active Subscriptions</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">0</p>
          <p className="text-sm text-gray-500 mt-1">paid plans</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-600">Free Trials</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">1</p>
          <p className="text-sm text-gray-500 mt-1">active trials</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-600">Pending Invoices</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">₹0</p>
          <p className="text-sm text-gray-500 mt-1">0 invoices</p>
        </div>
      </div>

      {/* Subscription Plans */}
      <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Subscription Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900">Starter</h3>
            <p className="text-2xl font-bold text-gray-900 mt-2">₹999<span className="text-sm font-normal text-gray-500">/mo</span></p>
            <ul className="mt-4 space-y-2 text-sm text-gray-600">
              <li>• Up to 3 users</li>
              <li>• Basic reports</li>
              <li>• Email support</li>
            </ul>
            <p className="mt-4 text-sm text-gray-500">0 tenants on this plan</p>
          </div>
          <div className="border-2 border-violet-500 rounded-lg p-4 relative">
            <span className="absolute -top-3 left-4 bg-violet-500 text-white text-xs px-2 py-1 rounded">Popular</span>
            <h3 className="font-semibold text-gray-900">Pro</h3>
            <p className="text-2xl font-bold text-gray-900 mt-2">₹2,499<span className="text-sm font-normal text-gray-500">/mo</span></p>
            <ul className="mt-4 space-y-2 text-sm text-gray-600">
              <li>• Up to 10 users</li>
              <li>• Advanced analytics</li>
              <li>• Priority support</li>
              <li>• API access</li>
            </ul>
            <p className="mt-4 text-sm text-gray-500">0 tenants on this plan</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900">Enterprise</h3>
            <p className="text-2xl font-bold text-gray-900 mt-2">Custom</p>
            <ul className="mt-4 space-y-2 text-sm text-gray-600">
              <li>• Unlimited users</li>
              <li>• Custom integrations</li>
              <li>• Dedicated support</li>
              <li>• SLA guarantee</li>
            </ul>
            <p className="mt-4 text-sm text-gray-500">0 tenants on this plan</p>
          </div>
        </div>
      </div>

      {/* Recent Invoices */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Invoices</h2>
        <div className="text-center py-12 text-gray-500">
          No invoices yet. Invoices will appear here when tenants upgrade to paid plans.
        </div>
      </div>
    </div>
  );
}
