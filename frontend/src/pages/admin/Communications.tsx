import { useState } from 'react';

export default function Communications() {
  const [showComposeModal, setShowComposeModal] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Communications</h1>
        <button
          onClick={() => setShowComposeModal(true)}
          className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors flex items-center gap-2"
        >
          <span>+</span>
          <span>New Announcement</span>
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-600">Announcements Sent</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">0</p>
          <p className="text-sm text-gray-500 mt-1">this month</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-600">Email Open Rate</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">--</p>
          <p className="text-sm text-gray-500 mt-1">no data yet</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-600">Recipients</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">2</p>
          <p className="text-sm text-gray-500 mt-1">total users</p>
        </div>
      </div>

      {/* Message Templates */}
      <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Message Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-gray-200 rounded-lg p-4 hover:border-violet-300 cursor-pointer transition-colors">
            <h3 className="font-medium text-gray-900">Welcome Message</h3>
            <p className="text-sm text-gray-500 mt-1">
              Onboarding email for new tenants
            </p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 hover:border-violet-300 cursor-pointer transition-colors">
            <h3 className="font-medium text-gray-900">Feature Update</h3>
            <p className="text-sm text-gray-500 mt-1">
              Announce new features and improvements
            </p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 hover:border-violet-300 cursor-pointer transition-colors">
            <h3 className="font-medium text-gray-900">Maintenance Notice</h3>
            <p className="text-sm text-gray-500 mt-1">
              Scheduled maintenance announcements
            </p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 hover:border-violet-300 cursor-pointer transition-colors">
            <h3 className="font-medium text-gray-900">Payment Reminder</h3>
            <p className="text-sm text-gray-500 mt-1">
              Subscription payment reminders
            </p>
          </div>
        </div>
      </div>

      {/* Message History */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Message History</h2>
        <div className="text-center py-12 text-gray-500">
          No messages sent yet. Click "New Announcement" to send your first message.
        </div>
      </div>

      {/* Compose Modal */}
      {showComposeModal && (
        <ComposeModal onClose={() => setShowComposeModal(false)} />
      )}
    </div>
  );
}

function ComposeModal({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    recipients: 'all',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Sending announcement:', formData);
    // TODO: Implement email sending
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg">
        <h2 className="text-xl font-bold text-gray-900 mb-4">New Announcement</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recipients
            </label>
            <select
              value={formData.recipients}
              onChange={(e) => setFormData({ ...formData, recipients: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
            >
              <option value="all">All Users (2)</option>
              <option value="owners">Tenant Owners Only (1)</option>
              <option value="gr-kitchens">GR Kitchens (1)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="e.g., New Feature: Sales Analytics"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Write your announcement..."
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
            >
              Send Announcement
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
