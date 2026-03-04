'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, RotateCcw, Shield, CheckCircle, KeyRound } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export default function VerifyOTPPage() {
  const router = useRouter();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpMethod, setOtpMethod] = useState<'sms' | 'whatsapp'>('sms');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [canResend, setCanResend] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Get pending phone number and method from session storage
  useEffect(() => {
    const pendingPhone = sessionStorage.getItem('pendingPhone');
    const method = sessionStorage.getItem('otpMethod') as 'sms' | 'whatsapp';

    if (!pendingPhone) {
      router.push('/auth/phone');
      return;
    }

    setPhoneNumber(pendingPhone);
    setOtpMethod(method || 'sms');
  }, [router]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) {
      setCanResend(true);
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft]);

  // Auto-focus first input
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (error) setError('');

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newOtp.every(digit => digit !== '') && newOtp.join('').length === 6) {
      handleVerifyOTP(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '');

    if (pastedData.length === 6) {
      const digits = pastedData.split('');
      setOtp(digits);
      handleVerifyOTP(pastedData);
    }
  };

  const handleVerifyOTP = async (otpCode?: string) => {
    const codeToVerify = otpCode || otp.join('');

    if (codeToVerify.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber,
          otpCode: codeToVerify,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.token) {
          localStorage.setItem('auth_token', data.token);
        }

        sessionStorage.removeItem('pendingPhone');
        sessionStorage.removeItem('otpMethod');

        setSuccess(true);
        setTimeout(() => {
          router.push('/auth/role-selection');
        }, 1500);
      } else {
        setError(data.error || 'Invalid verification code. Please try again.');
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
      console.error('OTP verification error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResendLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/request-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber,
          preferredMethod: otpMethod,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setTimeLeft(300);
        setCanResend(false);
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } else {
        setError(data.error || 'Failed to resend code. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Resend OTP error:', err);
    } finally {
      setResendLoading(false);
    }
  };

  const maskPhoneNumber = (phone: string) => {
    if (phone.length <= 4) return phone;
    const visiblePart = phone.slice(-4);
    const maskedPart = '*'.repeat(phone.length - 4);
    return maskedPart + visiblePart;
  };

  const isComplete = otp.every(digit => digit !== '');

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
              href="/auth/phone"
              className="flex items-center text-white/60 hover:text-white transition-colors text-sm group"
              aria-label="Go back to phone input"
            >
              <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back
            </Link>

            <div className="flex items-center gap-2">
              <Image
                src="/logo.png"
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
            <div className="glass-card w-full p-6 sm:p-8">
              {/* Inner gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-amber-500/5 pointer-events-none rounded-3xl" />

              {/* Header Section */}
              <div className="relative text-center mb-8">
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-orange-500/20 blur-xl rounded-full" />
                    <div className={cn(
                      "relative p-3 rounded-2xl border transition-all duration-500",
                      success
                        ? "bg-gradient-to-br from-emerald-500/20 to-green-500/10 border-emerald-500/20"
                        : "bg-gradient-to-br from-orange-500/20 to-amber-500/10 border-orange-500/20"
                    )}>
                      {success ? (
                        <CheckCircle className="h-8 w-8 text-emerald-400" />
                      ) : (
                        <KeyRound className="h-8 w-8 text-orange-400" />
                      )}
                    </div>
                  </div>
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  {success ? 'Verified!' : 'Enter Verification Code'}
                </h1>

                {!success && (
                  <>
                    <p className="text-white/60 text-sm sm:text-base mb-1">
                      We sent a 6-digit code via {otpMethod === 'sms' ? 'SMS' : 'WhatsApp'} to:
                    </p>
                    <p className="font-medium text-orange-300 text-sm sm:text-base">
                      {maskPhoneNumber(phoneNumber)}
                    </p>
                  </>
                )}
              </div>

              {!success && (
                <>
                  {/* OTP Input */}
                  <div className="relative mb-6">
                    <div className="flex justify-center space-x-2 sm:space-x-3 mb-4">
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          ref={(el) => { inputRefs.current[index] = el; }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(index, e)}
                          onPaste={index === 0 ? handlePaste : undefined}
                          disabled={loading}
                          className={cn(
                            'w-11 h-14 sm:w-12 sm:h-16 text-center text-xl sm:text-2xl font-semibold rounded-xl',
                            'bg-white/5 border-2 text-white',
                            'focus:outline-none focus:ring-2 focus:ring-orange-500/50',
                            'transition-all duration-300',
                            digit
                              ? 'border-emerald-500/50 bg-emerald-500/5'
                              : 'border-white/10',
                            error && 'border-red-500/50 bg-red-500/5 animate-shake',
                            loading && 'opacity-50 cursor-not-allowed'
                          )}
                          aria-label={`Digit ${index + 1} of verification code`}
                        />
                      ))}
                    </div>

                    {/* Timer */}
                    <div className="text-center text-sm">
                      {timeLeft > 0 ? (
                        <span className="text-white/50">
                          Code expires in{' '}
                          <span className="text-orange-400 font-medium">{formatTime(timeLeft)}</span>
                        </span>
                      ) : (
                        <span className="text-red-400">Code has expired</span>
                      )}
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="relative mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                      <p className="text-sm text-red-400 text-center">{error}</p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    onClick={() => handleVerifyOTP()}
                    disabled={!isComplete || loading}
                    className={cn(
                      'relative w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-base mb-4',
                      'transition-all duration-300 overflow-hidden',
                      'focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:ring-offset-2 focus:ring-offset-[#050510]',
                      isComplete && !loading
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-0.5 active:scale-[0.98]'
                        : 'bg-white/5 text-white/30 cursor-not-allowed border border-white/10'
                    )}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-5 w-5" />
                        <span>Verify Code</span>
                      </>
                    )}
                  </button>

                  {/* Resend Button */}
                  <div className="relative text-center">
                    <button
                      onClick={handleResendOTP}
                      disabled={!canResend || resendLoading}
                      className={cn(
                        'text-sm font-medium transition-all duration-200',
                        canResend && !resendLoading
                          ? 'text-orange-400 hover:text-orange-300'
                          : 'text-white/30 cursor-not-allowed'
                      )}
                    >
                      {resendLoading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-orange-500/30 border-t-orange-500" />
                          <span>Sending...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <RotateCcw className="h-4 w-4" />
                          <span>Resend Code</span>
                        </div>
                      )}
                    </button>
                  </div>

                  {/* Help Text */}
                  <div className="relative mt-6 p-4 bg-orange-500/5 rounded-xl border border-orange-500/10">
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 bg-orange-500/10 rounded-lg shrink-0">
                        <Shield className="h-4 w-4 text-orange-400" />
                      </div>
                      <div>
                        <p className="text-xs text-white/40 leading-relaxed">
                          Didn&apos;t receive the code? Check your {otpMethod === 'sms' ? 'SMS' : 'WhatsApp'} and try resending. Make sure you have a stable connection.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {success && (
                <div className="relative text-center py-4">
                  <div className="animate-pulse">
                    <p className="text-emerald-400 text-sm">
                      Redirecting to your dashboard...
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
