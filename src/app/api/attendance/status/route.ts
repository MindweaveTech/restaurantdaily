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

    // Get active check-in
    const activeCheckIn = await attendanceService.getActiveCheckIn(
      user.id,
      decoded.restaurant_id
    );

    if (activeCheckIn) {
      // Calculate elapsed time
      const checkInTime = new Date(activeCheckIn.check_in_time);
      const now = new Date();
      const elapsedMs = now.getTime() - checkInTime.getTime();
      const elapsedHours = Math.floor(elapsedMs / (1000 * 60 * 60));
      const elapsedMinutes = Math.floor((elapsedMs % (1000 * 60 * 60)) / (1000 * 60));

      return NextResponse.json({
        success: true,
        isCheckedIn: true,
        attendance: {
          id: activeCheckIn.id,
          checkInTime: activeCheckIn.check_in_time,
          status: activeCheckIn.status,
          elapsedTime: {
            hours: elapsedHours,
            minutes: elapsedMinutes,
            formatted: `${elapsedHours}h ${elapsedMinutes}m`,
          },
        },
      });
    }

    // No active check-in
    return NextResponse.json({
      success: true,
      isCheckedIn: false,
      attendance: null,
    });

  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { error: 'Failed to get attendance status' },
      { status: 500 }
    );
  }
}
