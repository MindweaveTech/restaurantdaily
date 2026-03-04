'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ChefHat, ArrowLeft, RotateCcw, Shield, CheckCircle } from 'lucide-react';
import Link from 'next/link';
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

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Get pending phone number and method from session storage
  useEffect(() => {
    const pendingPhone = sessionStorage.getItem('pendingPhone');
    const method = sessionStorage.getItem('otpMethod') as 'sms' | 'whatsapp';

    if (!pendingPhone) {
      // No pending OTP, redirect to phone input
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
    if (!/^\d?$/.test(value)) return; // Only allow digits

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (error) setError(''); // Clear error when user types

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all fields filled
    if (newOtp.every(digit => digit !== '') && newOtp.join('').length === 6) {
      handleVerifyOTP(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      // Move to previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, ''); // Remove non-digits

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
        // Store authentication token
        if (data.token) {
          localStorage.setItem('auth_token', data.token);
        }

        // Clear session storage
        sessionStorage.removeItem('pendingPhone');
        sessionStorage.removeItem('otpMethod');

        // All users go to role selection
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
        setTimeLeft(300); // Reset timer to 5 minutes
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex flex-col">
      <div className="container mx-auto px-4 py-4 sm:py-8 max-w-md flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <Link
            href="/auth/phone"
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors text-sm sm:text-base"
            aria-label="Go back to phone input"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            Back
          </Link>

          <div className="flex items-center">
            <ChefHat className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600 mr-2" />
            <span className="text-base sm:text-lg font-semibold text-gray-800">Restaurant Daily</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 flex-1 flex flex-col">
          <div className="text-center mb-6 sm:mb-8">
            <div className="flex justify-center mb-3 sm:mb-4">
              <div className="p-2 sm:p-3 bg-orange-100 rounded-full">
                <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
              </div>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              Enter Verification Code
            </h1>

            <p className="text-sm sm:text-base text-gray-600 mb-1 px-2 sm:px-0">
              We sent a 6-digit code via {otpMethod === 'sms' ? 'SMS' : 'WhatsApp'} to:
            </p>

            <p className="font-medium text-gray-800 mb-4 text-sm sm:text-base">
              {maskPhoneNumber(phoneNumber)}
            </p>
          </div>

          {/* OTP Input */}
          <div className="mb-4 sm:mb-6 flex-1 flex flex-col">
            <div className="flex justify-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
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
                    'w-10 h-10 sm:w-12 sm:h-12 text-center text-lg sm:text-xl font-semibold rounded-lg border-2',
                    'focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500',
                    'transition-all duration-200',
                    digit ? 'border-green-300 bg-green-50' : 'border-gray-300',
                    error && 'border-red-300 bg-red-50',
                    loading && 'opacity-50 cursor-not-allowed'
                  )}
                  aria-label={`Digit ${index + 1} of verification code`}
                />
              ))}
            </div>

            {/* Timer */}
            <div className="text-center text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
              {timeLeft > 0 ? (
                <>Code expires in {formatTime(timeLeft)}</>
              ) : (
                <span className="text-red-600">Code has expired</span>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-xs sm:text-sm text-red-700 text-center">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={() => handleVerifyOTP()}
            disabled={!isComplete || loading}
            className={cn(
              'w-full flex items-center justify-center px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base',
              'transition-all duration-200 shadow-sm mb-3 sm:mb-4',
              'focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2',
              isComplete && !loading
                ? 'bg-orange-600 hover:bg-orange-700 text-white shadow-md hover:shadow-lg'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            )}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white mr-2" />
                <span className="text-sm sm:text-base">Verifying...</span>
              </>
            ) : (
              <>
                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                <span className="text-sm sm:text-base">Verify Code</span>
              </>
            )}
          </button>

          {/* Resend Button */}
          <div className="text-center">
            <button
              onClick={handleResendOTP}
              disabled={!canResend || resendLoading}
              className={cn(
                'text-xs sm:text-sm font-medium transition-colors',
                canResend && !resendLoading
                  ? 'text-orange-600 hover:text-orange-700 underline'
                  : 'text-gray-400 cursor-not-allowed'
              )}
            >
              {resendLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-orange-600 mr-2" />
                  <span className="text-xs sm:text-sm">Sending...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <RotateCcw className="h-3 w-3 mr-1" />
                  <span className="text-xs sm:text-sm">Resend Code</span>
                </div>
              )}
            </button>
          </div>

          {/* Help Text */}
          <div className="mt-4 sm:mt-6 text-center">
            <p className="text-xs sm:text-sm text-gray-500 mb-1 px-2 sm:px-0">
              Didn&apos;t receive the code? Check your {otpMethod === 'sms' ? 'SMS' : 'WhatsApp'} and try resending.
            </p>
            <p className="text-xs text-gray-400">
              Make sure you have a stable internet connection.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}