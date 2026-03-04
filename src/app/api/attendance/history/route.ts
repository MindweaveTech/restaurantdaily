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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;
    const userId = searchParams.get('userId') || undefined;
    const status = searchParams.get('status') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Check if user is admin (can view all) or employee (can only view own)
    const isAdmin = decoded.role === 'business_admin' || decoded.role === 'admin';

    if (isAdmin) {
      // Admin can view all attendance with filters
      const result = await attendanceService.getAttendanceHistory({
        restaurantId: decoded.restaurant_id,
        userId: userId,
        startDate,
        endDate,
        status,
        limit,
        offset,
      });

      return NextResponse.json({
        success: true,
        attendance: result.data.map(record => ({
          id: record.id,
          userId: record.user_id,
          userName: record.user_name || 'Unknown',
          userPhone: record.user_phone,
          checkInTime: record.check_in_time,
          checkOutTime: record.check_out_time,
          hoursWorked: record.hours_worked,
          overtimeHours: record.overtime_hours,
          status: record.status,
          notes: record.notes,
        })),
        total: result.total,
        limit,
        offset,
      });
    } else {
      // Employee can only view their own attendance
      const attendance = await attendanceService.getUserAttendanceHistory(user.id, {
        startDate,
        endDate,
        limit,
      });

      return NextResponse.json({
        success: true,
        attendance: attendance.map(record => ({
          id: record.id,
          checkInTime: record.check_in_time,
          checkOutTime: record.check_out_time,
          hoursWorked: record.hours_worked,
          status: record.status,
          notes: record.notes,
        })),
        total: attendance.length,
      });
    }

  } catch (error) {
    console.error('Attendance history error:', error);
    return NextResponse.json(
      { error: 'Failed to get attendance history' },
      { status: 500 }
    );
  }
}
