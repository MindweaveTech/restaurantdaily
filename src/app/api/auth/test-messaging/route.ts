import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { TwilioMessagingClient } from '@/lib/messaging/twilio-client';
import { PhoneValidator } from '@/lib/messaging/phone-validator';

// Test request validation schema (SMS only)
const testMessageSchema = z.object({
  phoneNumber: z.string().min(1, 'Phone number is required'),
  testType: z.enum(['connection', 'message']).optional().default('connection')
});

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const validation = testMessageSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request data',
          details: validation.error.issues
        },
        { status: 400 }
      );
    }

    const { phoneNumber, testType } = validation.data;

    // Test connection only
    if (testType === 'connection') {
      const connectionTest = await TwilioMessagingClient.testConnection();

      if (connectionTest.success) {
        return NextResponse.json({
          success: true,
          message: 'Twilio connection successful',
          data: {
            accountSid: connectionTest.accountSid?.slice(-8), // Show last 8 chars
            vaultIntegration: 'working',
            timestamp: new Date().toISOString()
          }
        });
      } else {
        return NextResponse.json(
          {
            success: false,
            error: 'Twilio connection failed',
            details: connectionTest.error
          },
          { status: 500 }
        );
      }
    }

    // Test message delivery
    if (testType === 'message') {
      // Validate phone number
      const phoneValidation = PhoneValidator.validate(phoneNumber);
      if (!phoneValidation.isValid) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid phone number',
            details: phoneValidation.error
          },
          { status: 400 }
        );
      }

      // Send test SMS message
      const messageResult = await TwilioMessagingClient.sendTestMessage(
        phoneValidation.formatted!
      );

      if (messageResult.success) {
        return NextResponse.json({
          success: true,
          message: 'Test SMS sent successfully',
          data: {
            phoneNumber: PhoneValidator.formatForDisplay(phoneValidation.formatted!),
            method: 'sms',
            messageSid: messageResult.messageSid,
            cost: messageResult.cost,
            deliveryStatus: messageResult.deliveryStatus
          }
        });
      } else {
        return NextResponse.json(
          {
            success: false,
            error: 'Test SMS failed',
            details: messageResult.error
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Invalid test type' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Test messaging API error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'Unable to process test request'
      },
      { status: 500 }
    );
  }
}

// Get messaging service status
export async function GET() {
  try {
    // Test basic Twilio connection
    const connectionTest = await TwilioMessagingClient.testConnection();

    if (connectionTest.success) {
      // Try to get usage stats
      try {
        const usageStats = await TwilioMessagingClient.getUsageStats();

        return NextResponse.json({
          success: true,
          status: 'operational',
          data: {
            connection: 'healthy',
            accountSid: connectionTest.accountSid?.slice(-8),
            usage: {
              messagesSent: usageStats.messagesSent,
              totalCost: `₹${usageStats.totalCost.toFixed(2)}`,
              period: usageStats.period
            },
            vault: {
              status: 'connected',
              secretsLoaded: ['sms', 'otp']
            },
            timestamp: new Date().toISOString()
          }
        });
      } catch {
        // Connection works but stats failed
        return NextResponse.json({
          success: true,
          status: 'operational',
          data: {
            connection: 'healthy',
            accountSid: connectionTest.accountSid?.slice(-8),
            usage: 'unavailable',
            vault: {
              status: 'connected',
              secretsLoaded: ['sms', 'otp']
            },
            timestamp: new Date().toISOString()
          }
        });
      }
    } else {
      return NextResponse.json(
        {
          success: false,
          status: 'degraded',
          error: 'Twilio connection failed',
          details: connectionTest.error
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Messaging status check failed:', error);

    return NextResponse.json(
      {
        success: false,
        status: 'down',
        error: 'Service unavailable',
        message: 'Unable to check messaging service status'
      },
      { status: 503 }
    );
  }
}