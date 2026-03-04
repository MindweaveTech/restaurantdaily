'use client';

import { Building2, Bell, Shield, Palette, Save, Camera } from 'lucide-react';
import { DashboardShell } from '@/components/dashboard';
import { useState } from 'react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('restaurant');

  const tabs = [
    { id: 'restaurant', label: 'Restaurant', icon: Building2 },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ];

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-white/60 mt-1">Manage your restaurant and account settings</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Tabs */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="glass-card p-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary/20 text-primary'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            {activeTab === 'restaurant' && (
              <div className="glass-card p-6 space-y-6">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  Restaurant Information
                </h2>

                {/* Logo */}
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 rounded-xl bg-primary/20 flex items-center justify-center">
                    <span className="text-3xl font-bold text-primary">BS</span>
                  </div>
                  <div>
                    <button className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 flex items-center gap-2">
                      <Camera className="h-4 w-4" />
                      Change Logo
                    </button>
                    <p className="text-sm text-white/40 mt-2">PNG, JPG up to 2MB</p>
                  </div>
                </div>

                {/* Form */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm text-white/60 mb-2">Restaurant Name</label>
                    <input
                      type="text"
                      defaultValue="Burger Singh"
                      className="w-full bg-white/5 text-white rounded-lg px-4 py-2.5 border border-white/10 focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white/60 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      defaultValue="+91 8826175074"
                      className="w-full bg-white/5 text-white rounded-lg px-4 py-2.5 border border-white/10 focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm text-white/60 mb-2">Address</label>
                    <textarea
                      defaultValue="GG-15, GC Grand Street, Windsor Rd, Vaibhav Khand, Indirapuram, Ghaziabad, UP 201301"
                      rows={3}
                      className="w-full bg-white/5 text-white rounded-lg px-4 py-2.5 border border-white/10 focus:outline-none focus:border-primary resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white/60 mb-2">GST Number</label>
                    <input
                      type="text"
                      defaultValue="09BENPR6281N1ZG"
                      className="w-full bg-white/5 text-white rounded-lg px-4 py-2.5 border border-white/10 focus:outline-none focus:border-primary font-mono"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white/60 mb-2">FSSAI License</label>
                    <input
                      type="text"
                      defaultValue="12720052000784"
                      className="w-full bg-white/5 text-white rounded-lg px-4 py-2.5 border border-white/10 focus:outline-none focus:border-primary font-mono"
                      readOnly
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-white/10">
                  <button className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="glass-card p-6 space-y-6">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  Notification Preferences
                </h2>
                <div className="space-y-4">
                  {[
                    { label: 'Staff check-in/check-out alerts', enabled: true },
                    { label: 'Daily attendance summary', enabled: true },
                    { label: 'Payroll processing reminders', enabled: true },
                    { label: 'New staff invitation accepted', enabled: false },
                    { label: 'Weekly reports', enabled: true },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between py-3 border-b border-white/5">
                      <span className="text-white">{item.label}</span>
                      <button
                        className={`w-12 h-6 rounded-full transition-colors ${
                          item.enabled ? 'bg-primary' : 'bg-white/20'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-white transition-transform ${
                            item.enabled ? 'translate-x-6' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="glass-card p-6 space-y-6">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Security Settings
                </h2>
                <div className="space-y-4">
                  <div className="p-4 bg-white/5 rounded-lg">
                    <h3 className="font-medium text-white">Two-Factor Authentication</h3>
                    <p className="text-sm text-white/50 mt-1">Add an extra layer of security to your account</p>
                    <button className="mt-3 px-4 py-2 rounded-lg bg-primary/20 text-primary border border-primary/30">
                      Enable 2FA
                    </button>
                  </div>
                  <div className="p-4 bg-white/5 rounded-lg">
                    <h3 className="font-medium text-white">Active Sessions</h3>
                    <p className="text-sm text-white/50 mt-1">Manage your active login sessions</p>
                    <button className="mt-3 px-4 py-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30">
                      Log Out All Devices
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="glass-card p-6 space-y-6">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Palette className="h-5 w-5 text-primary" />
                  Appearance Settings
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-white/60 mb-3">Theme</label>
                    <div className="flex gap-3">
                      <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground">Dark</button>
                      <button className="px-4 py-2 rounded-lg bg-white/5 text-white/60 border border-white/10">Light</button>
                      <button className="px-4 py-2 rounded-lg bg-white/5 text-white/60 border border-white/10">System</button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-white/60 mb-3">Accent Color</label>
                    <div className="flex gap-3">
                      <button className="w-10 h-10 rounded-full bg-orange-500 ring-2 ring-offset-2 ring-offset-black ring-orange-500" />
                      <button className="w-10 h-10 rounded-full bg-blue-500" />
                      <button className="w-10 h-10 rounded-full bg-green-500" />
                      <button className="w-10 h-10 rounded-full bg-purple-500" />
                      <button className="w-10 h-10 rounded-full bg-pink-500" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
