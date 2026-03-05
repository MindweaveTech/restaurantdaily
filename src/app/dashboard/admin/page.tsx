'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  Clock,
  DollarSign,
  TrendingUp,
  Plus,
  FileText,
  Settings,
  UserPlus,
  X,
  Sparkles
} from 'lucide-react';
import { DashboardShell, StatCard, AttendanceOverview } from '@/components/dashboard';
import StaffInvitationModal from '@/components/admin/StaffInvitationModal';
import { Button } from '@/components/ui/button';

interface DashboardStats {
  totalStaff: number;
  newThisMonth: number;
  presentToday: number;
  attendanceRate: number;
  totalHoursToday: number;
  overtimePay: number;
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [isInvitationModalOpen, setIsInvitationModalOpen] = useState(false);
  const [showWelcomeCard, setShowWelcomeCard] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalStaff: 0,
    newThisMonth: 0,
    presentToday: 0,
    attendanceRate: 0,
    totalHoursToday: 0,
    overtimePay: 0,
  });

  useEffect(() => {
    const welcomeDismissed = localStorage.getItem('welcomeCardDismissed');
    if (welcomeDismissed === 'true') {
      setShowWelcomeCard(false);
    }

    // Fetch dashboard stats
    async function fetchStats() {
      try {
        const response = await fetch('/api/dashboard/stats');
        const data = await response.json();
        if (data.success) {
          setStats(data.stats);
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const dismissWelcomeCard = () => {
    setShowWelcomeCard(false);
    localStorage.setItem('welcomeCardDismissed', 'true');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-white/20 border-t-primary mx-auto mb-4"></div>
          <p className="text-foreground font-medium">Loading Dashboard...</p>
          <p className="text-muted-foreground text-sm mt-1">Preparing your workspace</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardShell>
      {/* Welcome Banner */}
      {showWelcomeCard && (
        <div className="glass-card relative mb-6 p-6 border-primary/20">
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-amber-500/5 to-transparent pointer-events-none rounded-[inherit]" />

          <button
            onClick={dismissWelcomeCard}
            className="absolute top-4 right-4 p-1.5 rounded-full text-foreground/50 hover:text-foreground hover:bg-white/10 transition-colors z-10"
            aria-label="Dismiss welcome message"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="relative flex items-start gap-4">
            <div className="hidden sm:block p-3 bg-gradient-to-br from-primary/20 to-amber-500/10 rounded-2xl border border-primary/20">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 pr-8">
              <h2 className="text-xl font-bold text-foreground mb-2">
                Welcome to Restaurant Daily
              </h2>
              <p className="text-muted-foreground max-w-2xl">
                Your restaurant management hub. Track attendance, manage staff schedules,
                and streamline payroll processing all in one place.
              </p>
              <div className="flex flex-wrap gap-3 mt-4">
                <Button
                  onClick={() => setIsInvitationModalOpen(true)}
                  className="gap-2 bg-gradient-to-r from-primary to-amber-600 hover:from-primary/90 hover:to-amber-600/90 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all"
                >
                  <UserPlus className="h-4 w-4" />
                  Invite Staff
                </Button>
                <Button variant="outline" className="gap-2 bg-white/5 border-white/10 hover:bg-white/10">
                  <Settings className="h-4 w-4" />
                  Configure Settings
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Team Members"
          value={String(stats.totalStaff)}
          subtitle={stats.newThisMonth > 0 ? `${stats.newThisMonth} new this month` : 'No new members'}
          icon={Users}
          variant="primary"
        />
        <StatCard
          title="Present Today"
          value={String(stats.presentToday)}
          subtitle={`${stats.attendanceRate}% attendance`}
          icon={Clock}
          variant="success"
        />
        <StatCard
          title="Total Hours"
          value={String(stats.totalHoursToday)}
          subtitle="Today's combined"
          icon={TrendingUp}
          variant="default"
        />
        <StatCard
          title="Overtime"
          value={`₹${stats.overtimePay.toLocaleString('en-IN')}`}
          subtitle="This month"
          icon={DollarSign}
          variant="warning"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Attendance Overview - Takes 2 columns */}
        <div className="lg:col-span-2">
          <AttendanceOverview />
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          {/* Quick Actions Card */}
          <div className="dash-card p-5">
            <h3 className="font-semibold text-foreground mb-4 flex items-center">
              <Plus className="h-4 w-4 mr-2 text-primary" />
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => setIsInvitationModalOpen(true)}
                className="w-full flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-left group"
              >
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500 group-hover:bg-blue-500/20 transition-colors">
                  <UserPlus className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">Invite Staff</p>
                  <p className="text-xs text-muted-foreground">Send SMS invitation</p>
                </div>
              </button>

              <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-left group">
                <div className="p-2 rounded-lg bg-green-500/10 text-green-500 group-hover:bg-green-500/20 transition-colors">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">View Sessions</p>
                  <p className="text-xs text-muted-foreground">Monitor active shifts</p>
                </div>
              </button>

              <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-left group">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 group-hover:bg-amber-500/20 transition-colors">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">Manage Vouchers</p>
                  <p className="text-xs text-muted-foreground">Review pending requests</p>
                </div>
              </button>

              <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-left group">
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500 group-hover:bg-purple-500/20 transition-colors">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">View Reports</p>
                  <p className="text-xs text-muted-foreground">Generate analytics</p>
                </div>
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="dash-card p-5">
            <h3 className="font-semibold text-foreground mb-4">Recent Activity</h3>
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted/50 mb-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">No recent activity</p>
              <p className="text-xs text-muted-foreground mt-1">
                Activity will appear here
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Staff Invitation Modal */}
      <StaffInvitationModal
        isOpen={isInvitationModalOpen}
        onClose={() => setIsInvitationModalOpen(false)}
      />
    </DashboardShell>
  );
}
