import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { attendanceService, userService } from '@/lib/database';
import { secretsManager } from '@/lib/secrets';

interface JWTPayload {
  phone: string;
  role: string;
  restaurant_id?: string;
  restaurant_name?: string;
  exp: number;
  iat: number;
}

interface CheckInRequest {
  latitude?: number;
  longitude?: number;
  notes?: string;
}

export async function POST(request: NextRequest) {
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
    const jwtSecret = await secretsManager.getJWTSecret() || process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT secret not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

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

    // Ensure user has restaurant access
    if (!decoded.restaurant_id) {
      return NextResponse.json(
        { error: 'No restaurant access. Please complete onboarding first.' },
        { status: 403 }
      );
    }

    // Get user from database
    const user = await userService.getUserByPhone(decoded.phone);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Parse request body (optional location data)
    let body: CheckInRequest = {};
    try {
      body = await request.json();
    } catch {
      // Body is optional
    }

    // Perform check-in
    const attendance = await attendanceService.checkIn({
      userId: user.id,
      restaurantId: decoded.restaurant_id,
      latitude: body.latitude,
      longitude: body.longitude,
      notes: body.notes,
    });

    return NextResponse.json({
      success: true,
      message: 'Checked in successfully',
      attendance: {
        id: attendance.id,
        checkInTime: attendance.check_in_time,
        status: attendance.status,
      },
    });

  } catch (error) {
    console.error('Check-in error:', error);

    // Handle specific errors
    if (error instanceof Error) {
      if (error.message.includes('already has an active check-in')) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to check in' },
      { status: 500 }
    );
  }
}
