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

interface CheckOutRequest {
  latitude?: number;
  longitude?: number;
  notes?: string;
  breakMinutes?: number;
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
        { error: 'No restaurant access' },
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

    // Check for active check-in
    const activeCheckIn = await attendanceService.getActiveCheckIn(
      user.id,
      decoded.restaurant_id
    );

    if (!activeCheckIn) {
      return NextResponse.json(
        { error: 'No active check-in found. Please check in first.' },
        { status: 400 }
      );
    }

    // Parse request body (optional data)
    let body: CheckOutRequest = {};
    try {
      body = await request.json();
    } catch {
      // Body is optional
    }

    // Perform check-out
    const attendance = await attendanceService.checkOut({
      attendanceId: activeCheckIn.id,
      userId: user.id,
      latitude: body.latitude,
      longitude: body.longitude,
      notes: body.notes,
      breakMinutes: body.breakMinutes,
    });

    return NextResponse.json({
      success: true,
      message: 'Checked out successfully',
      attendance: {
        id: attendance.id,
        checkInTime: attendance.check_in_time,
        checkOutTime: attendance.check_out_time,
        hoursWorked: attendance.hours_worked,
        status: attendance.status,
      },
    });

  } catch (error) {
    console.error('Check-out error:', error);

    // Handle specific errors
    if (error instanceof Error) {
      if (error.message.includes('No active check-in')) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to check out' },
      { status: 500 }
    );
  }
}
