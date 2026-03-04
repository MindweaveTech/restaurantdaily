'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { CheckCircle, XCircle, Clock, Phone, Building2, UserCheck, ArrowRight, AlertTriangle, Sparkles } from 'lucide-react';
import { PageLayout, LoadingScreen } from '@/components/ui/page-layout';
import { GlassCard, GlassInput, GlassButton, GlassNotice, GlassIconBadge } from '@/components/ui/glass-card';

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
        localStorage.setItem('auth_token', data.token);

        setMessage({
          type: 'success',
          text: 'Welcome to the team! Redirecting to your dashboard...'
        });

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
      <LoadingScreen
        message="Validating invitation..."
        subMessage="Please wait while we verify your invitation"
      />
    );
  }

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-xl flex-1 flex flex-col justify-center">
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
            <GlassIconBadge icon={<UserCheck className="h-8 w-8" />} variant="info" size="lg" glow />
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Staff Invitation
          </h1>

          <p className="text-white/60">
            You&apos;ve been invited to join a restaurant team
          </p>
        </div>

        {/* Main Card */}
        <GlassCard size="lg" variant="info" className="flex-1 flex flex-col">
          {/* Success/Error Message */}
          {message && (
            <GlassNotice
              variant={message.type === 'success' ? 'success' : 'error'}
              icon={message.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
              className="mb-6"
            >
              {message.text}
            </GlassNotice>
          )}

          {/* Invitation Details */}
          {invitation && !message?.type && (
            <>
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-white mb-2 flex items-center justify-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-400" />
                  You&apos;re Invited!
                </h2>
                <p className="text-white/60 text-sm">
                  Join the team and start tracking restaurant performance
                </p>
              </div>

              {/* Restaurant Info Card */}
              <GlassCard size="md" variant="default" className="mb-6">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20 mr-4">
                      <Building2 className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-white/50">Restaurant</p>
                      <p className="font-medium text-white">{invitation.restaurant_name}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20 mr-4">
                      <UserCheck className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm text-white/50">Role</p>
                      <p className="font-medium text-white capitalize">{invitation.role}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/20 mr-4">
                      <Clock className="h-5 w-5 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-sm text-white/50">Expires</p>
                      <p className="font-medium text-white">
                        {new Date(invitation.expires_at).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </GlassCard>

              {/* Info Notice */}
              <GlassNotice variant="info" icon={<Phone className="h-4 w-4" />} title="Verify your phone number" className="mb-6">
                Enter the phone number where you received this invitation to confirm your identity and join the team.
              </GlassNotice>

              {/* Phone Number Form */}
              <form onSubmit={handleAcceptInvitation} className="space-y-6 flex-1 flex flex-col">
                <GlassInput
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Enter your phone number"
                  label="Your Phone Number"
                  helperText="This should match the phone number where you received the invitation"
                  required
                />

                <div className="mt-auto pt-4">
                  <GlassButton
                    type="submit"
                    disabled={isSubmitting || !phoneNumber.trim()}
                    loading={isSubmitting}
                    size="lg"
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 shadow-blue-500/25 hover:shadow-blue-500/40"
                    rightIcon={!isSubmitting ? <ArrowRight className="h-5 w-5" /> : undefined}
                  >
                    {isSubmitting ? 'Accepting Invitation...' : 'Accept Invitation'}
                  </GlassButton>
                </div>
              </form>
            </>
          )}

          {/* Error State - Invalid Invitation */}
          {message?.type === 'error' && !invitation && (
            <div className="text-center py-8 flex-1 flex flex-col items-center justify-center">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full" />
                <div className="relative p-4 bg-gradient-to-br from-red-500/20 to-rose-500/10 rounded-2xl border border-red-500/20">
                  <XCircle className="h-10 w-10 text-red-400" />
                </div>
              </div>

              <h3 className="text-xl font-semibold text-white mb-2">
                Invalid Invitation
              </h3>
              <p className="text-white/50 mb-8 max-w-sm">
                This invitation link is not valid or has expired. Please contact your restaurant administrator for a new invitation.
              </p>

              <GlassButton
                onClick={() => router.push('/')}
                variant="secondary"
                size="md"
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Go to Homepage
              </GlassButton>
            </div>
          )}

          {/* Success State */}
          {message?.type === 'success' && (
            <div className="text-center py-8 flex-1 flex flex-col items-center justify-center">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full" />
                <div className="relative p-4 bg-gradient-to-br from-emerald-500/20 to-green-500/10 rounded-2xl border border-emerald-500/20">
                  <CheckCircle className="h-10 w-10 text-emerald-400" />
                </div>
              </div>

              <h3 className="text-xl font-semibold text-white mb-2">
                Welcome to the Team!
              </h3>
              <p className="text-white/50 mb-4">
                Redirecting you to your dashboard...
              </p>

              <div className="animate-spin rounded-full h-6 w-6 border-2 border-white/20 border-t-emerald-500" />
            </div>
          )}
        </GlassCard>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-white/40">
            Restaurant Daily - Performance Tracking Made Simple
          </p>
        </div>
      </div>
    </PageLayout>
  );
}

export default function AcceptInvitationPage() {
  return (
    <Suspense fallback={
      <LoadingScreen
        message="Loading..."
        subMessage="Please wait"
      />
    }>
      <AcceptInvitationContent />
    </Suspense>
  );
}
