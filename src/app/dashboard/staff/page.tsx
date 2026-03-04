'use client';

import { useState, useEffect } from 'react';
import { ChefHat, Clock, FileText, TrendingUp, User, Building2, CheckCircle } from 'lucide-react';
import { CheckInCard } from '@/components/attendance';

interface StaffInfo {
  phone: string;
  role: string;
  restaurant_id?: string;
  restaurant_name?: string;
  status?: string;
}

export default function StaffDashboard() {
  const [userInfo, setUserInfo] = useState<StaffInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user info from JWT token
    const token = localStorage.getItem('auth_token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserInfo(payload);
      } catch (error) {
        console.error('Error parsing token:', error);
      }
    }
    setLoading(false);
  }, []);

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
                <p className="text-2xl font-semibold text-gray-900">0</p>
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
                <p className="text-2xl font-semibold text-gray-900">0</p>
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
                <p className="text-2xl font-semibold text-gray-900">0</p>
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
            <button className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
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
            <button className="w-full flex items-center justify-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors">
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
            <button className="w-full flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
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
            <button className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
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
            <button className="w-full flex items-center justify-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
              <Building2 className="h-4 w-4 mr-2" />
              View Info
            </button>
          </div>

          {/* Help & Support */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-gray-100 rounded-lg">
                <ChefHat className="h-6 w-6 text-gray-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 ml-3">Help & Support</h3>
            </div>
            <p className="text-gray-600 mb-4 text-sm">
              Get help with Restaurant Daily features and contact support if needed.
            </p>
            <button className="w-full flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
              <ChefHat className="h-4 w-4 mr-2" />
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
            <button className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
              Start Working
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}