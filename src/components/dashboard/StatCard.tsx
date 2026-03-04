'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    label?: string;
  };
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'primary';
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
  className,
}: StatCardProps) {
  const variantStyles = {
    default: {
      icon: 'bg-muted text-muted-foreground',
      trend: trend?.value && trend.value >= 0 ? 'text-green-500' : 'text-red-500',
    },
    success: {
      icon: 'bg-green-500/10 text-green-500',
      trend: 'text-green-500',
    },
    warning: {
      icon: 'bg-amber-500/10 text-amber-500',
      trend: 'text-amber-500',
    },
    danger: {
      icon: 'bg-red-500/10 text-red-500',
      trend: 'text-red-500',
    },
    primary: {
      icon: 'bg-primary/10 text-primary',
      trend: 'text-primary',
    },
  };

  const styles = variantStyles[variant];

  return (
    <div
      className={cn(
        "dash-card p-5 hover-lift transition-all duration-150",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-1">
            {title}
          </p>
          <p className="text-3xl font-bold text-foreground tracking-tight">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">
              {subtitle}
            </p>
          )}
        </div>

        {Icon && (
          <div className={cn("p-2.5 rounded-lg", styles.icon)}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>

      {trend && (
        <div className={cn("flex items-center mt-3 text-sm", styles.trend)}>
          {trend.value >= 0 ? (
            <TrendingUp className="h-4 w-4 mr-1" />
          ) : (
            <TrendingDown className="h-4 w-4 mr-1" />
          )}
          <span className="font-medium">
            {trend.value >= 0 ? '+' : ''}{trend.value}%
          </span>
          {trend.label && (
            <span className="text-muted-foreground ml-1.5">
              {trend.label}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
