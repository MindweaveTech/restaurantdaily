'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ChefHat, Clock, FileText, TrendingUp, User, Building2, CheckCircle, HelpCircle } from 'lucide-react';
import { CheckInCard } from '@/components/attendance';

interface StaffInfo {
  phone: string;
  role: string;
  restaurant_id?: string;
  restaurant_name?: string;
  status?: string;
}

interface StaffStats {
  todayHours: number;
  activeSessions: number;
  myVouchers: number;
}

export default function StaffDashboard() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<StaffInfo | null>(null);
  const [stats, setStats] = useState<StaffStats>({ todayHours: 0, activeSessions: 0, myVouchers: 0 });
  const [loading, setLoading] = useState(true);
  const [showCashSessionModal, setShowCashSessionModal] = useState(false);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showRestaurantInfoModal, setShowRestaurantInfoModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const fetchStats = useCallback(async (token: string) => {
    try {
      // Fetch attendance status to calculate today's hours
      const attendanceRes = await fetch('/api/attendance/status', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (attendanceRes.ok) {
        const attendanceData = await attendanceRes.json();
        if (attendanceData.attendance?.check_in_time) {
          const checkIn = new Date(attendanceData.attendance.check_in_time);
          const now = new Date();
          const hoursWorked = (now.getTime() - checkIn.getTime()) / (1000 * 60 * 60);
          setStats(prev => ({ ...prev, todayHours: Math.round(hoursWorked * 10) / 10 }));
        }
      }

      // Fetch active cash sessions
      const sessionsRes = await fetch('/api/cash-sessions?status=active&limit=10', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (sessionsRes.ok) {
        const sessionsData = await sessionsRes.json();
        setStats(prev => ({ ...prev, activeSessions: sessionsData.sessions?.length || 0 }));
      }

      // Fetch user's vouchers
      const vouchersRes = await fetch('/api/vouchers?limit=100', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (vouchersRes.ok) {
        const vouchersData = await vouchersRes.json();
        setStats(prev => ({ ...prev, myVouchers: vouchersData.total || 0 }));
      }
    } catch (error) {
      // Stats are non-critical, silently fail
      void error;
    }
  }, []);

  useEffect(() => {
    // Get user info from JWT token
    const token = localStorage.getItem('auth_token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserInfo(payload);
        fetchStats(token);
      } catch {
        // Token parsing failed
      }
    }
    setLoading(false);
  }, [fetchStats]);

  // Action handlers
  const handleStartSession = () => setShowCashSessionModal(true);
  const handleNewVoucher = () => setShowVoucherModal(true);
  const handleRecordPayment = () => setShowPaymentModal(true);
  const handleViewProfile = () => router.push('/dashboard/staff/profile');
  const handleViewRestaurantInfo = () => setShowRestaurantInfoModal(true);
  const handleGetHelp = () => setShowHelpModal(true);
  const handleStartWorking = () => setShowCashSessionModal(true);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Loading Dashboard...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <ChefHat className="h-8 w-8 text-orange-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {userInfo?.restaurant_name || 'Restaurant Daily'}
                </h1>
                <p className="text-sm text-gray-600">
                  Staff Dashboard • {userInfo?.phone}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center px-3 py-1 bg-green-100 rounded-full">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                <span className="text-sm font-medium text-green-700 capitalize">
                  {userInfo?.role || 'Staff'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Message */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white mb-8">
          <h2 className="text-2xl font-bold mb-2">
            Welcome to the team! 🎉
          </h2>
          <p className="opacity-90">
            You&apos;re now part of {userInfo?.restaurant_name}. Track your daily tasks and contribute to restaurant performance.
          </p>
        </div>

        {/* Check-in Card - Primary Action */}
        <div className="mb-8">
          <CheckInCard />
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today&apos;s Hours</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.todayHours}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Sessions</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.activeSessions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <FileText className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">My Vouchers</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.myVouchers}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Start Cash Session */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 ml-3">Cash Session</h3>
            </div>
            <p className="text-gray-600 mb-4 text-sm">
              Start or end your cash handling session with opening and closing balance tracking.
            </p>
            <button
              onClick={handleStartSession}
              className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Clock className="h-4 w-4 mr-2" />
              Start Session
            </button>
          </div>

          {/* Submit Voucher */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <FileText className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 ml-3">Petty Voucher</h3>
            </div>
            <p className="text-gray-600 mb-4 text-sm">
              Submit expense vouchers for small purchases and get them approved by your admin.
            </p>
            <button
              onClick={handleNewVoucher}
              className="w-full flex items-center justify-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              <FileText className="h-4 w-4 mr-2" />
              New Voucher
            </button>
          </div>

          {/* Record Payment */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 ml-3">Electricity Payment</h3>
            </div>
            <p className="text-gray-600 mb-4 text-sm">
              Record electricity bill payments and track utility expenses for the restaurant.
            </p>
            <button
              onClick={handleRecordPayment}
              className="w-full flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Record Payment
            </button>
          </div>

          {/* My Profile */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 ml-3">My Profile</h3>
            </div>
            <p className="text-gray-600 mb-4 text-sm">
              View and update your profile information and contact details.
            </p>
            <button
              onClick={handleViewProfile}
              className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <User className="h-4 w-4 mr-2" />
              View Profile
            </button>
          </div>

          {/* Restaurant Info */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Building2 className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 ml-3">Restaurant Info</h3>
            </div>
            <p className="text-gray-600 mb-4 text-sm">
              View restaurant details, contact information, and operating procedures.
            </p>
            <button
              onClick={handleViewRestaurantInfo}
              className="w-full flex items-center justify-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              <Building2 className="h-4 w-4 mr-2" />
              View Info
            </button>
          </div>

          {/* Help & Support */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-gray-100 rounded-lg">
                <HelpCircle className="h-6 w-6 text-gray-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 ml-3">Help & Support</h3>
            </div>
            <p className="text-gray-600 mb-4 text-sm">
              Get help with Restaurant Daily features and contact support if needed.
            </p>
            <button
              onClick={handleGetHelp}
              className="w-full flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <HelpCircle className="h-4 w-4 mr-2" />
              Get Help
            </button>
          </div>
        </div>

        {/* Recent Activity (Empty State) */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          </div>
          <div className="p-12 text-center">
            <div className="p-4 bg-gray-100 rounded-full w-fit mx-auto mb-4">
              <Clock className="h-8 w-8 text-gray-400" />
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">Ready to get started!</h4>
            <p className="text-gray-600 mb-4">
              Welcome to the team! Start by opening a cash session or submitting your first voucher.
            </p>
            <button
              onClick={handleStartWorking}
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Start Working
            </button>
          </div>
        </div>
      </main>

      {/* Cash Session Modal */}
      {showCashSessionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Start Cash Session</h3>
            <p className="text-gray-600 mb-4">
              Cash session functionality coming soon. Track your opening and closing balances.
            </p>
            <button
              onClick={() => setShowCashSessionModal(false)}
              className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Voucher Modal */}
      {showVoucherModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">New Petty Voucher</h3>
            <p className="text-gray-600 mb-4">
              Voucher submission functionality coming soon. Submit expense requests for approval.
            </p>
            <button
              onClick={() => setShowVoucherModal(false)}
              className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Record Payment</h3>
            <p className="text-gray-600 mb-4">
              Payment recording functionality coming soon. Track electricity and utility payments.
            </p>
            <button
              onClick={() => setShowPaymentModal(false)}
              className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Restaurant Info Modal */}
      {showRestaurantInfoModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Restaurant Information</h3>
            <div className="space-y-3 text-gray-600">
              <p><strong>Name:</strong> {userInfo?.restaurant_name || 'Restaurant Daily'}</p>
              <p><strong>Your Role:</strong> {userInfo?.role || 'Staff'}</p>
              <p><strong>Your Phone:</strong> {userInfo?.phone}</p>
            </div>
            <button
              onClick={() => setShowRestaurantInfoModal(false)}
              className="w-full mt-4 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Help & Support</h3>
            <div className="space-y-3 text-gray-600">
              <p>Need help with Restaurant Daily?</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Contact your restaurant admin for assistance</li>
                <li>Check-in/out to track your attendance</li>
                <li>Submit vouchers for expense reimbursements</li>
              </ul>
            </div>
            <button
              onClick={() => setShowHelpModal(false)}
              className="w-full mt-4 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}