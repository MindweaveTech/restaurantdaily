'use client';

import { Clock, Users, CheckCircle, XCircle, Coffee } from 'lucide-react';
import { DashboardShell } from '@/components/dashboard';

export default function AttendanceTodayPage() {
  // Mock data for demonstration
  const todayStats = {
    present: 6,
    absent: 2,
    late: 1,
    onBreak: 1,
    total: 8,
  };

  const staffList = [
    { id: 1, name: 'Rahul Kumar', role: 'Chef', status: 'working', checkIn: '09:00 AM' },
    { id: 2, name: 'Priya Sharma', role: 'Server', status: 'working', checkIn: '09:15 AM' },
    { id: 3, name: 'Amit Singh', role: 'Server', status: 'break', checkIn: '09:05 AM' },
    { id: 4, name: 'Neha Patel', role: 'Cashier', status: 'working', checkIn: '08:55 AM' },
    { id: 5, name: 'Vikram Reddy', role: 'Chef', status: 'working', checkIn: '09:00 AM' },
    { id: 6, name: 'Anjali Gupta', role: 'Server', status: 'working', checkIn: '09:30 AM' },
    { id: 7, name: 'Ravi Verma', role: 'Cleaner', status: 'absent', checkIn: '-' },
    { id: 8, name: 'Sunita Devi', role: 'Helper', status: 'absent', checkIn: '-' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'working': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'break': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'absent': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-white/10 text-white/60';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'working': return <CheckCircle className="h-4 w-4" />;
      case 'break': return <Coffee className="h-4 w-4" />;
      case 'absent': return <XCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Today&apos;s Attendance</h1>
          <p className="text-white/60 mt-1">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <CheckCircle className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{todayStats.present}</p>
                <p className="text-sm text-white/60">Present</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/20">
                <XCircle className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{todayStats.absent}</p>
                <p className="text-sm text-white/60">Absent</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/20">
                <Coffee className="h-5 w-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{todayStats.onBreak}</p>
                <p className="text-sm text-white/60">On Break</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Users className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{todayStats.total}</p>
                <p className="text-sm text-white/60">Total Staff</p>
              </div>
            </div>
          </div>
        </div>

        {/* Staff List */}
        <div className="glass-card">
          <div className="p-4 border-b border-white/10">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Staff Status
            </h2>
          </div>
          <div className="divide-y divide-white/5">
            {staffList.map((staff) => (
              <div key={staff.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <span className="text-white font-medium">{staff.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-medium text-white">{staff.name}</p>
                    <p className="text-sm text-white/50">{staff.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-white/60">{staff.checkIn}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 ${getStatusColor(staff.status)}`}>
                    {getStatusIcon(staff.status)}
                    {staff.status.charAt(0).toUpperCase() + staff.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
