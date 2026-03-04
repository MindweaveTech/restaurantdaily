'use client';

import { FileText, Download, Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { DashboardShell } from '@/components/dashboard';

export default function PayrollReportsPage() {
  const reports = [
    { id: 1, name: 'Monthly Payroll Summary', period: 'March 2026', generated: '2026-03-01', size: '245 KB' },
    { id: 2, name: 'Monthly Payroll Summary', period: 'February 2026', generated: '2026-02-01', size: '238 KB' },
    { id: 3, name: 'Quarterly Tax Report', period: 'Q4 2025', generated: '2026-01-15', size: '512 KB' },
    { id: 4, name: 'Monthly Payroll Summary', period: 'January 2026', generated: '2026-01-01', size: '242 KB' },
    { id: 5, name: 'Annual Payroll Report', period: '2025', generated: '2026-01-01', size: '1.2 MB' },
  ];

  const monthlyTrend = [
    { month: 'Oct', amount: 225000 },
    { month: 'Nov', amount: 232000 },
    { month: 'Dec', amount: 248000 },
    { month: 'Jan', amount: 238000 },
    { month: 'Feb', amount: 242000 },
    { month: 'Mar', amount: 245000 },
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
            <h1 className="text-2xl font-bold text-white">Payroll Reports</h1>
            <p className="text-white/60 mt-1">Generate and download payroll reports</p>
          </div>
          <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Generate New Report
          </button>
        </div>

        {/* Trend Chart (simplified) */}
        <div className="glass-card p-6">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Payroll Trend (Last 6 Months)
          </h3>
          <div className="flex items-end justify-between h-40 gap-2">
            {monthlyTrend.map((item, index) => {
              const maxAmount = Math.max(...monthlyTrend.map(m => m.amount));
              const height = (item.amount / maxAmount) * 100;
              const prevAmount = index > 0 ? monthlyTrend[index - 1].amount : item.amount;
              const isUp = item.amount >= prevAmount;

              return (
                <div key={item.month} className="flex-1 flex flex-col items-center gap-2">
                  <div className="text-xs text-white/60">{formatCurrency(item.amount)}</div>
                  <div
                    className={`w-full rounded-t-lg transition-all ${isUp ? 'bg-green-500/60' : 'bg-red-500/60'}`}
                    style={{ height: `${height}%` }}
                  />
                  <div className="text-sm text-white/70">{item.month}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Reports List */}
        <div className="glass-card overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Available Reports
            </h2>
          </div>
          <div className="divide-y divide-white/5">
            {reports.map((report) => (
              <div key={report.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-white/5">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-white">{report.name}</p>
                    <p className="text-sm text-white/50 flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      {report.period} • {report.size}
                    </p>
                  </div>
                </div>
                <button className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Download
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
