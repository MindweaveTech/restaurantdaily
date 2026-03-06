import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { TwilioMessagingClient } from '@/lib/messaging/twilio-client';
import { PhoneValidator } from '@/lib/messaging/phone-validator';
import { OTPRateLimit, OTPService } from '@/lib/messaging/otp-service';
import { logAPI, logAuth } from '@/lib/logger';

// Demo phone numbers for testing (bypasses real SMS)
const DEMO_PHONES = [
  '+11234567890',  // US demo
  '+919999999999', // India demo
  '+12025551234',  // US DC demo
];
const DEMO_OTP = '123456';

// Request validation schema
const requestOTPSchema = z.object({
  phoneNumber: z.string().min(1, 'Phone number is required'),
  purpose: z.enum(['login', 'registration', 'password_reset']).optional().default('login'),
  // SMS is now the only delivery method
  preferredMethod: z.enum(['sms']).optional().default('sms')
});

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  try {
    // Parse request body
    const body = await request.json();
    const validation = requestOTPSchema.safeParse(body);

    if (!validation.success) {
      logAPI('POST', '/api/auth/request-otp', 400, Date.now() - startTime, { error: 'Validation failed' });
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request data',
          details: validation.error.issues
        },
        { status: 400 }
      );
    }

    const { phoneNumber, purpose, preferredMethod } = validation.data;

    // Validate phone number format
    const phoneValidation = PhoneValidator.validate(phoneNumber);
    if (!phoneValidation.isValid) {
      logAPI('POST', '/api/auth/request-otp', 400, Date.now() - startTime, { error: 'Invalid phone number' });
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid phone number',
          details: phoneValidation.error
        },
        { status: 400 }
      );
    }

    const formattedPhone = phoneValidation.formatted!;
    logAuth('request-otp', formattedPhone, true, { purpose, preferredMethod });

    // Check rate limiting
    const isRateLimited = await OTPRateLimit.isRateLimited(formattedPhone);
    if (isRateLimited) {
      const remainingAttempts = await OTPRateLimit.getRemainingAttempts(formattedPhone);

      return NextResponse.json(
        {
          success: false,
          error: 'Rate limit exceeded',
          message: 'Too many OTP requests. Please try again later.',
          remainingAttempts
        },
        { status: 429 }
      );
    }

    // Record the attempt
    OTPRateLimit.recordAttempt(formattedPhone);

    // Check if this is a demo phone number (for development/testing)
    const isDemoPhone = DEMO_PHONES.includes(formattedPhone);

    if (isDemoPhone) {
      // Store demo OTP for verification
      await OTPService.storeOTP(formattedPhone, DEMO_OTP);
      logAuth('otp-sent', formattedPhone, true, { method: 'demo', note: 'Demo mode - use OTP: 123456' });
      logAPI('POST', '/api/auth/request-otp', 200, Date.now() - startTime);

      return NextResponse.json({
        success: true,
        message: 'Demo mode: Use OTP 123456',
        data: {
          phoneNumber: PhoneValidator.formatForDisplay(formattedPhone),
          method: 'demo',
          expiresIn: '5 minutes',
          canResendIn: '1 minute',
          isDemo: true,
          demoOtp: '123456' // Only exposed for demo numbers
        }
      });
    }

    // Send OTP via Twilio (production)
    const messageResult = await TwilioMessagingClient.sendOTP({
      phoneNumber: formattedPhone,
      purpose,
      preferredMethod
    });

    if (!messageResult.success) {
      logAuth('request-otp', formattedPhone, false, { error: messageResult.error });
      logAPI('POST', '/api/auth/request-otp', 500, Date.now() - startTime, { error: 'Failed to send OTP' });
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to send OTP',
          details: messageResult.error
        },
        { status: 500 }
      );
    }

    logAuth('otp-sent', formattedPhone, true, { method: messageResult.method, messageSid: messageResult.messageSid });
    logAPI('POST', '/api/auth/request-otp', 200, Date.now() - startTime);

    // Return success response (don't expose sensitive data)
    return NextResponse.json({
      success: true,
      message: `OTP sent via ${messageResult.method}`,
      data: {
        phoneNumber: PhoneValidator.formatForDisplay(formattedPhone),
        method: messageResult.method,
        expiresIn: '5 minutes',
        canResendIn: '1 minute'
      }
    });

  } catch (error) {
    console.error('Request OTP API error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'Unable to process OTP request'
      },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}