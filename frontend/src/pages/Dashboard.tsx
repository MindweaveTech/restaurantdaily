import { useEffect, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { getSales, getExpenses } from '../api/odoo';
import type { SalesRecord, ExpenseRecord } from '../api/odoo';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444'];

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

function StatCard({ title, value, subtitle, color = 'indigo' }: {
  title: string;
  value: string;
  subtitle?: string;
  color?: string;
}) {
  const colorClasses: Record<string, string> = {
    indigo: 'bg-indigo-50 border-indigo-200',
    green: 'bg-green-50 border-green-200',
    amber: 'bg-amber-50 border-amber-200',
    red: 'bg-red-50 border-red-200',
  };

  return (
    <div className={`p-6 rounded-xl border ${colorClasses[color]}`}>
      <p className="text-sm text-gray-600 mb-1">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
}

export default function Dashboard() {
  const [sales, setSales] = useState<SalesRecord[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [salesData, expenseData] = await Promise.all([
          getSales(500, 'date asc'),
          getExpenses(500),
        ]);
        setSales(salesData);
        setExpenses(expenseData);
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

  // Calculate totals
  const totalSales = sales.reduce((sum, s) => sum + (s.net_sales || 0), 0);
  const totalOrders = sales.reduce((sum, s) => sum + (s.total_orders || 0), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const avgBasket = totalOrders > 0 ? totalSales / totalOrders : 0;

  // Channel breakdown
  const deliverySales = sales.reduce((sum, s) => sum + (s.delivery_sales || 0), 0);
  const dineInSales = sales.reduce((sum, s) => sum + (s.dine_in_sales || 0), 0);
  const takeawaySales = sales.reduce((sum, s) => sum + (s.takeaway_sales || 0), 0);

  const channelData = [
    { name: 'Delivery', value: deliverySales },
    { name: 'Dine-In', value: dineInSales },
    { name: 'Takeaway', value: takeawaySales },
  ].filter(d => d.value > 0);

  // Daily sales trend (last 30 records)
  const recentSales = sales.slice(-30).map((s) => ({
    date: s.date?.split('-').slice(1).join('/') || '',
    sales: s.net_sales || 0,
    orders: s.total_orders || 0,
  }));

  // Expense categories
  const expenseByCategory = expenses.reduce((acc, e) => {
    const cat = e.category || 'Other';
    acc[cat] = (acc[cat] || 0) + (e.amount || 0);
    return acc;
  }, {} as Record<string, number>);

  const expenseCategoryData = Object.entries(expenseByCategory)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Sales"
          value={formatCurrency(totalSales)}
          subtitle={`${sales.length} days`}
          color="indigo"
        />
        <StatCard
          title="Total Orders"
          value={totalOrders.toLocaleString()}
          subtitle={`Avg ${formatCurrency(avgBasket)}/order`}
          color="green"
        />
        <StatCard
          title="Total Expenses"
          value={formatCurrency(totalExpenses)}
          subtitle={`${expenses.length} transactions`}
          color="amber"
        />
        <StatCard
          title="Gross Margin"
          value={`${((1 - totalExpenses / totalSales) * 100).toFixed(1)}%`}
          subtitle="Sales - Expenses"
          color="red"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        {/* Sales Trend */}
        <div className="col-span-2 bg-white p-6 rounded-xl border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Sales Trend (Last 30 Days)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={recentSales}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
              <Tooltip formatter={(value) => formatCurrency(Number(value) || 0)} />
              <Area
                type="monotone"
                dataKey="sales"
                stroke="#6366f1"
                fill="#6366f1"
                fillOpacity={0.2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Channel Breakdown */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Sales by Channel</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={channelData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                dataKey="value"
                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
              >
                {channelData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(Number(value) || 0)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Expense Categories */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h2 className="text-lg font-semibold mb-4">Expenses by Category</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={expenseCategoryData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis type="number" tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
            <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
            <Tooltip formatter={(value) => formatCurrency(Number(value) || 0)} />
            <Bar dataKey="value" fill="#f59e0b" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
