import { NextRequest, NextResponse } from 'next/server';
import { verifyGST, validateGSTINFormat } from '@/lib/kyc/gst-verification';
import jwt from 'jsonwebtoken';
import { secretsManager } from '@/lib/secrets';

interface JWTPayload {
  phone: string;
  role: string;
  exp: number;
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const jwtSecret = await secretsManager.getJWTSecret() || process.env.JWT_SECRET;

    if (!jwtSecret) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    try {
      jwt.verify(token, jwtSecret) as JWTPayload;
    } catch {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Get GST number from request
    const body = await request.json();
    const { gstin } = body;

    if (!gstin) {
      return NextResponse.json(
        { error: 'GST number is required' },
        { status: 400 }
      );
    }

    // Validate format first
    const formatValidation = validateGSTINFormat(gstin);
    if (!formatValidation.valid) {
      return NextResponse.json(
        {
          success: false,
          verified: false,
          error: formatValidation.error
        },
        { status: 400 }
      );
    }

    // Verify GST with API
    const result = await verifyGST(gstin);

    if (!result.success) {
      return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('GST verification endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
