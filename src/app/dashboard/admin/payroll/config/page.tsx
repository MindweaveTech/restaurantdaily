'use client';

import { Calculator, Save, Plus, Trash2, Loader2 } from 'lucide-react';
import { DashboardShell } from '@/components/dashboard';
import { useState, useEffect } from 'react';

interface Role {
  id: number;
  name: string;
  baseSalary: number;
  shiftHours: number;
  paidLeaves: number;
  staffCount?: number;
}

export default function SalaryConfigPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRoles() {
      try {
        const response = await fetch('/api/payroll/roles');
        const data = await response.json();

        if (data.success) {
          setRoles(data.roles);
        } else {
          setError(data.error || 'Failed to fetch roles');
        }
      } catch (err) {
        setError('Network error');
        console.error('Error fetching roles:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchRoles();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate hourly rate: (Monthly / Days in Month) / Shift Hours
  const calculateHourlyRate = (salary: number, shiftHours: number) => {
    const dailyRate = salary / 28; // Feb has 28 days
    return Math.round(dailyRate / shiftHours);
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

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Salary Configuration</h1>
            <p className="text-white/60 mt-1">Role-based pay structure</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Role
            </button>
            <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground flex items-center gap-2">
              <Save className="h-4 w-4" />
              Save Changes
            </button>
          </div>
        </div>

        {/* Pay Rules Info */}
        <div className="glass-card p-4">
          <h3 className="font-medium text-white mb-3">Pay Calculation Rules</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="p-3 bg-white/5 rounded-lg">
              <p className="text-white/60">Daily Rate</p>
              <p className="text-white font-mono">Monthly Salary ÷ Days in Month</p>
            </div>
            <div className="p-3 bg-white/5 rounded-lg">
              <p className="text-white/60">Hourly Rate (OT)</p>
              <p className="text-white font-mono">Daily Rate ÷ Shift Hours</p>
            </div>
            <div className="p-3 bg-white/5 rounded-lg">
              <p className="text-white/60">Paid Leave Allowance</p>
              <p className="text-white font-mono">4 days per month (compensable if unused)</p>
            </div>
          </div>
        </div>

        {/* Configuration Table */}
        <div className="glass-card overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              Role-based Salary Structure
            </h2>
          </div>
          {error ? (
            <div className="p-8 text-center text-red-400">{error}</div>
          ) : roles.length === 0 ? (
            <div className="p-8 text-center text-white/50">
              No roles configured. Add staff members to see role-based salary structure.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 text-white/60 font-medium">Role</th>
                    <th className="text-right p-4 text-white/60 font-medium">Monthly Salary</th>
                    <th className="text-right p-4 text-white/60 font-medium">Shift Hours</th>
                    <th className="text-right p-4 text-white/60 font-medium">Hourly Rate (OT)</th>
                    <th className="text-right p-4 text-white/60 font-medium">Paid Leaves</th>
                    <th className="text-center p-4 text-white/60 font-medium">Staff</th>
                    <th className="text-center p-4 text-white/60 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {roles.map((role) => (
                    <tr key={role.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <span className="text-white font-medium">{role.name}</span>
                      </td>
                      <td className="p-4 text-right">
                        <span className="text-white font-mono">{formatCurrency(role.baseSalary)}</span>
                      </td>
                      <td className="p-4 text-right">
                        <span className="text-white">{role.shiftHours}h</span>
                      </td>
                      <td className="p-4 text-right">
                        <span className="text-green-400 font-mono">{formatCurrency(calculateHourlyRate(role.baseSalary, role.shiftHours))}/hr</span>
                      </td>
                      <td className="p-4 text-right">
                        <span className="text-white">{role.paidLeaves} days</span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="text-white/60">{role.staffCount || 0}</span>
                      </td>
                      <td className="p-4 text-center">
                        <button className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Global Settings */}
        <div className="glass-card p-6">
          <h3 className="font-semibold text-white mb-4">Global Settings</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm text-white/60 mb-2">Pay Cycle</label>
              <select className="w-full bg-white/5 text-white rounded-lg px-4 py-2.5 border border-white/10 focus:outline-none focus:border-primary">
                <option value="monthly">Monthly</option>
                <option value="biweekly">Bi-weekly</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-2">Pay Day</label>
              <select className="w-full bg-white/5 text-white rounded-lg px-4 py-2.5 border border-white/10 focus:outline-none focus:border-primary">
                <option value="1">1st of month</option>
                <option value="15">15th of month</option>
                <option value="last">Last day of month</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-2">OT Calculation</label>
              <select className="w-full bg-white/5 text-white rounded-lg px-4 py-2.5 border border-white/10 focus:outline-none focus:border-primary">
                <option value="daily">Daily (hours beyond shift)</option>
                <option value="weekly">Weekly (hours beyond 48)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
