'use client';

import { Users, UserPlus, Search, MoreVertical, Phone, Mail } from 'lucide-react';
import { DashboardShell } from '@/components/dashboard';
import { useState } from 'react';

export default function StaffManagementPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const staffMembers = [
    { id: 1, name: 'Rahul Kumar', role: 'Chef', phone: '+91 98765 43210', email: 'rahul@example.com', status: 'active', joinDate: '2024-01-15' },
    { id: 2, name: 'Priya Sharma', role: 'Server', phone: '+91 98765 43211', email: 'priya@example.com', status: 'active', joinDate: '2024-03-20' },
    { id: 3, name: 'Amit Singh', role: 'Server', phone: '+91 98765 43212', email: 'amit@example.com', status: 'active', joinDate: '2024-06-10' },
    { id: 4, name: 'Neha Patel', role: 'Cashier', phone: '+91 98765 43213', email: 'neha@example.com', status: 'active', joinDate: '2024-02-28' },
    { id: 5, name: 'Vikram Reddy', role: 'Chef', phone: '+91 98765 43214', email: 'vikram@example.com', status: 'active', joinDate: '2023-11-05' },
    { id: 6, name: 'Anjali Gupta', role: 'Server', phone: '+91 98765 43215', email: 'anjali@example.com', status: 'inactive', joinDate: '2024-08-15' },
    { id: 7, name: 'Ravi Verma', role: 'Cleaner', phone: '+91 98765 43216', email: 'ravi@example.com', status: 'active', joinDate: '2024-04-01' },
    { id: 8, name: 'Sunita Devi', role: 'Helper', phone: '+91 98765 43217', email: 'sunita@example.com', status: 'active', joinDate: '2024-05-20' },
  ];

  const filteredStaff = staffMembers.filter(staff =>
    staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    staff.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            {filteredStaff.map((staff) => (
              <div key={staff.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-primary font-semibold text-lg">{staff.name.charAt(0)}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-white">{staff.name}</p>
                      {staff.status === 'active' ? (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-green-500/20 text-green-400 border border-green-500/30">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-red-500/20 text-red-400 border border-red-500/30">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-white/50">{staff.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="hidden md:flex flex-col items-end text-sm">
                    <span className="text-white/60 flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {staff.phone}
                    </span>
                    <span className="text-white/40 flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {staff.email}
                    </span>
                  </div>
                  <button className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors">
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
