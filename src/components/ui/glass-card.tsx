'use client';

import { ReactNode, forwardRef, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export type GlassCardSize = 'sm' | 'md' | 'lg' | 'xl';
export type GlassCardVariant = 'default' | 'orange' | 'success' | 'error' | 'info';

const sizeStyles: Record<GlassCardSize, string> = {
  sm: 'p-4 rounded-xl',
  md: 'p-6 rounded-2xl',
  lg: 'p-6 sm:p-8 rounded-2xl sm:rounded-3xl',
  xl: 'p-8 sm:p-10 rounded-3xl',
};

const variantStyles: Record<GlassCardVariant, string> = {
  default: 'border-white/10',
  orange: 'border-orange-500/20',
  success: 'border-emerald-500/20',
  error: 'border-red-500/20',
  info: 'border-blue-500/20',
};

const variantGradients: Record<GlassCardVariant, string> = {
  default: 'from-white/5 via-transparent to-white/5',
  orange: 'from-orange-500/5 via-transparent to-amber-500/5',
  success: 'from-emerald-500/5 via-transparent to-green-500/5',
  error: 'from-red-500/5 via-transparent to-rose-500/5',
  info: 'from-blue-500/5 via-transparent to-cyan-500/5',
};

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** Size variant */
  size?: GlassCardSize;
  /** Color variant */
  variant?: GlassCardVariant;
  /** Show inner gradient overlay */
  showGradient?: boolean;
  /** Enable hover lift animation */
  hoverable?: boolean;
  /** Enable stagger children animation */
  staggerChildren?: boolean;
  /** Additional className */
  className?: string;
}

/**
 * GlassCard - Premium glassmorphism card component
 *
 * Features:
 * - Backdrop blur with glass effect
 * - Multiple size variants
 * - Color-coded variants (default, orange, success, error, info)
 * - Optional inner gradient overlay
 * - Optional hover lift animation
 * - Optional stagger children animation
 */
export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  (
    {
      children,
      size = 'lg',
      variant = 'default',
      showGradient = true,
      hoverable = false,
      staggerChildren = false,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'glass-card relative',
          sizeStyles[size],
          variantStyles[variant],
          hoverable && 'hover-lift-premium cursor-pointer',
          staggerChildren && 'stagger-children',
          className
        )}
        {...props}
      >
        {/* Inner gradient overlay */}
        {showGradient && (
          <div
            className={cn(
              'absolute inset-0 bg-gradient-to-br pointer-events-none rounded-[inherit]',
              variantGradients[variant]
            )}
          />
        )}

        {/* Content */}
        <div className="relative">{children}</div>
      </div>
    );
  }
);

GlassCard.displayName = 'GlassCard';

interface GlassIconBadgeProps {
  /** Icon component */
  icon: ReactNode;
  /** Color variant */
  variant?: 'orange' | 'success' | 'error' | 'info' | 'default';
  /** Size */
  size?: 'sm' | 'md' | 'lg';
  /** Show glow effect */
  glow?: boolean;
}

const iconBadgeColors: Record<string, { bg: string; icon: string; glow: string }> = {
  orange: {
    bg: 'bg-gradient-to-br from-orange-500/20 to-amber-500/10 border-orange-500/20',
    icon: 'text-orange-400',
    glow: 'bg-orange-500/20',
  },
  success: {
    bg: 'bg-gradient-to-br from-emerald-500/20 to-green-500/10 border-emerald-500/20',
    icon: 'text-emerald-400',
    glow: 'bg-emerald-500/20',
  },
  error: {
    bg: 'bg-gradient-to-br from-red-500/20 to-rose-500/10 border-red-500/20',
    icon: 'text-red-400',
    glow: 'bg-red-500/20',
  },
  info: {
    bg: 'bg-gradient-to-br from-blue-500/20 to-cyan-500/10 border-blue-500/20',
    icon: 'text-blue-400',
    glow: 'bg-blue-500/20',
  },
  default: {
    bg: 'bg-gradient-to-br from-white/10 to-white/5 border-white/10',
    icon: 'text-white/80',
    glow: 'bg-white/10',
  },
};

const iconBadgeSizes: Record<string, { wrapper: string; icon: string }> = {
  sm: { wrapper: 'p-2 rounded-lg', icon: 'h-4 w-4' },
  md: { wrapper: 'p-3 rounded-xl', icon: 'h-6 w-6' },
  lg: { wrapper: 'p-4 rounded-2xl', icon: 'h-8 w-8' },
};

/**
 * GlassIconBadge - Icon badge with glass effect
 */
export function GlassIconBadge({
  icon,
  variant = 'orange',
  size = 'md',
  glow = true,
}: GlassIconBadgeProps) {
  const colors = iconBadgeColors[variant];
  const sizeStyle = iconBadgeSizes[size];

  return (
    <div className="relative">
      {glow && (
        <div className={cn('absolute inset-0 blur-xl rounded-full', colors.glow)} />
      )}
      <div
        className={cn(
          'relative border',
          colors.bg,
          sizeStyle.wrapper
        )}
      >
        <div className={cn(colors.icon, sizeStyle.icon)}>
          {icon}
        </div>
      </div>
    </div>
  );
}

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Error state */
  error?: boolean;
  /** Input label */
  label?: string;
  /** Helper text */
  helperText?: string;
  /** Error message */
  errorMessage?: string;
}

/**
 * GlassInput - Premium input with glass styling
 */
export const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
  ({ className, error, label, helperText, errorMessage, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-white/80">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full px-4 py-3 rounded-xl',
            'bg-white/5 border text-white placeholder:text-white/40',
            'focus:outline-none focus:ring-2 focus:ring-orange-500/50',
            'transition-all duration-300',
            error
              ? 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/50'
              : 'border-white/10 focus:border-orange-500/50',
            className
          )}
          {...props}
        />
        {(helperText || errorMessage) && (
          <p
            className={cn(
              'text-xs',
              errorMessage ? 'text-red-400' : 'text-white/40'
            )}
          >
            {errorMessage || helperText}
          </p>
        )}
      </div>
    );
  }
);

GlassInput.displayName = 'GlassInput';

interface GlassTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Error state */
  error?: boolean;
  /** Input label */
  label?: string;
  /** Helper text */
  helperText?: string;
  /** Error message */
  errorMessage?: string;
}

/**
 * GlassTextarea - Premium textarea with glass styling
 */
export const GlassTextarea = forwardRef<HTMLTextAreaElement, GlassTextareaProps>(
  ({ className, error, label, helperText, errorMessage, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-white/80">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={cn(
            'w-full px-4 py-3 rounded-xl',
            'bg-white/5 border text-white placeholder:text-white/40',
            'focus:outline-none focus:ring-2 focus:ring-orange-500/50',
            'transition-all duration-300 resize-none',
            error
              ? 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/50'
              : 'border-white/10 focus:border-orange-500/50',
            className
          )}
          {...props}
        />
        {(helperText || errorMessage) && (
          <p
            className={cn(
              'text-xs',
              errorMessage ? 'text-red-400' : 'text-white/40'
            )}
          >
            {errorMessage || helperText}
          </p>
        )}
      </div>
    );
  }
);

GlassTextarea.displayName = 'GlassTextarea';

interface GlassSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  /** Error state */
  error?: boolean;
  /** Select label */
  label?: string;
  /** Options */
  options: Array<{ value: string; label: string }>;
  /** Placeholder option */
  placeholder?: string;
}

/**
 * GlassSelect - Premium select with glass styling
 */
export const GlassSelect = forwardRef<HTMLSelectElement, GlassSelectProps>(
  ({ className, error, label, options, placeholder, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-white/80">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={cn(
            'w-full px-4 py-3 rounded-xl',
            'bg-white/5 border text-white',
            'focus:outline-none focus:ring-2 focus:ring-orange-500/50',
            'transition-all duration-300',
            'appearance-none cursor-pointer',
            error
              ? 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/50'
              : 'border-white/10 focus:border-orange-500/50',
            className
          )}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='rgba(255,255,255,0.4)'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
            backgroundPosition: 'right 1rem center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '1.25rem',
          }}
          {...props}
        >
          {placeholder && (
            <option value="" className="bg-[#0a0a1a] text-white/40">
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              className="bg-[#0a0a1a] text-white"
            >
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  }
);

GlassSelect.displayName = 'GlassSelect';

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'ghost' | 'success' | 'danger';
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Loading state */
  loading?: boolean;
  /** Icon on left */
  leftIcon?: ReactNode;
  /** Icon on right */
  rightIcon?: ReactNode;
}

const buttonVariants: Record<string, string> = {
  primary: 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-0.5',
  secondary: 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10 hover:text-white',
  ghost: 'text-white/60 hover:text-white hover:bg-white/5',
  success: 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5',
  danger: 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25 hover:shadow-red-500/40 hover:-translate-y-0.5',
};

const buttonSizes: Record<string, string> = {
  sm: 'px-4 py-2 text-sm rounded-lg',
  md: 'px-6 py-3 text-base rounded-xl',
  lg: 'px-8 py-4 text-lg rounded-xl',
};

/**
 * GlassButton - Premium button with glass styling
 */
export const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'relative flex items-center justify-center gap-2 font-semibold',
          'transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:ring-offset-2 focus:ring-offset-[#050510]',
          'active:scale-[0.98]',
          buttonVariants[variant],
          buttonSizes[size],
          (disabled || loading) && 'opacity-50 cursor-not-allowed hover:translate-y-0 hover:shadow-none',
          className
        )}
        {...props}
      >
        {loading ? (
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-current border-t-transparent" />
        ) : (
          leftIcon
        )}
        {children}
        {!loading && rightIcon}
      </button>
    );
  }
);

GlassButton.displayName = 'GlassButton';

interface GlassNoticeProps {
  /** Notice variant */
  variant: 'info' | 'warning' | 'success' | 'error';
  /** Icon */
  icon?: ReactNode;
  /** Title */
  title?: string;
  /** Content */
  children: ReactNode;
  /** Additional className */
  className?: string;
}

const noticeStyles: Record<string, { bg: string; border: string; icon: string; title: string; text: string }> = {
  info: {
    bg: 'bg-blue-500/5',
    border: 'border-blue-500/10',
    icon: 'text-blue-400',
    title: 'text-blue-300',
    text: 'text-white/40',
  },
  warning: {
    bg: 'bg-amber-500/5',
    border: 'border-amber-500/10',
    icon: 'text-amber-400',
    title: 'text-amber-300',
    text: 'text-white/40',
  },
  success: {
    bg: 'bg-emerald-500/5',
    border: 'border-emerald-500/10',
    icon: 'text-emerald-400',
    title: 'text-emerald-300',
    text: 'text-white/40',
  },
  error: {
    bg: 'bg-red-500/5',
    border: 'border-red-500/10',
    icon: 'text-red-400',
    title: 'text-red-300',
    text: 'text-white/40',
  },
};

/**
 * GlassNotice - Info/warning/success/error notice box
 */
export function GlassNotice({ variant, icon, title, children, className }: GlassNoticeProps) {
  const styles = noticeStyles[variant];

  return (
    <div className={cn('p-4 rounded-xl border', styles.bg, styles.border, className)}>
      <div className="flex items-start gap-3">
        {icon && (
          <div className={cn('p-1.5 bg-current/10 rounded-lg shrink-0', styles.icon)}>
            {icon}
          </div>
        )}
        <div>
          {title && (
            <h3 className={cn('text-sm font-medium mb-1', styles.title)}>
              {title}
            </h3>
          )}
          <div className={cn('text-xs leading-relaxed', styles.text)}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default GlassCard;
