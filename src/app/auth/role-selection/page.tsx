'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChefHat, Users, Building2, ArrowRight, Crown, UserCheck, Shield, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { PageLayout, LoadingScreen } from '@/components/ui/page-layout';
import { GlassCard, GlassNotice } from '@/components/ui/glass-card';

export default function RoleSelectionPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<'business_admin' | 'employee' | null>(null);
  const [loading, setLoading] = useState(false);
  const [validatingSession, setValidatingSession] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Validate user session on page load
  useEffect(() => {
    const validateSession = () => {
      const token = localStorage.getItem('auth_token');

      if (!token) {
        console.log('No auth token found, redirecting to login');
        router.push('/auth/phone');
        return;
      }

      try {
        // Check if token is valid and not expired
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Math.floor(Date.now() / 1000);

        if (payload.exp < currentTime) {
          console.log('Token expired, redirecting to login');
          localStorage.removeItem('auth_token');
          router.push('/auth/phone');
          return;
        }

        // If user already has a specific role (not 'user'), redirect to appropriate dashboard
        if (payload.role && payload.role !== 'user') {
          console.log('User already has role:', payload.role);
          if (payload.role === 'superadmin') {
            router.push('/dashboard/superadmin');
            return;
          } else if (payload.role === 'business_admin') {
            if (payload.restaurant_id) {
              router.push('/dashboard/admin');
            } else {
              router.push('/onboarding/restaurant-setup');
            }
            return;
          } else if (payload.role === 'employee') {
            router.push('/dashboard/staff');
            return;
          }
        }

        // Token is valid but no specific role assigned yet (role is 'user')
        setValidatingSession(false);
      } catch {
        console.error('Invalid token format, redirecting to login');
        localStorage.removeItem('auth_token');
        router.push('/auth/phone');
      }
    };

    validateSession();
  }, [router]);

  const handleRoleSelect = (role: 'business_admin' | 'employee') => {
    setSelectedRole(role);
    setError(null); // Clear any previous errors
  };

  const handleContinue = async () => {
    console.log('🚀 handleContinue called with selectedRole:', selectedRole);
    if (!selectedRole) return;

    setLoading(true);

    try {
      // Update user role in backend
      const authToken = localStorage.getItem('auth_token');

      const response = await fetch('/api/auth/update-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          role: selectedRole,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update token with role information
        if (data.token) {
          localStorage.setItem('auth_token', data.token);
        }

        // Check if the token contains restaurant information
        const tokenPayload = data.token ? JSON.parse(atob(data.token.split('.')[1])) : null;

        // Redirect based on role and existing restaurant
        if (selectedRole === 'business_admin') {
          // If business_admin already has a restaurant, go to dashboard
          if (tokenPayload?.restaurant_id && tokenPayload?.restaurant_name) {
            router.push('/dashboard/admin');
          } else {
            router.push('/onboarding/restaurant-setup');
          }
        } else {
          router.push('/onboarding/staff-welcome');
        }
      } else {
        // If the error is authentication-related (stale/invalid token), clear and redirect
        if (response.status === 401) {
          console.log('Token invalid or expired - clearing and redirecting to login');
          localStorage.removeItem('auth_token');
          setError('Your session has expired. Please log in again.');
          setTimeout(() => router.push('/auth/phone'), 2000);
          return;
        }

        // Handle 500 errors with helpful message
        if (response.status === 500) {
          console.error('Server error during role update');
          setError('Server error. Please try again or contact support.');
          return;
        }

        // Show user-friendly error message
        if (data.error?.includes('invitation')) {
          // This is an expected flow for new users without invitations
          console.log('User requires invitation to register');
          setError('You need an invitation to register. Please contact your restaurant administrator to receive an invitation link.');
        } else {
          console.error('Failed to update role:', data.error);
          setError(data.error || 'Failed to complete registration. Please try again.');
        }
      }
    } catch (err) {
      console.error('Role selection error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Show loading screen while validating session
  if (validatingSession) {
    return (
      <LoadingScreen
        message="Validating session..."
        subMessage="Please wait"
      />
    );
  }

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-2xl flex-1 flex flex-col">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <Image
              src="/logo.svg"
              alt="Restaurant Daily"
              width={40}
              height={40}
              className="w-10 h-10 mr-3"
            />
            <span className="text-2xl font-bold text-white">Restaurant Daily</span>
          </div>

          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-orange-500/20 blur-xl rounded-full" />
              <div className="relative p-3 bg-gradient-to-br from-orange-500/20 to-amber-500/10 rounded-2xl border border-orange-500/20">
                <Sparkles className="h-8 w-8 text-orange-400" />
              </div>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Welcome to Restaurant Daily!
          </h1>

          <p className="text-white/60 max-w-md mx-auto">
            To get started, please let us know your role at the restaurant.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 max-w-md mx-auto">
            <GlassNotice variant="error" icon={<Shield className="h-4 w-4" />}>
              {error}
            </GlassNotice>
          </div>
        )}

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-2 gap-4 sm:gap-6 mb-8">
          {/* Restaurant Admin */}
          <div
            onClick={() => handleRoleSelect('business_admin')}
            className={cn(
              'glass-card p-6 cursor-pointer transition-all duration-300',
              'hover:-translate-y-1',
              selectedRole === 'business_admin'
                ? 'border-orange-500/50 ring-2 ring-orange-500/30 shadow-lg shadow-orange-500/20'
                : 'border-white/10 hover:border-orange-500/30'
            )}
          >
            <div className="relative text-center">
              {/* Inner gradient overlay */}
              {selectedRole === 'business_admin' && (
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-amber-500/5 pointer-events-none rounded-2xl -m-6 p-6" />
              )}

              {/* Icon */}
              <div className="relative mx-auto mb-4 w-fit">
                <div className={cn(
                  'absolute inset-0 blur-xl rounded-full transition-opacity',
                  selectedRole === 'business_admin' ? 'bg-orange-500/30 opacity-100' : 'bg-orange-500/10 opacity-0'
                )} />
                <div className={cn(
                  'relative p-4 rounded-2xl border transition-all',
                  selectedRole === 'business_admin'
                    ? 'bg-gradient-to-br from-orange-500/20 to-amber-500/10 border-orange-500/30'
                    : 'bg-white/5 border-white/10'
                )}>
                  <Crown className={cn(
                    'h-10 w-10 transition-colors',
                    selectedRole === 'business_admin' ? 'text-orange-400' : 'text-white/60'
                  )} />
                </div>
              </div>

              {/* Title */}
              <h3 className="relative text-xl font-bold text-white mb-3">
                Restaurant Admin
              </h3>

              {/* Description */}
              <p className="relative text-white/50 mb-4 text-sm leading-relaxed">
                I own or manage a restaurant and want to create my restaurant profile,
                invite staff members, and have full administrative control.
              </p>

              {/* Important Notice */}
              <div className="relative bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 mb-4">
                <p className="text-xs text-orange-300 font-medium">
                  Choose this if you need to CREATE a new restaurant
                </p>
              </div>

              {/* Features */}
              <div className="relative space-y-2 text-left">
                <div className="flex items-center text-sm text-white/70">
                  <Building2 className="h-4 w-4 text-orange-400 mr-2 flex-shrink-0" />
                  Set up restaurant profile
                </div>
                <div className="flex items-center text-sm text-white/70">
                  <Users className="h-4 w-4 text-orange-400 mr-2 flex-shrink-0" />
                  Invite and manage staff
                </div>
                <div className="flex items-center text-sm text-white/70">
                  <ChefHat className="h-4 w-4 text-orange-400 mr-2 flex-shrink-0" />
                  Full access to all features
                </div>
              </div>

              {/* Selection indicator */}
              {selectedRole === 'business_admin' && (
                <div className="relative mt-4 flex items-center justify-center text-orange-400">
                  <UserCheck className="h-5 w-5 mr-2" />
                  <span className="font-medium">Selected</span>
                </div>
              )}
            </div>
          </div>

          {/* Staff Member */}
          <div
            onClick={() => handleRoleSelect('employee')}
            className={cn(
              'glass-card p-6 cursor-pointer transition-all duration-300',
              'hover:-translate-y-1',
              selectedRole === 'employee'
                ? 'border-blue-500/50 ring-2 ring-blue-500/30 shadow-lg shadow-blue-500/20'
                : 'border-white/10 hover:border-blue-500/30'
            )}
          >
            <div className="relative text-center">
              {/* Inner gradient overlay */}
              {selectedRole === 'employee' && (
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-cyan-500/5 pointer-events-none rounded-2xl -m-6 p-6" />
              )}

              {/* Icon */}
              <div className="relative mx-auto mb-4 w-fit">
                <div className={cn(
                  'absolute inset-0 blur-xl rounded-full transition-opacity',
                  selectedRole === 'employee' ? 'bg-blue-500/30 opacity-100' : 'bg-blue-500/10 opacity-0'
                )} />
                <div className={cn(
                  'relative p-4 rounded-2xl border transition-all',
                  selectedRole === 'employee'
                    ? 'bg-gradient-to-br from-blue-500/20 to-cyan-500/10 border-blue-500/30'
                    : 'bg-white/5 border-white/10'
                )}>
                  <Users className={cn(
                    'h-10 w-10 transition-colors',
                    selectedRole === 'employee' ? 'text-blue-400' : 'text-white/60'
                  )} />
                </div>
              </div>

              {/* Title */}
              <h3 className="relative text-xl font-bold text-white mb-3">
                Staff Member
              </h3>

              {/* Description */}
              <p className="relative text-white/50 mb-4 text-sm leading-relaxed">
                I work at a restaurant and was invited by my manager to join
                the team for daily operations tracking.
              </p>

              {/* Important Notice */}
              <div className="relative bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-4">
                <p className="text-xs text-blue-300 font-medium">
                  Staff members cannot create restaurants - join existing ones
                </p>
              </div>

              {/* Features */}
              <div className="relative space-y-2 text-left">
                <div className="flex items-center text-sm text-white/70">
                  <ChefHat className="h-4 w-4 text-blue-400 mr-2 flex-shrink-0" />
                  Track daily operations
                </div>
                <div className="flex items-center text-sm text-white/70">
                  <Building2 className="h-4 w-4 text-blue-400 mr-2 flex-shrink-0" />
                  Cash sessions & vouchers
                </div>
                <div className="flex items-center text-sm text-white/70">
                  <Users className="h-4 w-4 text-blue-400 mr-2 flex-shrink-0" />
                  Team collaboration
                </div>
              </div>

              {/* Selection indicator */}
              {selectedRole === 'employee' && (
                <div className="relative mt-4 flex items-center justify-center text-blue-400">
                  <UserCheck className="h-5 w-5 mr-2" />
                  <span className="font-medium">Selected</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <div className="text-center">
          <button
            onClick={handleContinue}
            disabled={!selectedRole || loading}
            className={cn(
              'px-8 py-4 rounded-xl font-semibold text-lg flex items-center justify-center mx-auto',
              'transition-all duration-300 min-w-[220px]',
              'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#050510]',
              selectedRole && !loading
                ? selectedRole === 'business_admin'
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-0.5 active:scale-[0.98] focus:ring-orange-500/50'
                  : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 active:scale-[0.98] focus:ring-blue-500/50'
                : 'bg-white/5 text-white/30 cursor-not-allowed border border-white/10'
            )}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white mr-3" />
                Setting up...
              </>
            ) : selectedRole ? (
              <>
                Continue as {selectedRole === 'business_admin' ? 'Admin' : 'Staff Member'}
                <ArrowRight className="h-5 w-5 ml-3" />
              </>
            ) : (
              <>
                Select your role to continue
                <ArrowRight className="h-5 w-5 ml-3 opacity-50" />
              </>
            )}
          </button>

          {selectedRole && (
            <div className="mt-6 max-w-md mx-auto">
              <p className="text-sm text-white/50 mb-3">
                {selectedRole === 'business_admin'
                  ? "As a Restaurant Admin, you'll be able to create your restaurant profile and invite team members"
                  : "As Staff, you'll join an existing restaurant team for daily operations tracking"
                }
              </p>

              {selectedRole === 'business_admin' && (
                <GlassNotice variant="success" icon={<Shield className="h-4 w-4" />}>
                  This role allows you to create new restaurants
                </GlassNotice>
              )}

              {selectedRole === 'employee' && (
                <GlassNotice variant="warning" icon={<Shield className="h-4 w-4" />}>
                  Staff cannot create restaurants - only join existing ones
                </GlassNotice>
              )}
            </div>
          )}
        </div>

        {/* Help Text */}
        <div className="mt-auto pt-8 text-center">
          <GlassCard size="md" variant="default" className="max-w-md mx-auto">
            <h4 className="font-medium text-white mb-3">Need help choosing?</h4>
            <div className="text-sm text-white/50 space-y-2 text-left">
              <p><span className="text-white/70 font-medium">Choose Admin if:</span> You own/manage a restaurant and need to set it up</p>
              <p><span className="text-white/70 font-medium">Choose Staff if:</span> You work at a restaurant that&apos;s already set up</p>
            </div>
          </GlassCard>

          <p className="text-xs text-white/30 mt-4">
            You can contact support if you need to change your role later.
          </p>
        </div>
      </div>
    </PageLayout>
  );
}
