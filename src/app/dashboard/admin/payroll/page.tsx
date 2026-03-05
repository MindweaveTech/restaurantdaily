'use client';

import { DollarSign, Users, Clock, TrendingUp, Download, Calendar, Loader2 } from 'lucide-react';
import { DashboardShell } from '@/components/dashboard';
import { useState, useEffect } from 'react';

interface StaffPayroll {
  id: string;
  name: string;
  phone: string;
  role: string;
  daysPresent: number;
  totalHours: number;
  overtimeHours: number;
  basePay: number;
  overtimePay: number;
  netPay: number;
}

interface PayrollData {
  period: {
    month: string;
    startDate: string;
    endDate: string;
  };
  staff: StaffPayroll[];
  totals: {
    totalStaff: number;
    totalPayroll: number;
    totalOvertime: number;
    avgSalary: number;
  };
}

export default function PayrollSummaryPage() {
  const [payrollData, setPayrollData] = useState<PayrollData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPayroll() {
      try {
        const response = await fetch('/api/payroll/summary');
        const data = await response.json();

        if (data.success) {
          setPayrollData(data);
        } else {
          setError(data.error || 'Failed to fetch payroll');
        }
      } catch (err) {
        setError('Network error');
        console.error('Error fetching payroll:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchPayroll();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardShell>
    );
  }

  if (error || !payrollData) {
    return (
      <DashboardShell>
        <div className="glass-card p-8 text-center">
          <p className="text-red-400">{error || 'No payroll data available'}</p>
        </div>
      </DashboardShell>
    );
  }

  const { period, staff, totals } = payrollData;

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Pay Summary</h1>
            <p className="text-white/60 mt-1">{period.month}</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Select Period
            </button>
            <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <DollarSign className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-xl font-bold text-white">{formatCurrency(totals.totalPayroll)}</p>
                <p className="text-sm text-white/60">Total Payroll</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Users className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-xl font-bold text-white">{totals.totalStaff}</p>
                <p className="text-sm text-white/60">Staff Members</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <TrendingUp className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-xl font-bold text-white">{formatCurrency(totals.avgSalary)}</p>
                <p className="text-sm text-white/60">Avg. Salary</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/20">
                <Clock className="h-5 w-5 text-orange-400" />
              </div>
              <div>
                <p className="text-xl font-bold text-white">{formatCurrency(totals.totalOvertime)}</p>
                <p className="text-sm text-white/60">Overtime Pay</p>
              </div>
            </div>
          </div>
        </div>

        {/* Payroll Table */}
        <div className="glass-card overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Staff Payroll Details
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-4 text-white/60 font-medium">Staff</th>
                  <th className="text-right p-4 text-white/60 font-medium">Days</th>
                  <th className="text-right p-4 text-white/60 font-medium">Hours</th>
                  <th className="text-right p-4 text-white/60 font-medium">Base Pay</th>
                  <th className="text-right p-4 text-white/60 font-medium">Overtime</th>
                  <th className="text-right p-4 text-white/60 font-medium">Net Pay</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {staff.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-white/50">
                      No payroll data for this period
                    </td>
                  </tr>
                ) : (
                  staff.map((member) => (
                    <tr key={member.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <div>
                          <p className="text-white font-medium">{member.name}</p>
                          <p className="text-white/50 text-sm">{member.role}</p>
                        </div>
                      </td>
                      <td className="p-4 text-right text-white">{member.daysPresent}</td>
                      <td className="p-4 text-right text-white">{member.totalHours}h</td>
                      <td className="p-4 text-right text-white">{formatCurrency(member.basePay)}</td>
                      <td className="p-4 text-right text-green-400">
                        {member.overtimePay > 0 ? `+${formatCurrency(member.overtimePay)}` : '—'}
                      </td>
                      <td className="p-4 text-right text-white font-semibold">{formatCurrency(member.netPay)}</td>
                    </tr>
                  ))
                )}
              </tbody>
              {staff.length > 0 && (
                <tfoot>
                  <tr className="border-t border-white/10 bg-white/5">
                    <td className="p-4 font-semibold text-white">Total</td>
                    <td className="p-4 text-right text-white font-semibold">
                      {staff.reduce((sum, s) => sum + s.daysPresent, 0)}
                    </td>
                    <td className="p-4 text-right text-white font-semibold">
                      {staff.reduce((sum, s) => sum + s.totalHours, 0)}h
                    </td>
                    <td className="p-4 text-right text-white font-semibold">
                      {formatCurrency(staff.reduce((sum, s) => sum + s.basePay, 0))}
                    </td>
                    <td className="p-4 text-right text-green-400 font-semibold">
                      +{formatCurrency(staff.reduce((sum, s) => sum + s.overtimePay, 0))}
                    </td>
                    <td className="p-4 text-right text-white font-bold">
                      {formatCurrency(staff.reduce((sum, s) => sum + s.netPay, 0))}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
