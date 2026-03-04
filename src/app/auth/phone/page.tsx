'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChefHat, ArrowLeft, Send } from 'lucide-react';
import Link from 'next/link';
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
    if (error) setError(''); // Clear error when user starts typing
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
          preferredMethod: 'sms', // SMS delivery
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store phone number for OTP verification page
        sessionStorage.setItem('pendingPhone', phoneNumber.trim());
        sessionStorage.setItem('otpMethod', data.method || 'sms');

        // Navigate to OTP verification page
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex flex-col">
      <div className="container mx-auto px-4 py-4 sm:py-8 max-w-md flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <Link
            href="/"
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors text-sm sm:text-base"
            aria-label="Go back to home"
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
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              Welcome Back
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Enter your phone number to receive a verification code and access your restaurant dashboard.
            </p>
          </div>

          {/* Phone Input Form */}
          <div className="space-y-4 sm:space-y-6 flex-1 flex flex-col" onKeyPress={handleKeyPress}>
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
                'w-full flex items-center justify-center px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base',
                'transition-all duration-200 shadow-sm',
                'focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2',
                isValid && !loading
                  ? 'bg-orange-600 hover:bg-orange-700 text-white shadow-md hover:shadow-lg'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              )}
              aria-describedby="submit-help"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white mr-2" />
                  <span className="text-sm sm:text-base">Sending Code...</span>
                </>
              ) : (
                <>
                  <Send className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  <span className="text-sm sm:text-base">Send Verification Code</span>
                </>
              )}
            </button>

            <p id="submit-help" className="text-xs text-gray-500 text-center">
              We&apos;ll send a 6-digit code via SMS to verify your number
            </p>
          </div>


          {/* Security Notice */}
          <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-orange-50 rounded-lg border border-orange-200">
            <h3 className="text-xs sm:text-sm font-medium text-orange-900 mb-1">
              🔐 Secure Authentication
            </h3>
            <p className="text-xs text-orange-700 leading-relaxed">
              Your phone number is used only for authentication and account security.
              We never share your information with third parties.
            </p>
          </div>

          {/* Help Text */}
          <div className="mt-4 sm:mt-6 text-center">
            <p className="text-xs sm:text-sm text-gray-500 mb-2 px-2 sm:px-0">
              Having trouble? Check that your number is correct and can receive SMS.
            </p>
            <Link
              href="/"
              className="text-xs sm:text-sm text-orange-600 hover:text-orange-700 underline inline-block mt-2"
            >
              Need help? Contact support
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 sm:mt-8 pb-4 sm:pb-0">
          <p className="text-xs text-gray-500 px-2 sm:px-0 leading-relaxed">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}