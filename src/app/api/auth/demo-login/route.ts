import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { secretsManager } from '@/lib/secrets';

/**
 * Demo Login API - For local development only
 *
 * This endpoint bypasses OTP verification for testing purposes.
 * ONLY available when:
 * 1. NEXT_PUBLIC_DEMO_LOGIN_ENABLED=true
 * 2. Running on localhost
 */

export async function POST(request: NextRequest) {
  try {
    // Security check: Only allow on localhost
    const host = request.headers.get('host') || '';
    const isLocalhost = host.startsWith('localhost') || host.startsWith('127.0.0.1');

    if (!isLocalhost) {
      console.log('Demo login blocked - not localhost:', host);
      return NextResponse.json(
        { error: 'Demo login is only available on localhost' },
        { status: 403 }
      );
    }

    // Check if demo login is enabled
    const isDemoEnabled = process.env.NEXT_PUBLIC_DEMO_LOGIN_ENABLED === 'true';
    if (!isDemoEnabled) {
      return NextResponse.json(
        { error: 'Demo login is not enabled' },
        { status: 403 }
      );
    }

    // Get demo login phone from env
    const demoPhone = process.env.DEMO_LOGIN_PHONE || '+918826175074';

    // Get JWT secret
    const jwtSecret = await secretsManager.getJWTSecret() || process.env.JWT_SECRET;
    if (!jwtSecret) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Create JWT token for demo user
    const payload = {
      phone: demoPhone,
      role: 'user', // Default role - user will select role on next page
      demo: true,   // Flag to indicate this is a demo login
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
    };

    const token = jwt.sign(payload, jwtSecret, {
      issuer: 'restaurant-daily',
      audience: 'restaurant-daily-users'
    });

    console.log(`🧪 Demo login successful for ${demoPhone}`);

    return NextResponse.json({
      success: true,
      token,
      phone: demoPhone,
      message: 'Demo login successful'
    });

  } catch (error) {
    console.error('Demo login error:', error);
    return NextResponse.json(
      { error: 'Demo login failed' },
      { status: 500 }
    );
  }
}
