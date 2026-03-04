'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface PageLayoutProps {
  children: ReactNode;
  className?: string;
  /** Show the animated gradient orbs background */
  showAnimatedBg?: boolean;
  /** Additional overlay for the animated background */
  overlayClassName?: string;
}

/**
 * PageLayout - Premium dark glassmorphism page wrapper
 *
 * Provides the consistent animated background with gradient orbs,
 * noise overlay, and grid pattern used across all pages.
 */
export function PageLayout({
  children,
  className,
  showAnimatedBg = true,
  overlayClassName,
}: PageLayoutProps) {
  return (
    <div className={cn('min-h-screen relative overflow-hidden', className)}>
      {/* Animated Background */}
      {showAnimatedBg && (
        <div className="animated-bg">
          <div className="gradient-orb orb-1" />
          <div className="gradient-orb orb-2" />
          <div className="gradient-orb orb-3" />
          <div className="gradient-orb orb-4" />
          <div className="gradient-orb orb-5" />
          <div className="noise-overlay" />
          <div className="grid-overlay" />
          {overlayClassName && <div className={overlayClassName} />}
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {children}
      </div>
    </div>
  );
}

interface PageHeaderProps {
  /** Back link destination */
  backHref?: string;
  /** Back link label */
  backLabel?: string;
  /** Show logo in header */
  showLogo?: boolean;
  /** Custom right side content */
  rightContent?: ReactNode;
  /** Additional className */
  className?: string;
}

/**
 * PageHeader - Consistent header component for auth/onboarding pages
 */
export function PageHeader({
  backHref,
  backLabel = 'Back',
  showLogo = true,
  rightContent,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between mb-8', className)}>
      {backHref ? (
        <Link
          href={backHref}
          className="flex items-center text-white/60 hover:text-white transition-colors text-sm group"
        >
          <svg
            className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          {backLabel}
        </Link>
      ) : (
        <div /> // Spacer for alignment
      )}

      {showLogo ? (
        <div className="flex items-center gap-2">
          <Image
            src="/logo.svg"
            alt="Restaurant Daily"
            width={32}
            height={32}
            className="w-8 h-8"
          />
          <span className="text-lg font-semibold text-white">Restaurant Daily</span>
        </div>
      ) : rightContent || <div />}
    </div>
  );
}

interface PageContainerProps {
  children: ReactNode;
  /** Max width class (e.g., 'max-w-md', 'max-w-2xl') */
  maxWidth?: string;
  /** Additional className */
  className?: string;
  /** Center content vertically */
  centered?: boolean;
}

/**
 * PageContainer - Consistent content container with max-width
 */
export function PageContainer({
  children,
  maxWidth = 'max-w-md',
  className,
  centered = false,
}: PageContainerProps) {
  return (
    <div
      className={cn(
        'container mx-auto px-4 py-6 sm:py-8 flex-1 flex flex-col',
        maxWidth,
        centered && 'justify-center',
        className
      )}
    >
      {children}
    </div>
  );
}

interface LoadingScreenProps {
  /** Loading message */
  message?: string;
  /** Sub-message */
  subMessage?: string;
}

/**
 * LoadingScreen - Premium dark loading screen
 */
export function LoadingScreen({
  message = 'Loading...',
  subMessage,
}: LoadingScreenProps) {
  return (
    <PageLayout>
      <div className="flex-1 flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-white/20 border-t-orange-500 mx-auto mb-4" />
          <p className="text-white font-medium">{message}</p>
          {subMessage && (
            <p className="text-white/50 text-sm mt-1">{subMessage}</p>
          )}
        </div>
      </div>
    </PageLayout>
  );
}

interface ErrorScreenProps {
  /** Error title */
  title?: string;
  /** Error message */
  message: string;
  /** Action button label */
  actionLabel?: string;
  /** Action button handler */
  onAction?: () => void;
  /** Show back to home button */
  showHomeButton?: boolean;
}

/**
 * ErrorScreen - Premium dark error screen
 */
export function ErrorScreen({
  title = 'Something went wrong',
  message,
  actionLabel,
  onAction,
  showHomeButton = true,
}: ErrorScreenProps) {
  return (
    <PageLayout>
      <PageContainer centered>
        <div className="glass-card p-8 text-center">
          {/* Error Icon */}
          <div className="relative mx-auto mb-4 w-fit">
            <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full" />
            <div className="relative p-3 bg-gradient-to-br from-red-500/20 to-red-600/10 rounded-2xl border border-red-500/20">
              <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>

          <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
          <p className="text-white/60 mb-6">{message}</p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {actionLabel && onAction && (
              <button
                onClick={onAction}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-orange-500/25 transition-all"
              >
                {actionLabel}
              </button>
            )}
            {showHomeButton && (
              <Link
                href="/"
                className="px-6 py-3 bg-white/5 text-white/70 rounded-xl font-medium border border-white/10 hover:bg-white/10 hover:text-white transition-all"
              >
                Go to Homepage
              </Link>
            )}
          </div>
        </div>
      </PageContainer>
    </PageLayout>
  );
}

export default PageLayout;
