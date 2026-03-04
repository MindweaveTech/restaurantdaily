'use client';

import { useState, useEffect } from 'react';
import { ChefHat, Clock, FileText, TrendingUp, User, Building2, CheckCircle, Sparkles, LogOut } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { CheckInCard } from '@/components/attendance';
import { PageLayout } from '@/components/ui/page-layout';
import { GlassCard, GlassButton, GlassIconBadge } from '@/components/ui/glass-card';

interface StaffInfo {
  phone: string;
  role: string;
  restaurant_id?: string;
  restaurant_name?: string;
  status?: string;
}

export default function StaffDashboard() {
  const router = useRouter();
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

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    router.push('/auth/phone');
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="flex-1 flex items-center justify-center">
          <div className="glass-card p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-white/20 border-t-orange-500 mx-auto mb-4" />
            <p className="text-white font-medium">Loading Dashboard...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      {/* Header */}
      <header className="glass-card mx-4 mt-4 sm:mx-6 sm:mt-6 rounded-2xl border-white/10">
        <div className="px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Image
                src="/logo.svg"
                alt="Restaurant Daily"
                width={32}
                height={32}
                className="w-8 h-8 mr-3"
              />
              <div>
                <h1 className="text-xl font-bold text-white">
                  {userInfo?.restaurant_name || 'Restaurant Daily'}
                </h1>
                <p className="text-sm text-white/50">
                  Staff Dashboard
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center px-3 py-1.5 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                <CheckCircle className="h-4 w-4 text-emerald-400 mr-2" />
                <span className="text-sm font-medium text-emerald-300 capitalize">
                  {userInfo?.role || 'Staff'}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all"
                title="Log out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 sm:px-6 sm:py-8 max-w-6xl">
        {/* Welcome Message */}
        <div className="glass-card p-6 mb-8 border-orange-500/20">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent pointer-events-none rounded-3xl" />
          <div className="relative flex items-start gap-4">
            <div className="hidden sm:block">
              <GlassIconBadge icon={<Sparkles className="h-6 w-6" />} variant="orange" size="lg" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                Welcome to the team!
              </h2>
              <p className="text-white/60">
                You&apos;re now part of {userInfo?.restaurant_name}. Track your daily tasks and contribute to restaurant performance.
              </p>
            </div>
          </div>
        </div>

        {/* Check-in Card - Primary Action */}
        <div className="mb-8">
          <CheckInCard />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <GlassCard size="md" variant="default" className="border-blue-500/20">
            <div className="flex items-center">
              <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20">
                <Clock className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-white/50">Today&apos;s Hours</p>
                <p className="text-2xl font-semibold text-white">0</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard size="md" variant="default" className="border-emerald-500/20">
            <div className="flex items-center">
              <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                <TrendingUp className="h-6 w-6 text-emerald-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-white/50">Active Sessions</p>
                <p className="text-2xl font-semibold text-white">0</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard size="md" variant="default" className="border-amber-500/20">
            <div className="flex items-center">
              <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/20">
                <FileText className="h-6 w-6 text-amber-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-white/50">My Vouchers</p>
                <p className="text-2xl font-semibold text-white">0</p>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
          {/* Start Cash Session */}
          <GlassCard size="md" variant="default" hoverable className="group">
            <div className="flex items-center mb-4">
              <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-colors">
                <Clock className="h-6 w-6 text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold text-white ml-3">Cash Session</h3>
            </div>
            <p className="text-white/50 mb-4 text-sm">
              Start or end your cash handling session with opening and closing balance tracking.
            </p>
            <GlassButton variant="success" size="sm" className="w-full" leftIcon={<Clock className="h-4 w-4" />}>
              Start Session
            </GlassButton>
          </GlassCard>

          {/* Submit Voucher */}
          <GlassCard size="md" variant="default" hoverable className="group">
            <div className="flex items-center mb-4">
              <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/20 group-hover:bg-amber-500/20 transition-colors">
                <FileText className="h-6 w-6 text-amber-400" />
              </div>
              <h3 className="text-lg font-semibold text-white ml-3">Petty Voucher</h3>
            </div>
            <p className="text-white/50 mb-4 text-sm">
              Submit expense vouchers for small purchases and get them approved by your admin.
            </p>
            <GlassButton variant="primary" size="sm" className="w-full bg-gradient-to-r from-amber-500 to-amber-600 shadow-amber-500/25 hover:shadow-amber-500/40" leftIcon={<FileText className="h-4 w-4" />}>
              New Voucher
            </GlassButton>
          </GlassCard>

          {/* Record Payment */}
          <GlassCard size="md" variant="default" hoverable className="group">
            <div className="flex items-center mb-4">
              <div className="p-2.5 bg-purple-500/10 rounded-xl border border-purple-500/20 group-hover:bg-purple-500/20 transition-colors">
                <TrendingUp className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white ml-3">Electricity Payment</h3>
            </div>
            <p className="text-white/50 mb-4 text-sm">
              Record electricity bill payments and track utility expenses for the restaurant.
            </p>
            <GlassButton variant="secondary" size="sm" className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-purple-500/25 hover:shadow-purple-500/40" leftIcon={<TrendingUp className="h-4 w-4" />}>
              Record Payment
            </GlassButton>
          </GlassCard>

          {/* My Profile */}
          <GlassCard size="md" variant="default" hoverable className="group">
            <div className="flex items-center mb-4">
              <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20 group-hover:bg-blue-500/20 transition-colors">
                <User className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white ml-3">My Profile</h3>
            </div>
            <p className="text-white/50 mb-4 text-sm">
              View and update your profile information and contact details.
            </p>
            <GlassButton variant="secondary" size="sm" className="w-full" leftIcon={<User className="h-4 w-4" />}>
              View Profile
            </GlassButton>
          </GlassCard>

          {/* Restaurant Info */}
          <GlassCard size="md" variant="default" hoverable className="group">
            <div className="flex items-center mb-4">
              <div className="p-2.5 bg-orange-500/10 rounded-xl border border-orange-500/20 group-hover:bg-orange-500/20 transition-colors">
                <Building2 className="h-6 w-6 text-orange-400" />
              </div>
              <h3 className="text-lg font-semibold text-white ml-3">Restaurant Info</h3>
            </div>
            <p className="text-white/50 mb-4 text-sm">
              View restaurant details, contact information, and operating procedures.
            </p>
            <GlassButton variant="primary" size="sm" className="w-full" leftIcon={<Building2 className="h-4 w-4" />}>
              View Info
            </GlassButton>
          </GlassCard>

          {/* Help & Support */}
          <GlassCard size="md" variant="default" hoverable className="group">
            <div className="flex items-center mb-4">
              <div className="p-2.5 bg-white/5 rounded-xl border border-white/10 group-hover:bg-white/10 transition-colors">
                <ChefHat className="h-6 w-6 text-white/70" />
              </div>
              <h3 className="text-lg font-semibold text-white ml-3">Help & Support</h3>
            </div>
            <p className="text-white/50 mb-4 text-sm">
              Get help with Restaurant Daily features and contact support if needed.
            </p>
            <GlassButton variant="ghost" size="sm" className="w-full bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10" leftIcon={<ChefHat className="h-4 w-4" />}>
              Get Help
            </GlassButton>
          </GlassCard>
        </div>

        {/* Recent Activity (Empty State) */}
        <GlassCard size="lg" variant="default">
          <div className="border-b border-white/10 pb-4 mb-6">
            <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
          </div>
          <div className="py-8 text-center">
            <div className="p-4 bg-white/5 rounded-2xl w-fit mx-auto mb-4 border border-white/10">
              <Clock className="h-8 w-8 text-white/30" />
            </div>
            <h4 className="text-lg font-medium text-white mb-2">Ready to get started!</h4>
            <p className="text-white/50 mb-6 max-w-md mx-auto">
              Welcome to the team! Start by opening a cash session or submitting your first voucher.
            </p>
            <GlassButton variant="primary">
              Start Working
            </GlassButton>
          </div>
        </GlassCard>
      </main>
    </PageLayout>
  );
}
