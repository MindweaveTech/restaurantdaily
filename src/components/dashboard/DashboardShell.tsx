'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Sidebar } from './Sidebar';
import { DashboardHeader } from './DashboardHeader';

interface DashboardShellProps {
  children: React.ReactNode;
  className?: string;
  /** Show animated background orbs */
  showAnimatedBg?: boolean;
}

export function DashboardShell({ children, className, showAnimatedBg = true }: DashboardShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Background */}
      {showAnimatedBg && (
        <div className="animated-bg opacity-50">
          <div className="gradient-orb orb-1" />
          <div className="gradient-orb orb-2" />
          <div className="gradient-orb orb-3" />
          <div className="gradient-orb orb-4" />
          <div className="gradient-orb orb-5" />
          <div className="noise-overlay" />
          <div className="grid-overlay" />
        </div>
      )}

      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div
        className={cn(
          "transition-all duration-300 ease-out-expo relative z-10",
          sidebarCollapsed ? "lg:pl-16" : "lg:pl-64",
          "min-h-screen"
        )}
      >
        {/* Header */}
        <DashboardHeader
          onMenuClick={() => setMobileMenuOpen(true)}
        />

        {/* Page Content */}
        <main className={cn("p-4 md:p-6 lg:p-8", className)}>
          {children}
        </main>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
