'use client';

import { DollarSign, Users, Clock, TrendingUp, Download, Calendar } from 'lucide-react';
import { DashboardShell } from '@/components/dashboard';

export default function PayrollSummaryPage() {
  const payrollStats = {
    totalPayroll: 245000,
    totalStaff: 8,
    avgSalary: 30625,
    overtime: 12500,
  };

  const staffPayroll = [
    { name: 'Rahul Kumar', role: 'Chef', basePay: 35000, overtime: 3000, deductions: 2000, netPay: 36000 },
    { name: 'Priya Sharma', role: 'Server', basePay: 25000, overtime: 1500, deductions: 1500, netPay: 25000 },
    { name: 'Amit Singh', role: 'Server', basePay: 25000, overtime: 2000, deductions: 1500, netPay: 25500 },
    { name: 'Neha Patel', role: 'Cashier', basePay: 28000, overtime: 1000, deductions: 1800, netPay: 27200 },
    { name: 'Vikram Reddy', role: 'Chef', basePay: 38000, overtime: 2500, deductions: 2200, netPay: 38300 },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Pay Summary</h1>
            <p className="text-white/60 mt-1">March 2026 Payroll Overview</p>
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
                <p className="text-xl font-bold text-white">{formatCurrency(payrollStats.totalPayroll)}</p>
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
                <p className="text-xl font-bold text-white">{payrollStats.totalStaff}</p>
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
                <p className="text-xl font-bold text-white">{formatCurrency(payrollStats.avgSalary)}</p>
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
                <p className="text-xl font-bold text-white">{formatCurrency(payrollStats.overtime)}</p>
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
                  <th className="text-right p-4 text-white/60 font-medium">Base Pay</th>
                  <th className="text-right p-4 text-white/60 font-medium">Overtime</th>
                  <th className="text-right p-4 text-white/60 font-medium">Deductions</th>
                  <th className="text-right p-4 text-white/60 font-medium">Net Pay</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {staffPayroll.map((staff, index) => (
                  <tr key={index} className="hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div>
                        <p className="text-white font-medium">{staff.name}</p>
                        <p className="text-white/50 text-sm">{staff.role}</p>
                      </div>
                    </td>
                    <td className="p-4 text-right text-white">{formatCurrency(staff.basePay)}</td>
                    <td className="p-4 text-right text-green-400">+{formatCurrency(staff.overtime)}</td>
                    <td className="p-4 text-right text-red-400">-{formatCurrency(staff.deductions)}</td>
                    <td className="p-4 text-right text-white font-semibold">{formatCurrency(staff.netPay)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
