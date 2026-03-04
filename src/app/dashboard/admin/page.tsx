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
  X
} from 'lucide-react';
import { DashboardShell, StatCard, AttendanceOverview } from '@/components/dashboard';
import StaffInvitationModal from '@/components/admin/StaffInvitationModal';
import { Button } from '@/components/ui/button';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [isInvitationModalOpen, setIsInvitationModalOpen] = useState(false);
  const [showWelcomeCard, setShowWelcomeCard] = useState(true);

  useEffect(() => {
    const welcomeDismissed = localStorage.getItem('welcomeCardDismissed');
    if (welcomeDismissed === 'true') {
      setShowWelcomeCard(false);
    }
    setLoading(false);
  }, []);

  const dismissWelcomeCard = () => {
    setShowWelcomeCard(false);
    localStorage.setItem('welcomeCardDismissed', 'true');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardShell>
      {/* Welcome Banner */}
      {showWelcomeCard && (
        <div className="relative mb-6 p-6 rounded-xl bg-gradient-to-r from-primary/20 via-primary/10 to-accent/20 border border-primary/20">
          <button
            onClick={dismissWelcomeCard}
            className="absolute top-4 right-4 p-1 rounded-full text-foreground/50 hover:text-foreground hover:bg-white/10 transition-colors"
            aria-label="Dismiss welcome message"
          >
            <X className="h-5 w-5" />
          </button>
          <h2 className="text-xl font-bold text-foreground mb-2 pr-8">
            Welcome to Restaurant Daily
          </h2>
          <p className="text-muted-foreground pr-8 max-w-2xl">
            Your restaurant management hub. Track attendance, manage staff schedules,
            and streamline payroll processing all in one place.
          </p>
          <div className="flex gap-3 mt-4">
            <Button
              onClick={() => setIsInvitationModalOpen(true)}
              className="gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Invite Staff
            </Button>
            <Button variant="outline" className="gap-2">
              <Settings className="h-4 w-4" />
              Configure Settings
            </Button>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Team Members"
          value="8"
          subtitle="2 new this month"
          icon={Users}
          trend={{ value: 12, label: 'vs last month' }}
          variant="primary"
        />
        <StatCard
          title="Present Today"
          value="6"
          subtitle="75% attendance"
          icon={Clock}
          variant="success"
        />
        <StatCard
          title="Total Hours"
          value="48.5"
          subtitle="Today's combined"
          icon={TrendingUp}
          variant="default"
        />
        <StatCard
          title="Overtime"
          value="₹2,340"
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
