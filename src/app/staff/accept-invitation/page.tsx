'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ChefHat, CheckCircle, XCircle, Clock, Phone, Building2 } from 'lucide-react';

interface InvitationDetails {
  restaurant_name: string;
  expires_at: string;
  phone: string;
  role: string;
  status: string;
}

function AcceptInvitationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const invitationToken = searchParams.get('token');
    if (invitationToken) {
      setToken(invitationToken);
      validateInvitation(invitationToken);
    } else {
      setMessage({
        type: 'error',
        text: 'Invalid invitation link. Please check the link and try again.'
      });
    }
  }, [searchParams]);

  const validateInvitation = async (invitationToken: string) => {
    setIsLoading(true);
    try {
      // For now, we'll validate the invitation by attempting to get details
      // In a real implementation, you might want a separate validation endpoint
      const response = await fetch('/api/staff/validate-invitation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invitation_token: invitationToken })
      });

      if (response.ok) {
        const data = await response.json();
        setInvitation(data.invitation);
      } else {
        const data = await response.json();
        setMessage({
          type: 'error',
          text: data.error || 'This invitation is no longer valid or has expired.'
        });
      }
    } catch {
      setMessage({
        type: 'error',
        text: 'Failed to validate invitation. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !phoneNumber.trim()) return;

    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch('/api/staff/accept-invitation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invitation_token: token,
          phone: phoneNumber
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Store the auth token
        localStorage.setItem('auth_token', data.token);

        setMessage({
          type: 'success',
          text: 'Welcome to the team! Redirecting to your dashboard...'
        });

        // Redirect to staff dashboard after a short delay
        setTimeout(() => {
          router.push('/dashboard/staff');
        }, 2000);
      } else {
        setMessage({
          type: 'error',
          text: data.error || 'Failed to accept invitation. Please try again.'
        });
      }
    } catch {
      setMessage({
        type: 'error',
        text: 'Something went wrong. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Validating invitation...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mb-4">
            <ChefHat className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Restaurant Daily</h1>
          <p className="text-gray-600">Staff Invitation</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {message && (
            <div className={`mb-6 p-4 rounded-lg flex items-center ${
              message.type === 'success'
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="h-5 w-5 mr-3 flex-shrink-0" />
              ) : (
                <XCircle className="h-5 w-5 mr-3 flex-shrink-0" />
              )}
              {message.text}
            </div>
          )}

          {invitation && !message?.type && (
            <>
              {/* Invitation Details */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  You&apos;re Invited! 🎉
                </h2>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center">
                    <Building2 className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Restaurant</p>
                      <p className="font-medium text-gray-900">{invitation.restaurant_name}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Role</p>
                      <p className="font-medium text-gray-900 capitalize">{invitation.role}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Expires</p>
                      <p className="font-medium text-gray-900">
                        {new Date(invitation.expires_at).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-orange-800">
                    <strong>Join the team!</strong> Enter your phone number below to accept this invitation
                    and start tracking restaurant performance with Restaurant Daily.
                  </p>
                </div>
              </div>

              {/* Phone Number Form */}
              <form onSubmit={handleAcceptInvitation}>
                <div className="mb-6">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="h-4 w-4 inline mr-2" />
                    Your Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Enter the phone number this invitation was sent to"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This should match the phone number where you received the invitation
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !phoneNumber.trim()}
                  className="w-full flex items-center justify-center px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Accepting Invitation...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Accept Invitation
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          {message?.type === 'error' && !invitation && (
            <div className="text-center py-8">
              <XCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Invalid Invitation
              </h3>
              <p className="text-gray-600 mb-6">
                This invitation link is not valid or has expired. Please contact your restaurant
                administrator for a new invitation.
              </p>
              <button
                onClick={() => router.push('/')}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Go to Homepage
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Restaurant Daily - Performance Tracking Made Simple
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AcceptInvitationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Loading...</h2>
        </div>
      </div>
    }>
      <AcceptInvitationContent />
    </Suspense>
  );
}