'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChefHat, Users, Building2, ArrowRight, Crown, UserCheck } from 'lucide-react';
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

        // Token is valid
        setValidatingSession(false);
      } catch {
        console.error('Invalid token format, redirecting to login');
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
        console.error('Failed to update role:', data.error);

        // If the error is authentication-related, redirect to login
        if (response.status === 401) {
          console.log('Authentication failed, redirecting to login');
          localStorage.removeItem('auth_token');
          router.push('/auth/phone');
          return;
        }

        // For other errors, continue anyway for now but log the issue
        console.warn('Role update failed but continuing with flow');
        // Try to check existing token for restaurant info even on error
        const currentToken = localStorage.getItem('auth_token');
        const currentPayload = currentToken ? JSON.parse(atob(currentToken.split('.')[1])) : null;

        if (selectedRole === 'admin') {
          if (currentPayload?.restaurant_id && currentPayload?.restaurant_name) {
            router.push('/dashboard/admin');
          } else {
            router.push('/onboarding/restaurant-setup');
          }
        } else {
          router.push('/onboarding/staff-welcome');
        }
      }
    } catch (error) {
      console.error('Role selection error:', error);
      // Continue anyway for now - we can handle this gracefully
      // Try to check existing token for restaurant info
      const currentToken = localStorage.getItem('auth_token');
      const currentPayload = currentToken ? JSON.parse(atob(currentToken.split('.')[1])) : null;

      if (selectedRole === 'admin') {
        if (currentPayload?.restaurant_id && currentPayload?.restaurant_name) {
          router.push('/dashboard/admin');
        } else {
          router.push('/onboarding/restaurant-setup');
        }
      } else {
        router.push('/onboarding/staff-welcome');
      }
    } finally {
      setLoading(false);
    }
  };

  // Show loading screen while validating session
  if (validatingSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Validating session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <ChefHat className="h-8 w-8 text-orange-600 mr-3" />
            <span className="text-2xl font-bold text-gray-800">Restaurant Daily</span>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Restaurant Daily!
          </h1>

          <p className="text-lg text-gray-600 max-w-md mx-auto">
            To get started, please let us know your role at the restaurant.
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Restaurant Admin */}
          <div
            onClick={() => handleRoleSelect('admin')}
            className={cn(
              'bg-white rounded-xl shadow-lg border-2 cursor-pointer transition-all duration-300',
              'hover:shadow-xl hover:scale-105 p-6',
              selectedRole === 'admin'
                ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-200'
                : 'border-gray-200 hover:border-orange-300'
            )}
          >
            <div className="text-center">
              {/* Icon */}
              <div className={cn(
                'mx-auto mb-4 p-4 rounded-full',
                selectedRole === 'admin'
                  ? 'bg-orange-100'
                  : 'bg-gray-100'
              )}>
                <Crown className={cn(
                  'h-12 w-12',
                  selectedRole === 'admin'
                    ? 'text-orange-600'
                    : 'text-gray-600'
                )} />
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Restaurant Admin
              </h3>

              {/* Description */}
              <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                I own or manage a restaurant and want to create my restaurant profile,
                invite staff members, and have full administrative control.
              </p>

              {/* Important Notice */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
                <p className="text-xs text-orange-800 font-medium">
                  ⚠️ Choose this if you need to CREATE a new restaurant
                </p>
              </div>

              {/* Features */}
              <div className="space-y-2 text-left">
                <div className="flex items-center text-sm text-gray-700">
                  <Building2 className="h-4 w-4 text-orange-500 mr-2 flex-shrink-0" />
                  Set up restaurant profile
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <Users className="h-4 w-4 text-orange-500 mr-2 flex-shrink-0" />
                  Invite and manage staff
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <ChefHat className="h-4 w-4 text-orange-500 mr-2 flex-shrink-0" />
                  Full access to all features
                </div>
              </div>

              {/* Selection indicator */}
              {selectedRole === 'admin' && (
                <div className="mt-4 flex items-center justify-center text-orange-600">
                  <UserCheck className="h-5 w-5 mr-2" />
                  <span className="font-medium">Selected</span>
                </div>
              )}
            </div>
          </div>

          {/* Staff Member */}
          <div
            onClick={() => handleRoleSelect('staff')}
            className={cn(
              'bg-white rounded-xl shadow-lg border-2 cursor-pointer transition-all duration-300',
              'hover:shadow-xl hover:scale-105 p-6',
              selectedRole === 'staff'
                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                : 'border-gray-200 hover:border-blue-300'
            )}
          >
            <div className="text-center">
              {/* Icon */}
              <div className={cn(
                'mx-auto mb-4 p-4 rounded-full',
                selectedRole === 'staff'
                  ? 'bg-blue-100'
                  : 'bg-gray-100'
              )}>
                <Users className={cn(
                  'h-12 w-12',
                  selectedRole === 'staff'
                    ? 'text-blue-600'
                    : 'text-gray-600'
                )} />
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Staff Member
              </h3>

              {/* Description */}
              <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                I work at a restaurant and was invited by my manager to join
                the team for daily operations tracking.
              </p>

              {/* Important Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-xs text-blue-800 font-medium">
                  ℹ️ Staff members cannot create restaurants - join existing ones
                </p>
              </div>

              {/* Features */}
              <div className="space-y-2 text-left">
                <div className="flex items-center text-sm text-gray-700">
                  <ChefHat className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0" />
                  Track daily operations
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <Building2 className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0" />
                  Cash sessions & vouchers
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <Users className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0" />
                  Team collaboration
                </div>
              </div>

              {/* Selection indicator */}
              {selectedRole === 'staff' && (
                <div className="mt-4 flex items-center justify-center text-blue-600">
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
              'px-8 py-4 rounded-lg font-semibold text-lg flex items-center justify-center mx-auto',
              'transition-all duration-200 shadow-md min-w-[200px]',
              'focus:outline-none focus:ring-2 focus:ring-offset-2',
              selectedRole && !loading
                ? selectedRole === 'admin'
                  ? 'bg-orange-600 hover:bg-orange-700 text-white shadow-lg hover:shadow-xl focus:ring-orange-500'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl focus:ring-blue-500'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            )}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3" />
                Setting up...
              </>
            ) : selectedRole ? (
              <>
                Continue as {selectedRole === 'admin' ? 'Admin' : 'Staff Member'}
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
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-3">
                {selectedRole === 'admin'
                  ? "As a Restaurant Admin, you'll be able to create your restaurant profile and invite team members"
                  : "As Staff, you'll join an existing restaurant team for daily operations tracking"
                }
              </p>

              {selectedRole === 'admin' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-xs text-green-800">
                    ✅ This role allows you to create new restaurants
                  </p>
                </div>
              )}

              {selectedRole === 'staff' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-xs text-yellow-800">
                    ⚠️ Staff cannot create restaurants - only join existing ones
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Help Text */}
        <div className="mt-12 text-center">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-w-md mx-auto">
            <h4 className="font-medium text-gray-800 mb-2">Need help choosing?</h4>
            <div className="text-sm text-gray-600 space-y-2 text-left">
              <p><strong>Choose Admin if:</strong> You own/manage a restaurant and need to set it up</p>
              <p><strong>Choose Staff if:</strong> You work at a restaurant that&apos;s already set up</p>
            </div>
          </div>

          <p className="text-xs text-gray-400 mt-4">
            You can contact support if you need to change your role later.
          </p>
        </div>
      </div>
    </div>
  );
}