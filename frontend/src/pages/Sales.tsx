import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { getSales } from '../api/odoo';
import type { SalesRecord } from '../api/odoo';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

export default function Sales() {
  const [sales, setSales] = useState<SalesRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getSales(1000, 'date desc');
        setSales(data);
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

  // Chart data (reversed for chronological order)
  const chartData = [...sales].reverse().slice(-60).map((s) => ({
    date: s.date?.split('-').slice(1).join('/') || '',
    delivery: s.delivery_sales || 0,
    dineIn: s.dine_in_sales || 0,
    takeaway: s.takeaway_sales || 0,
  }));

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Sales</h1>

      {/* Channel Comparison Chart */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 mb-8">
        <h2 className="text-lg font-semibold mb-4">Sales by Channel (Last 60 Days)</h2>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
            <Tooltip formatter={(value) => formatCurrency(Number(value) || 0)} />
            <Legend />
            <Line type="monotone" dataKey="delivery" name="Delivery" stroke="#6366f1" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="dineIn" name="Dine-In" stroke="#22c55e" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="takeaway" name="Takeaway" stroke="#f59e0b" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Sales Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Daily Sales Records</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Day</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Net Sales</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Orders</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Delivery</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Dine-In</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Takeaway</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Avg Basket</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sales.slice(0, 50).map((sale) => (
                <tr key={sale.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{sale.date}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{sale.day_name}</td>
                  <td className="px-4 py-3 text-sm text-right font-medium">
                    {formatCurrency(sale.net_sales || 0)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right">{sale.total_orders}</td>
                  <td className="px-4 py-3 text-sm text-right text-indigo-600">
                    {formatCurrency(sale.delivery_sales || 0)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-green-600">
                    {formatCurrency(sale.dine_in_sales || 0)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-amber-600">
                    {formatCurrency(sale.takeaway_sales || 0)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    {formatCurrency(sale.basket_per_order || 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
