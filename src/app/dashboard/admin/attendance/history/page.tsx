'use client';

import { History, Calendar, Download, Filter } from 'lucide-react';
import { DashboardShell } from '@/components/dashboard';

export default function AttendanceHistoryPage() {
  const historyData = [
    { date: '2026-03-03', present: 7, absent: 1, total: 8 },
    { date: '2026-03-02', present: 8, absent: 0, total: 8 },
    { date: '2026-03-01', present: 6, absent: 2, total: 8 },
    { date: '2026-02-28', present: 7, absent: 1, total: 8 },
    { date: '2026-02-27', present: 8, absent: 0, total: 8 },
  ];

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Attendance History</h1>
            <p className="text-white/60 mt-1">View past attendance records</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </button>
            <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>

        {/* History Table */}
        <div className="glass-card overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              Recent Records
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-4 text-white/60 font-medium">Date</th>
                  <th className="text-center p-4 text-white/60 font-medium">Present</th>
                  <th className="text-center p-4 text-white/60 font-medium">Absent</th>
                  <th className="text-center p-4 text-white/60 font-medium">Total</th>
                  <th className="text-center p-4 text-white/60 font-medium">Attendance %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {historyData.map((row) => (
                  <tr key={row.date} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 text-white flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-white/40" />
                      {new Date(row.date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="p-4 text-center text-green-400">{row.present}</td>
                    <td className="p-4 text-center text-red-400">{row.absent}</td>
                    <td className="p-4 text-center text-white">{row.total}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        (row.present / row.total) * 100 >= 90 ? 'bg-green-500/20 text-green-400' :
                        (row.present / row.total) * 100 >= 75 ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {Math.round((row.present / row.total) * 100)}%
                      </span>
                    </td>
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
