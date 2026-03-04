import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { attendanceService } from '@/lib/database';
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

    // Only admins can view all attendance
    if (decoded.role !== 'business_admin' && decoded.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only administrators can view team attendance' },
        { status: 403 }
      );
    }

    // Get today's attendance
    const attendance = await attendanceService.getTodayAttendance(decoded.restaurant_id);

    // Get summary
    const summary = await attendanceService.getAttendanceSummary(decoded.restaurant_id);

    return NextResponse.json({
      success: true,
      summary,
      attendance: attendance.map(record => ({
        id: record.id,
        userId: record.user_id,
        userName: record.user_name || 'Unknown',
        userPhone: record.user_phone,
        checkInTime: record.check_in_time,
        checkOutTime: record.check_out_time,
        hoursWorked: record.hours_worked,
        status: record.status,
      })),
    });

  } catch (error) {
    console.error('Today attendance error:', error);
    return NextResponse.json(
      { error: 'Failed to get today\'s attendance' },
      { status: 500 }
    );
  }
}
