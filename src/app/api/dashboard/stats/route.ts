import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurant_id');

    const supabase = await getSupabaseAdmin();

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get staff count
    let staffQuery = supabase
      .from('users')
      .select('id, created_at', { count: 'exact' })
      .in('role', ['business_admin', 'employee'])
      .eq('status', 'active');

    if (restaurantId) {
      staffQuery = staffQuery.eq('restaurant_id', restaurantId);
    }

    const { count: totalStaff, data: staffData } = await staffQuery;

    // Count new staff this month
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const newThisMonth = staffData?.filter(
      s => new Date(s.created_at) >= startOfMonth
    ).length || 0;

    // Get today's attendance
    let attendanceQuery = supabase
      .from('attendance_logs')
      .select('*')
      .gte('check_in_time', today.toISOString())
      .lt('check_in_time', tomorrow.toISOString());

    if (restaurantId) {
      attendanceQuery = attendanceQuery.eq('restaurant_id', restaurantId);
    }

    const { data: todayAttendance } = await attendanceQuery;

    const presentToday = todayAttendance?.length || 0;
    const attendanceRate = totalStaff ? Math.round((presentToday / totalStaff) * 100) : 0;

    // Calculate today's hours
    const totalHoursToday = todayAttendance?.reduce((sum, log) => {
      return sum + (log.hours_worked || 0);
    }, 0) || 0;

    // Get this month's overtime
    let monthlyAttendanceQuery = supabase
      .from('attendance_logs')
      .select('overtime_hours')
      .gte('check_in_time', startOfMonth.toISOString())
      .lt('check_in_time', tomorrow.toISOString());

    if (restaurantId) {
      monthlyAttendanceQuery = monthlyAttendanceQuery.eq('restaurant_id', restaurantId);
    }

    const { data: monthlyAttendance } = await monthlyAttendanceQuery;

    const totalOvertimeHours = monthlyAttendance?.reduce((sum, log) => {
      return sum + (log.overtime_hours || 0);
    }, 0) || 0;

    // Estimate overtime pay (average hourly rate * OT hours)
    const avgHourlyRate = 75; // Average hourly OT rate
    const overtimePay = Math.round(totalOvertimeHours * avgHourlyRate);

    return NextResponse.json({
      success: true,
      stats: {
        totalStaff: totalStaff || 0,
        newThisMonth,
        presentToday,
        attendanceRate,
        totalHoursToday: Math.round(totalHoursToday * 100) / 100,
        overtimePay,
        totalOvertimeHours: Math.round(totalOvertimeHours * 100) / 100,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
