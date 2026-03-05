'use client';

import { Users, UserPlus, Search, MoreVertical, Phone, Mail, Loader2 } from 'lucide-react';
import { DashboardShell } from '@/components/dashboard';
import { useState, useEffect } from 'react';

interface StaffMember {
  id: string;
  name: string | null;
  phone: string;
  email: string | null;
  role: string;
  status: string;
  created_at: string;
  settings?: {
    monthly_salary?: number;
    job_title?: string;
    shift_hours?: number;
  };
}

export default function StaffManagementPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch staff from API
  useEffect(() => {
    async function fetchStaff() {
      try {
        const response = await fetch('/api/staff/list');
        const data = await response.json();

        if (data.success) {
          setStaffMembers(data.staff);
        } else {
          setError(data.error || 'Failed to fetch staff');
        }
      } catch (err) {
        setError('Network error');
        console.error('Error fetching staff:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchStaff();
  }, []);

  const filteredStaff = staffMembers.filter(staff =>
    (staff.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (staff.settings?.job_title?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPhone = (phone: string) => {
    if (phone.startsWith('+91')) {
      const digits = phone.replace(/\D/g, '').slice(2);
      return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
    }
    return phone;
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

  if (error) {
    return (
      <DashboardShell>
        <div className="glass-card p-8 text-center">
          <p className="text-red-400">{error}</p>
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
            <h1 className="text-2xl font-bold text-white">Staff Management</h1>
            <p className="text-white/60 mt-1">{staffMembers.length} team members</p>
          </div>
          <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Invite Staff
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
          <input
            type="text"
            placeholder="Search staff by name or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-primary"
          />
        </div>

        {/* Staff List */}
        <div className="glass-card overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Team Members
            </h2>
          </div>
          <div className="divide-y divide-white/5">
            {filteredStaff.length === 0 ? (
              <div className="p-8 text-center text-white/50">
                No staff members found
              </div>
            ) : (
              filteredStaff.map((staff) => (
                <div key={staff.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-primary font-semibold text-lg">
                        {staff.name?.charAt(0) || '?'}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-white">{staff.name || 'Unnamed'}</p>
                        <span className={`px-2 py-0.5 rounded-full text-xs border ${
                          staff.status === 'active'
                            ? 'bg-green-500/20 text-green-400 border-green-500/30'
                            : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                        }`}>
                          {staff.status}
                        </span>
                      </div>
                      <p className="text-sm text-white/50">
                        {staff.settings?.job_title || staff.role}
                        {staff.settings?.monthly_salary && ` • ${formatCurrency(staff.settings.monthly_salary)}/month`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="hidden md:flex flex-col items-end text-sm">
                      <span className="text-white/60 flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {formatPhone(staff.phone)}
                      </span>
                      {staff.email && (
                        <span className="text-white/40 flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {staff.email}
                        </span>
                      )}
                    </div>
                    <button className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors">
                      <MoreVertical className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
