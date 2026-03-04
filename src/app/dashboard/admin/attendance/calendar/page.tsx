'use client';

import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { DashboardShell } from '@/components/dashboard';
import { useState } from 'react';

export default function AttendanceCalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  // Mock attendance data
  const attendanceData: Record<number, { present: number; total: number }> = {
    1: { present: 8, total: 8 },
    2: { present: 7, total: 8 },
    3: { present: 6, total: 8 },
    4: { present: 8, total: 8 },
  };

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Attendance Calendar</h1>
            <p className="text-white/60 mt-1">Monthly attendance overview</p>
          </div>
        </div>

        {/* Calendar */}
        <div className="glass-card">
          {/* Month Navigation */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
              className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              {currentMonth.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
            </h2>
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
              className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="p-4">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-white/50 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Days */}
            <div className="grid grid-cols-7 gap-1">
              {emptyDays.map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}
              {days.map((day) => {
                const data = attendanceData[day];
                const percentage = data ? Math.round((data.present / data.total) * 100) : null;
                const isToday = day === new Date().getDate() && currentMonth.getMonth() === new Date().getMonth();

                return (
                  <div
                    key={day}
                    className={`aspect-square p-1 rounded-lg border transition-colors cursor-pointer ${
                      isToday
                        ? 'border-primary bg-primary/10'
                        : 'border-white/5 hover:border-white/20 hover:bg-white/5'
                    }`}
                  >
                    <div className="h-full flex flex-col items-center justify-center">
                      <span className={`text-sm font-medium ${isToday ? 'text-primary' : 'text-white'}`}>
                        {day}
                      </span>
                      {percentage !== null && (
                        <span className={`text-xs mt-0.5 ${
                          percentage >= 90 ? 'text-green-400' :
                          percentage >= 75 ? 'text-yellow-400' :
                          'text-red-400'
                        }`}>
                          {percentage}%
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="p-4 border-t border-white/10 flex items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <span className="text-sm text-white/60">90%+ Present</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <span className="text-sm text-white/60">75-89% Present</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <span className="text-sm text-white/60">&lt;75% Present</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
