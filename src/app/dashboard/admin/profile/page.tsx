'use client';

import { User, Phone, Mail, Building2, Calendar, Shield, Loader2, Save } from 'lucide-react';
import { DashboardShell } from '@/components/dashboard';
import { useState, useEffect } from 'react';

interface UserProfile {
  id: string;
  name: string | null;
  phone: string;
  email: string | null;
  role: string;
  created_at: string;
  restaurant?: {
    name: string;
    address: string;
  };
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    // Get user info from localStorage
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const parsed = JSON.parse(userInfo);
      setProfile(parsed);
      setName(parsed.name || '');
      setEmail(parsed.email || '');
    }
    setLoading(false);
  }, []);

  const formatPhone = (phone: string) => {
    if (phone.startsWith('+91')) {
      const digits = phone.replace(/\D/g, '').slice(2);
      return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
    }
    return phone;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getRoleBadge = (role: string) => {
    const roleConfig: Record<string, { label: string; color: string }> = {
      superadmin: { label: 'Super Admin', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
      business_admin: { label: 'Business Admin', color: 'bg-primary/20 text-primary border-primary/30' },
      employee: { label: 'Employee', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    };
    const config = roleConfig[role] || { label: role, color: 'bg-white/10 text-white/60 border-white/20' };
    return (
      <span className={`px-3 py-1 rounded-full text-sm border ${config.color}`}>
        {config.label}
      </span>
    );
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
      <div className="space-y-6 max-w-3xl">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">My Profile</h1>
          <p className="text-white/60 mt-1">Manage your account information</p>
        </div>

        {/* Profile Card */}
        <div className="glass-card p-6">
          {/* Avatar & Name */}
          <div className="flex items-center gap-6 pb-6 border-b border-white/10">
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-3xl font-bold text-primary">
                {profile?.name?.charAt(0)?.toUpperCase() || profile?.phone?.slice(-2) || '?'}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">
                {profile?.name || 'Unnamed User'}
              </h2>
              <p className="text-white/60">{formatPhone(profile?.phone || '')}</p>
              <div className="mt-2">
                {getRoleBadge(profile?.role || 'employee')}
              </div>
            </div>
          </div>

          {/* Profile Info */}
          <div className="pt-6 space-y-6">
            {editing ? (
              /* Edit Mode */
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-white/60 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-white/5 text-white rounded-lg px-4 py-2.5 border border-white/10 focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full bg-white/5 text-white rounded-lg px-4 py-2.5 border border-white/10 focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setEditing(false)}
                    className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      // TODO: Save to database
                      setEditing(false);
                    }}
                    className="px-4 py-2 rounded-lg bg-primary text-primary-foreground flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Save Changes
                  </button>
                </div>
              </div>
            ) : (
              /* View Mode */
              <div className="grid gap-4">
                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white/50">Full Name</p>
                    <p className="text-white font-medium">{profile?.name || 'Not set'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg">
                  <div className="p-2 rounded-lg bg-green-500/20">
                    <Phone className="h-5 w-5 text-green-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white/50">Phone Number</p>
                    <p className="text-white font-medium">{formatPhone(profile?.phone || '')}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-xs bg-green-500/20 text-green-400 border border-green-500/30">
                    Verified
                  </span>
                </div>

                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg">
                  <div className="p-2 rounded-lg bg-blue-500/20">
                    <Mail className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white/50">Email Address</p>
                    <p className="text-white font-medium">{profile?.email || 'Not set'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg">
                  <div className="p-2 rounded-lg bg-purple-500/20">
                    <Shield className="h-5 w-5 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white/50">Role</p>
                    <p className="text-white font-medium capitalize">{profile?.role?.replace('_', ' ') || 'Employee'}</p>
                  </div>
                </div>

                {profile?.restaurant && (
                  <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg">
                    <div className="p-2 rounded-lg bg-orange-500/20">
                      <Building2 className="h-5 w-5 text-orange-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-white/50">Restaurant</p>
                      <p className="text-white font-medium">{profile.restaurant.name}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg">
                  <div className="p-2 rounded-lg bg-white/10">
                    <Calendar className="h-5 w-5 text-white/60" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white/50">Member Since</p>
                    <p className="text-white font-medium">
                      {profile?.created_at ? formatDate(profile.created_at) : 'Unknown'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setEditing(true)}
                  className="mt-2 px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 w-full"
                >
                  Edit Profile
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
