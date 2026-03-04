'use client';

import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import {
  Clock,
  Users,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Timer,
  TrendingUp
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  role?: string;
  checkInTime: string;
  checkOutTime?: string;
  hoursWorked?: number;
  overtime?: number;
  shortfall?: number;
  status: string;
  shiftHours?: number;
}

interface AttendanceSummary {
  totalStaff: number;
  checkedIn: number;
  checkedOut: number;
  absent: number;
  totalHoursToday: number;
  totalOvertimeToday: number;
}

interface AttendanceOverviewProps {
  className?: string;
}

export function AttendanceOverview({ className }: AttendanceOverviewProps) {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAttendance = useCallback(async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setError('Not authenticated');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/attendance/today', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch attendance');
      }

      setAttendance(data.attendance || []);
      setSummary(data.summary || null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch attendance');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAttendance();
    const interval = setInterval(fetchAttendance, 120000);
    return () => clearInterval(interval);
  }, [fetchAttendance]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAttendance();
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatHours = (hours?: number) => {
    if (hours === undefined || hours === null) return '-';
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  const getStatusBadge = (record: AttendanceRecord) => {
    const { status, overtime, shortfall } = record;

    if (status === 'checked_in') {
      return (
        <Badge variant="default" className="bg-green-500/10 text-green-500 border-green-500/20">
          <span className="relative flex h-2 w-2 mr-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          Working
        </Badge>
      );
    }

    if (status === 'checked_out') {
      if (overtime && overtime > 0) {
        return (
          <Badge variant="default" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
            <TrendingUp className="h-3 w-3 mr-1" />
            +{formatHours(overtime)} OT
          </Badge>
        );
      }
      if (shortfall && shortfall > 0) {
        return (
          <Badge variant="default" className="bg-amber-500/10 text-amber-500 border-amber-500/20">
            <AlertCircle className="h-3 w-3 mr-1" />
            -{formatHours(shortfall)}
          </Badge>
        );
      }
      return (
        <Badge variant="default" className="bg-muted text-muted-foreground">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Completed
        </Badge>
      );
    }

    if (status === 'late') {
      return (
        <Badge variant="default" className="bg-amber-500/10 text-amber-500 border-amber-500/20">
          <AlertCircle className="h-3 w-3 mr-1" />
          Late
        </Badge>
      );
    }

    if (status === 'absent') {
      return (
        <Badge variant="default" className="bg-red-500/10 text-red-500 border-red-500/20">
          <XCircle className="h-3 w-3 mr-1" />
          Absent
        </Badge>
      );
    }

    return (
      <Badge variant="secondary">
        {status}
      </Badge>
    );
  };

  const getRoleBadge = (role?: string) => {
    if (!role) return null;

    const roleColors: Record<string, string> = {
      'RM': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      'SM': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      'TM': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      'Day Shift': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    };

    return (
      <span className={cn(
        "text-xs px-1.5 py-0.5 rounded border",
        roleColors[role] || 'bg-muted text-muted-foreground'
      )}>
        {role}
      </span>
    );
  };

  if (loading) {
    return (
      <div className={cn("dash-card", className)}>
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("dash-card overflow-hidden", className)}>
      {/* Header */}
      <div className="p-4 md:p-5 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Today&apos;s Attendance</h3>
              <p className="text-xs text-muted-foreground">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-50"
          >
            <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
          </button>
        </div>

        {/* Summary Stats */}
        {summary && (
          <div className="grid grid-cols-4 gap-3 mt-4">
            <div className="text-center p-2.5 rounded-lg bg-muted/50">
              <p className="text-xl font-bold text-foreground">{summary.totalStaff}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
            <div className="text-center p-2.5 rounded-lg bg-green-500/10">
              <p className="text-xl font-bold text-green-500">{summary.checkedIn}</p>
              <p className="text-xs text-muted-foreground">Working</p>
            </div>
            <div className="text-center p-2.5 rounded-lg bg-blue-500/10">
              <p className="text-xl font-bold text-blue-500">{summary.checkedOut}</p>
              <p className="text-xs text-muted-foreground">Done</p>
            </div>
            <div className="text-center p-2.5 rounded-lg bg-red-500/10">
              <p className="text-xl font-bold text-red-500">{summary.absent}</p>
              <p className="text-xs text-muted-foreground">Absent</p>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-4 mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Attendance List */}
      <div className="divide-y divide-border/50">
        {attendance.length === 0 ? (
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted/50 mb-4">
              <Clock className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-foreground font-medium">No attendance records yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Staff will appear here when they check in
            </p>
          </div>
        ) : (
          attendance.map((record) => (
            <div
              key={record.id}
              className="p-4 hover:bg-accent/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                    {record.userName?.charAt(0).toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground truncate">
                      {record.userName || 'Unknown'}
                    </p>
                    {getRoleBadge(record.role)}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Timer className="h-3 w-3" />
                    <span>
                      {formatTime(record.checkInTime)}
                      {record.checkOutTime && ` → ${formatTime(record.checkOutTime)}`}
                    </span>
                    {record.hoursWorked !== undefined && (
                      <>
                        <span className="text-border">•</span>
                        <span className="font-medium text-foreground/80">
                          {formatHours(record.hoursWorked)}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Status Badge */}
                <div className="shrink-0">
                  {getStatusBadge(record)}
                </div>
              </div>

              {/* Progress bar for active sessions */}
              {record.status === 'checked_in' && record.shiftHours && (
                <div className="mt-3 ml-13">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>Shift Progress</span>
                    <span>
                      {formatHours(record.hoursWorked)} / {record.shiftHours}h
                    </span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, ((record.hoursWorked || 0) / record.shiftHours) * 100)}%`
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
