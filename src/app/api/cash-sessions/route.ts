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

interface CreateSessionRequest {
  opening_balance: number;
  notes?: string;
}

// GET /api/cash-sessions - Get cash sessions
export async function GET(request: NextRequest) {
  try {
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

    // Get query params
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as 'active' | 'closed' | null;
    const startDate = searchParams.get('start_date') || undefined;
    const endDate = searchParams.get('end_date') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50;

    // Get sessions
    const sessions = await cashSessionService.getRestaurantSessions(
      decoded.restaurant_id,
      { status: status || undefined, startDate, endDate, limit }
    );

    return NextResponse.json({
      success: true,
      sessions: sessions.map(s => ({
        id: s.id,
        user_id: s.user_id,
        start_time: s.start_time,
        end_time: s.end_time,
        opening_balance: s.opening_balance,
        closing_balance: s.closing_balance,
        total_sales: s.total_sales,
        cash_difference: s.cash_difference,
        status: s.status,
        notes: s.notes,
      }))
    });

  } catch (error) {
    console.error('Get cash sessions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cash sessions' },
      { status: 500 }
    );
  }
}

// POST /api/cash-sessions - Start a new cash session
export async function POST(request: NextRequest) {
  try {
    const body: CreateSessionRequest = await request.json();
    const { opening_balance, notes } = body;

    // Validate opening balance
    if (opening_balance === undefined || opening_balance < 0) {
      return NextResponse.json(
        { error: 'Valid opening balance is required' },
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

    // Create session
    const session = await cashSessionService.createSession({
      userId: user.id,
      restaurantId: decoded.restaurant_id,
      openingBalance: opening_balance,
      notes,
    });

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        start_time: session.start_time,
        opening_balance: session.opening_balance,
        status: session.status,
      },
      message: 'Cash session started successfully'
    });

  } catch (error) {
    console.error('Create cash session error:', error);
    const message = error instanceof Error ? error.message : 'Failed to create cash session';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
