import { useEffect, useState } from 'react';
import { getEmployees, getAttendance } from '../api/odoo';
import type { EmployeeRecord, AttendanceRecord } from '../api/odoo';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

export default function Staff() {
  const [employees, setEmployees] = useState<EmployeeRecord[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [empData, attData] = await Promise.all([
          getEmployees(),
          getAttendance(500),
        ]);
        setEmployees(empData);
        setAttendance(attData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-500 bg-red-50 p-4 rounded-lg">{error}</div>
      </div>
    );
  }

  const totalSalary = attendance.reduce((sum, a) => sum + (a.paid_salary || 0), 0);
  const avgAttendance = attendance.length > 0
    ? attendance.reduce((sum, a) => sum + (a.present_days || 0), 0) / attendance.length
    : 0;

  // Group attendance by employee
  const attendanceByEmployee = attendance.reduce((acc, a) => {
    const empId = a.employee_id?.[0];
    if (empId) {
      if (!acc[empId]) acc[empId] = [];
      acc[empId].push(a);
    }
    return acc;
  }, {} as Record<number, AttendanceRecord[]>);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Staff</h1>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <p className="text-sm text-gray-500 mb-1">Total Employees</p>
          <p className="text-2xl font-bold text-gray-900">{employees.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <p className="text-sm text-gray-500 mb-1">Attendance Records</p>
          <p className="text-2xl font-bold text-gray-900">{attendance.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <p className="text-sm text-gray-500 mb-1">Total Salary Paid</p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(totalSalary)}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <p className="text-sm text-gray-500 mb-1">Avg Days Present</p>
          <p className="text-2xl font-bold text-indigo-600">{avgAttendance.toFixed(1)}</p>
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Employee Directory</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Role</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Store</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Phone</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Base Salary</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Attendance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {employees.map((emp) => {
                const empAttendance = attendanceByEmployee[emp.id] || [];
                const latestAtt = empAttendance.sort((a, b) => {
                  const aDate = a.year * 100 + a.month;
                  const bDate = b.year * 100 + b.month;
                  return bDate - aDate;
                })[0];

                return (
                  <tr key={emp.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium">{emp.name}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs">
                        {emp.role_code || 'Staff'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{emp.store || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{emp.phone || '-'}</td>
                    <td className="px-4 py-3 text-sm text-right">
                      {emp.base_salary ? formatCurrency(emp.base_salary) : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      {latestAtt ? (
                        <span className="text-gray-600">
                          {latestAtt.present_days} days ({latestAtt.year}-{latestAtt.month})
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
