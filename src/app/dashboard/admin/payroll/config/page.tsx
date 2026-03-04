'use client';

import { Calculator, Save, Plus, Trash2 } from 'lucide-react';
import { DashboardShell } from '@/components/dashboard';
import { useState } from 'react';

export default function SalaryConfigPage() {
  const [roles] = useState([
    { id: 1, name: 'Chef', baseSalary: 35000, overtimeRate: 200, allowances: 3000 },
    { id: 2, name: 'Server', baseSalary: 25000, overtimeRate: 150, allowances: 2000 },
    { id: 3, name: 'Cashier', baseSalary: 28000, overtimeRate: 175, allowances: 2500 },
    { id: 4, name: 'Cleaner', baseSalary: 18000, overtimeRate: 100, allowances: 1500 },
    { id: 5, name: 'Helper', baseSalary: 15000, overtimeRate: 80, allowances: 1000 },
  ]);

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
            <h1 className="text-2xl font-bold text-white">Salary Configuration</h1>
            <p className="text-white/60 mt-1">Configure base salaries and rates for each role</p>
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

        {/* Configuration Table */}
        <div className="glass-card overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              Role-based Salary Structure
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-4 text-white/60 font-medium">Role</th>
                  <th className="text-right p-4 text-white/60 font-medium">Base Salary</th>
                  <th className="text-right p-4 text-white/60 font-medium">Overtime Rate/hr</th>
                  <th className="text-right p-4 text-white/60 font-medium">Allowances</th>
                  <th className="text-center p-4 text-white/60 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {roles.map((role) => (
                  <tr key={role.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <input
                        type="text"
                        value={role.name}
                        className="bg-transparent text-white font-medium focus:outline-none focus:ring-1 focus:ring-primary rounded px-2 py-1"
                        readOnly
                      />
                    </td>
                    <td className="p-4 text-right">
                      <input
                        type="text"
                        value={formatCurrency(role.baseSalary)}
                        className="bg-white/5 text-white text-right rounded px-3 py-1.5 border border-white/10 focus:outline-none focus:border-primary w-32"
                        readOnly
                      />
                    </td>
                    <td className="p-4 text-right">
                      <input
                        type="text"
                        value={formatCurrency(role.overtimeRate)}
                        className="bg-white/5 text-white text-right rounded px-3 py-1.5 border border-white/10 focus:outline-none focus:border-primary w-28"
                        readOnly
                      />
                    </td>
                    <td className="p-4 text-right">
                      <input
                        type="text"
                        value={formatCurrency(role.allowances)}
                        className="bg-white/5 text-white text-right rounded px-3 py-1.5 border border-white/10 focus:outline-none focus:border-primary w-28"
                        readOnly
                      />
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
        </div>

        {/* Additional Settings */}
        <div className="glass-card p-6">
          <h3 className="font-semibold text-white mb-4">Global Settings</h3>
          <div className="grid md:grid-cols-2 gap-6">
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
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
