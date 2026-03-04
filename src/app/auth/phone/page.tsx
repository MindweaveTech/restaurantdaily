'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send, Shield, Sparkles } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import PhoneInput from '@/components/ui/phone-input';
import { cn } from '@/lib/utils';

export default function PhoneAuthPage() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePhoneChange = (phone: string, valid: boolean) => {
    setPhoneNumber(phone);
    setIsValid(valid);
    if (error) setError('');
  };

  const handleRequestOTP = async () => {
    if (!isValid || !phoneNumber.trim()) {
      setError('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/request-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber.trim(),
          preferredMethod: 'sms',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        sessionStorage.setItem('pendingPhone', phoneNumber.trim());
        sessionStorage.setItem('otpMethod', data.method || 'sms');
        router.push('/auth/verify');
      } else {
        setError(data.error || 'Failed to send verification code. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
      console.error('OTP request error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isValid && !loading) {
      handleRequestOTP();
    }
  };

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
        <div className="container mx-auto px-4 py-6 sm:py-8 max-w-md flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Link
              href="/"
              className="flex items-center text-white/60 hover:text-white transition-colors text-sm group"
              aria-label="Go back to home"
            >
              <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back
            </Link>

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

          {/* Auth Card */}
          <div className="flex-1 flex items-center justify-center py-4">
            <div className="glass-card w-full p-6 sm:p-8 stagger-children">
              {/* Inner gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-amber-500/5 pointer-events-none rounded-3xl" />

              {/* Header Section */}
              <div className="relative text-center mb-8">
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-orange-500/20 blur-xl rounded-full" />
                    <div className="relative p-3 bg-gradient-to-br from-orange-500/20 to-amber-500/10 rounded-2xl border border-orange-500/20">
                      <Sparkles className="h-8 w-8 text-orange-400" />
                    </div>
                  </div>
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  Welcome Back
                </h1>
                <p className="text-white/60 text-sm sm:text-base">
                  Enter your phone number to access your restaurant dashboard
                </p>
              </div>

              {/* Phone Input Form */}
              <div className="relative space-y-6" onKeyPress={handleKeyPress}>
                <PhoneInput
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  placeholder="Enter your mobile number"
                  defaultCountry="IN"
                  required
                  disabled={loading}
                  error={error}
                  loading={loading}
                  className="w-full"
                />

                {/* Submit Button */}
                <button
                  onClick={handleRequestOTP}
                  disabled={!isValid || loading}
                  data-testid="send-otp-button"
                  className={cn(
                    'w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-base',
                    'transition-all duration-300 relative overflow-hidden',
                    'focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:ring-offset-2 focus:ring-offset-[#050510]',
                    isValid && !loading
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-0.5 active:scale-[0.98]'
                      : 'bg-white/5 text-white/30 cursor-not-allowed border border-white/10'
                  )}
                  aria-describedby="submit-help"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white" />
                      <span>Sending Code...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      <span>Send Verification Code</span>
                    </>
                  )}
                  {/* Shine effect */}
                  {isValid && !loading && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700" />
                  )}
                </button>

                <p id="submit-help" className="text-xs text-white/40 text-center">
                  We&apos;ll send a 6-digit code via SMS to verify your number
                </p>
              </div>

              {/* Security Notice */}
              <div className="relative mt-8 p-4 bg-orange-500/5 rounded-xl border border-orange-500/10">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-orange-500/10 rounded-lg shrink-0">
                    <Shield className="h-4 w-4 text-orange-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-orange-300 mb-1">
                      Secure Authentication
                    </h3>
                    <p className="text-xs text-white/40 leading-relaxed">
                      Your phone number is used only for authentication. We never share your information with third parties.
                    </p>
                  </div>
                </div>
              </div>

              {/* Help Text */}
              <div className="relative mt-6 text-center">
                <p className="text-xs text-white/40 mb-2">
                  Having trouble? Check that your number can receive SMS.
                </p>
                <Link
                  href="/"
                  className="text-xs text-orange-400 hover:text-orange-300 transition-colors"
                >
                  Need help? Contact support
                </Link>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center py-6">
            <p className="text-xs text-white/30">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
