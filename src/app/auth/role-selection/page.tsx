'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChefHat, Users, Building2, ArrowRight, Crown, UserCheck, Shield } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export default function RoleSelectionPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<'admin' | 'staff' | null>(null);
  const [loading, setLoading] = useState(false);
  const [validatingSession, setValidatingSession] = useState(true);

  // Validate user session on page load
  useEffect(() => {
    const validateSession = () => {
      const token = localStorage.getItem('auth_token');

      if (!token) {
        router.push('/auth/phone');
        return;
      }

      try {
        // Check if token is valid and not expired
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Math.floor(Date.now() / 1000);

        if (payload.exp < currentTime) {
          localStorage.removeItem('auth_token');
          router.push('/auth/phone');
          return;
        }

        // Token is valid
        setValidatingSession(false);
      } catch {
        localStorage.removeItem('auth_token');
        router.push('/auth/phone');
      }
    };

    validateSession();
  }, [router]);

  const handleRoleSelect = (role: 'admin' | 'staff') => {
    setSelectedRole(role);
  };

  const handleContinue = async () => {
    if (!selectedRole) return;

    setLoading(true);

    try {
      // Update user role in backend
      const authToken = localStorage.getItem('auth_token');

      // Map frontend role names to API role names
      const apiRole = selectedRole === 'admin' ? 'business_admin' : 'employee';

      const response = await fetch('/api/auth/update-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          role: apiRole,
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
        if (selectedRole === 'admin') {
          // If admin already has a restaurant, go to dashboard
          if (tokenPayload?.restaurant_id && tokenPayload?.restaurant_name) {
            router.push('/dashboard/admin');
          } else {
            router.push('/onboarding/restaurant-setup');
          }
        } else {
          router.push('/onboarding/staff-welcome');
        }
      } else {
        // If the error is authentication-related, redirect to login
        if (response.status === 401) {
          localStorage.removeItem('auth_token');
          router.push('/auth/phone');
          return;
        }

        // If employee needs invitation, show error and don't proceed
        if (response.status === 403 && selectedRole === 'staff') {
          alert(data.error || 'Staff members must be invited by a restaurant administrator.');
          setLoading(false);
          return;
        }

        // For admins, allow them to proceed to create a restaurant
        if (selectedRole === 'admin') {
          router.push('/onboarding/restaurant-setup');
        } else {
          // Staff without invitation - show error
          alert(data.error || 'Unable to proceed. Please contact your administrator.');
        }
      }
    } catch {
      // For admins, allow them to proceed to create a restaurant
      if (selectedRole === 'admin') {
        router.push('/onboarding/restaurant-setup');
      } else {
        // Staff without successful API call - show error
        alert('Unable to connect. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Show loading screen while validating session
  if (validatingSession) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Animated Background */}
        <div className="animated-bg">
          <div className="gradient-orb orb-1" />
          <div className="gradient-orb orb-2" />
          <div className="gradient-orb orb-3" />
          <div className="gradient-orb orb-4" />
          <div className="gradient-orb orb-5" />
          <div className="noise-overlay" />
          <div className="grid-overlay" />
        </div>

        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="glass-card p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/30 border-t-orange-500 mx-auto mb-4" />
            <p className="text-white/60">Validating session...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="animated-bg">
        <div className="gradient-orb orb-1" />
        <div className="gradient-orb orb-2" />
        <div className="gradient-orb orb-3" />
        <div className="gradient-orb orb-4" />
        <div className="gradient-orb orb-5" />
        <div className="noise-overlay" />
        <div className="grid-overlay" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        <div className="container mx-auto px-4 py-6 sm:py-8 max-w-2xl flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-center mb-8">
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
          </div>

          {/* Main Card */}
          <div className="flex-1 flex items-center justify-center py-4">
            <div className="glass-card w-full p-6 sm:p-8">
              {/* Inner gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-amber-500/5 pointer-events-none rounded-3xl" />

              {/* Header Section */}
              <div className="relative text-center mb-8">
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-orange-500/20 blur-xl rounded-full" />
                    <div className="relative p-3 bg-gradient-to-br from-orange-500/20 to-amber-500/10 rounded-2xl border border-orange-500/20">
                      <Crown className="h-8 w-8 text-orange-400" />
                    </div>
                  </div>
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  Choose Your Role
                </h1>
                <p className="text-white/60 text-sm sm:text-base">
                  Select how you&apos;ll be using Restaurant Daily
                </p>
              </div>

              {/* Role Selection Cards */}
              <div className="relative grid sm:grid-cols-2 gap-4 mb-6">
                {/* Restaurant Admin */}
                <div
                  onClick={() => handleRoleSelect('admin')}
                  className={cn(
                    'relative p-5 rounded-2xl cursor-pointer transition-all duration-300',
                    'border-2 backdrop-blur-sm',
                    selectedRole === 'admin'
                      ? 'bg-orange-500/10 border-orange-500/50 shadow-lg shadow-orange-500/10'
                      : 'bg-white/5 border-white/10 hover:border-orange-500/30 hover:bg-white/10'
                  )}
                >
                  <div className="text-center">
                    {/* Icon */}
                    <div className={cn(
                      'mx-auto mb-3 p-3 rounded-xl w-fit',
                      selectedRole === 'admin'
                        ? 'bg-orange-500/20'
                        : 'bg-white/10'
                    )}>
                      <Crown className={cn(
                        'h-8 w-8',
                        selectedRole === 'admin'
                          ? 'text-orange-400'
                          : 'text-white/60'
                      )} />
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-white mb-2">
                      Restaurant Admin
                    </h3>

                    {/* Description */}
                    <p className="text-white/50 mb-3 text-xs leading-relaxed">
                      Create your restaurant profile, invite staff, and manage operations.
                    </p>

                    {/* Features */}
                    <div className="space-y-1.5 text-left">
                      <div className="flex items-center text-xs text-white/70">
                        <Building2 className="h-3.5 w-3.5 text-orange-400 mr-2 flex-shrink-0" />
                        Set up restaurant profile
                      </div>
                      <div className="flex items-center text-xs text-white/70">
                        <Users className="h-3.5 w-3.5 text-orange-400 mr-2 flex-shrink-0" />
                        Invite and manage staff
                      </div>
                      <div className="flex items-center text-xs text-white/70">
                        <ChefHat className="h-3.5 w-3.5 text-orange-400 mr-2 flex-shrink-0" />
                        Full access to features
                      </div>
                    </div>

                    {/* Selection indicator */}
                    {selectedRole === 'admin' && (
                      <div className="mt-3 flex items-center justify-center text-orange-400">
                        <UserCheck className="h-4 w-4 mr-1.5" />
                        <span className="text-sm font-medium">Selected</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Staff Member */}
                <div
                  onClick={() => handleRoleSelect('staff')}
                  className={cn(
                    'relative p-5 rounded-2xl cursor-pointer transition-all duration-300',
                    'border-2 backdrop-blur-sm',
                    selectedRole === 'staff'
                      ? 'bg-blue-500/10 border-blue-500/50 shadow-lg shadow-blue-500/10'
                      : 'bg-white/5 border-white/10 hover:border-blue-500/30 hover:bg-white/10'
                  )}
                >
                  <div className="text-center">
                    {/* Icon */}
                    <div className={cn(
                      'mx-auto mb-3 p-3 rounded-xl w-fit',
                      selectedRole === 'staff'
                        ? 'bg-blue-500/20'
                        : 'bg-white/10'
                    )}>
                      <Users className={cn(
                        'h-8 w-8',
                        selectedRole === 'staff'
                          ? 'text-blue-400'
                          : 'text-white/60'
                      )} />
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-white mb-2">
                      Staff Member
                    </h3>

                    {/* Description */}
                    <p className="text-white/50 mb-3 text-xs leading-relaxed">
                      Join your restaurant team for daily operations tracking.
                    </p>

                    {/* Features */}
                    <div className="space-y-1.5 text-left">
                      <div className="flex items-center text-xs text-white/70">
                        <ChefHat className="h-3.5 w-3.5 text-blue-400 mr-2 flex-shrink-0" />
                        Track daily operations
                      </div>
                      <div className="flex items-center text-xs text-white/70">
                        <Building2 className="h-3.5 w-3.5 text-blue-400 mr-2 flex-shrink-0" />
                        Cash sessions & vouchers
                      </div>
                      <div className="flex items-center text-xs text-white/70">
                        <Users className="h-3.5 w-3.5 text-blue-400 mr-2 flex-shrink-0" />
                        Team collaboration
                      </div>
                    </div>

                    {/* Selection indicator */}
                    {selectedRole === 'staff' && (
                      <div className="mt-3 flex items-center justify-center text-blue-400">
                        <UserCheck className="h-4 w-4 mr-1.5" />
                        <span className="text-sm font-medium">Selected</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Continue Button */}
              <button
                onClick={handleContinue}
                disabled={!selectedRole || loading}
                className={cn(
                  'relative w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-base mb-4',
                  'transition-all duration-300 overflow-hidden',
                  'focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:ring-offset-2 focus:ring-offset-[#050510]',
                  selectedRole && !loading
                    ? selectedRole === 'admin'
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-0.5 active:scale-[0.98]'
                      : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 active:scale-[0.98]'
                    : 'bg-white/5 text-white/30 cursor-not-allowed border border-white/10'
                )}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white" />
                    <span>Setting up...</span>
                  </>
                ) : selectedRole ? (
                  <>
                    <span>Continue as {selectedRole === 'admin' ? 'Admin' : 'Staff'}</span>
                    <ArrowRight className="h-5 w-5" />
                  </>
                ) : (
                  <>
                    <span>Select your role to continue</span>
                    <ArrowRight className="h-5 w-5 opacity-50" />
                  </>
                )}
              </button>

              {/* Role Info */}
              {selectedRole && (
                <div className={cn(
                  'relative p-3 rounded-xl border text-center',
                  selectedRole === 'admin'
                    ? 'bg-orange-500/5 border-orange-500/20'
                    : 'bg-blue-500/5 border-blue-500/20'
                )}>
                  <p className={cn(
                    'text-xs',
                    selectedRole === 'admin' ? 'text-orange-300' : 'text-blue-300'
                  )}>
                    {selectedRole === 'admin'
                      ? '✓ You can create new restaurants and invite team members'
                      : '⚠ Staff members need an invitation to join a restaurant'
                    }
                  </p>
                </div>
              )}

              {/* Help Section */}
              <div className="relative mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-orange-500/10 rounded-lg shrink-0">
                    <Shield className="h-4 w-4 text-orange-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white/80 mb-1">Need help?</h4>
                    <p className="text-xs text-white/40 leading-relaxed">
                      <strong className="text-white/60">Admin:</strong> Own/manage a restaurant and need to set it up.
                      <br />
                      <strong className="text-white/60">Staff:</strong> Work at a restaurant that&apos;s already set up.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center py-4">
            <p className="text-xs text-white/30">
              You can contact support if you need to change your role later.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
