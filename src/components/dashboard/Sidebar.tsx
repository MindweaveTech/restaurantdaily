'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Clock,
  Calendar,
  History,
  DollarSign,
  Calculator,
  FileText,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navigation: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { title: 'Dashboard', href: '/dashboard/admin', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Attendance',
    items: [
      { title: 'Today', href: '/dashboard/admin/attendance', icon: Clock },
      { title: 'History', href: '/dashboard/admin/attendance/history', icon: History },
      { title: 'Calendar', href: '/dashboard/admin/attendance/calendar', icon: Calendar },
    ],
  },
  {
    label: 'Payroll',
    items: [
      { title: 'Pay Summary', href: '/dashboard/admin/payroll', icon: DollarSign },
      { title: 'Salary Config', href: '/dashboard/admin/payroll/config', icon: Calculator },
      { title: 'Reports', href: '/dashboard/admin/payroll/reports', icon: FileText },
    ],
  },
  {
    label: 'Management',
    items: [
      { title: 'Staff', href: '/dashboard/admin/staff', icon: Users },
      { title: 'Settings', href: '/dashboard/admin/settings', icon: Settings },
    ],
  },
];

export function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();

  const sidebarContent = (
    <>
      {/* Logo & Brand */}
      <div className="flex items-center h-16 px-4 border-b border-sidebar-border">
        <Link href="/dashboard/admin" className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">RD</span>
          </div>
          {!collapsed && (
            <span className="font-semibold text-sidebar-foreground whitespace-nowrap">
              Restaurant Daily
            </span>
          )}
        </Link>

        {/* Mobile Close Button */}
        <button
          onClick={onMobileClose}
          className="ml-auto p-1 rounded-md text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent lg:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        {navigation.map((group) => (
          <div key={group.label} className="mb-6">
            {!collapsed && (
              <h3 className="px-3 mb-2 text-xs font-medium text-sidebar-foreground/50 uppercase tracking-wider">
                {group.label}
              </h3>
            )}
            <ul className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                const Icon = item.icon;

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onMobileClose}
                      className={cn(
                        "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-all duration-150",
                        collapsed ? "justify-center" : "justify-start",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-primary"
                          : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                      )}
                      title={collapsed ? item.title : undefined}
                    >
                      <Icon className={cn("h-5 w-5 shrink-0", isActive && "text-primary")} />
                      {!collapsed && <span className="ml-3">{item.title}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Collapse Toggle (Desktop only) */}
      <div className="hidden lg:flex items-center justify-end p-4 border-t border-sidebar-border">
        <button
          onClick={onToggle}
          className="p-2 rounded-md text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-30 h-screen bg-sidebar border-r border-sidebar-border",
          "hidden lg:flex lg:flex-col",
          "transition-all duration-300 ease-out-expo",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-screen w-64 bg-sidebar border-r border-sidebar-border",
          "flex flex-col lg:hidden",
          "transition-transform duration-300 ease-out-expo",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
