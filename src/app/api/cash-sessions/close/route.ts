import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cashSessionService, userService } from '@/lib/database';
import { secretsManager } from '@/lib/secrets';

interface JWTPayload {
  sub: string;
  phone: string;
  role: string;
  restaurant_id?: string;
  exp: number;
  iat: number;
}

interface CloseSessionRequest {
  session_id: string;
  closing_balance: number;
  total_sales?: number;
  total_refunds?: number;
  cash_payments?: number;
  card_payments?: number;
  upi_payments?: number;
  other_payments?: number;
  notes?: string;
}

// POST /api/cash-sessions/close - Close an active cash session
export async function POST(request: NextRequest) {
  try {
    const body: CloseSessionRequest = await request.json();
    const {
      session_id,
      closing_balance,
      total_sales,
      total_refunds,
      cash_payments,
      card_payments,
      upi_payments,
      other_payments,
      notes,
    } = body;

    // Validate required fields
    if (!session_id) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    if (closing_balance === undefined || closing_balance < 0) {
      return NextResponse.json(
        { error: 'Valid closing balance is required' },
        { status: 400 }
      );
    }

    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Get JWT secret
    const jwtSecret = await secretsManager.getJWTSecret() || process.env.JWT_SECRET || 'your-super-secret-jwt-key-for-development';

    // Verify token
    let decoded: JWTPayload;
    try {
      decoded = jwt.verify(token, jwtSecret) as JWTPayload;
    } catch {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    if (!decoded.restaurant_id) {
      return NextResponse.json(
        { error: 'No restaurant access' },
        { status: 403 }
      );
    }

    // Get user ID
    const user = await userService.getUserByPhone(decoded.phone);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Close session
    const session = await cashSessionService.closeSession({
      sessionId: session_id,
      userId: user.id,
      closingBalance: closing_balance,
      totalSales: total_sales,
      totalRefunds: total_refunds,
      cashPayments: cash_payments,
      cardPayments: card_payments,
      upiPayments: upi_payments,
      otherPayments: other_payments,
      notes,
    });

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        start_time: session.start_time,
        end_time: session.end_time,
        opening_balance: session.opening_balance,
        closing_balance: session.closing_balance,
        total_sales: session.total_sales,
        cash_difference: session.cash_difference,
        status: session.status,
      },
      message: 'Cash session closed successfully'
    });

  } catch (error) {
    console.error('Close cash session error:', error);
    const message = error instanceof Error ? error.message : 'Failed to close cash session';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
