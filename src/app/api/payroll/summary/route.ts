import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurant_id');
    const month = searchParams.get('month'); // Format: YYYY-MM

    const supabase = await getSupabaseAdmin();

    // Get date range for the month
    const startDate = month
      ? new Date(`${month}-01`)
      : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);

    // Fetch staff members with their attendance
    let staffQuery = supabase
      .from('users')
      .select('*')
      .in('role', ['business_admin', 'employee'])
      .eq('status', 'active');

    if (restaurantId) {
      staffQuery = staffQuery.eq('restaurant_id', restaurantId);
    }

    const { data: staff, error: staffError } = await staffQuery;

    if (staffError) {
      console.error('Error fetching staff:', staffError);
      return NextResponse.json(
        { error: 'Failed to fetch staff', details: staffError.message },
        { status: 500 }
      );
    }

    // Fetch attendance logs for the period
    let attendanceQuery = supabase
      .from('attendance_logs')
      .select('*')
      .gte('check_in_time', startDate.toISOString())
      .lte('check_in_time', endDate.toISOString());

    if (restaurantId) {
      attendanceQuery = attendanceQuery.eq('restaurant_id', restaurantId);
    }

    const { data: attendanceLogs, error: attendanceError } = await attendanceQuery;

    if (attendanceError) {
      console.error('Error fetching attendance:', attendanceError);
      return NextResponse.json(
        { error: 'Failed to fetch attendance', details: attendanceError.message },
        { status: 500 }
      );
    }

    // Calculate payroll for each staff member
    const staffPayroll = (staff || []).map(member => {
      const memberAttendance = (attendanceLogs || []).filter(
        log => log.user_id === member.id
      );

      const totalHours = memberAttendance.reduce(
        (sum, log) => sum + (log.hours_worked || 0),
        0
      );
      const overtimeHours = memberAttendance.reduce(
        (sum, log) => sum + (log.overtime_hours || 0),
        0
      );
      const daysPresent = memberAttendance.filter(log => log.status === 'checked_out').length;

      // Default salary structure (should come from a salary_config table in future)
      const monthlySalary = member.settings?.monthly_salary || 14000;
      const shiftHours = member.settings?.shift_hours || 10;
      const daysInMonth = endDate.getDate();

      const dailyRate = monthlySalary / daysInMonth;
      const hourlyRate = dailyRate / shiftHours;
      const basePay = Math.round(dailyRate * daysPresent);
      const overtimePay = Math.round(hourlyRate * overtimeHours);

      return {
        id: member.id,
        name: member.name || 'Unknown',
        phone: member.phone,
        role: member.role,
        daysPresent,
        totalHours: Math.round(totalHours * 100) / 100,
        overtimeHours: Math.round(overtimeHours * 100) / 100,
        basePay,
        overtimePay,
        netPay: basePay + overtimePay,
      };
    });

    // Calculate totals
    const totals = {
      totalStaff: staffPayroll.length,
      totalPayroll: staffPayroll.reduce((sum, s) => sum + s.netPay, 0),
      totalOvertime: staffPayroll.reduce((sum, s) => sum + s.overtimePay, 0),
      avgSalary: staffPayroll.length > 0
        ? Math.round(staffPayroll.reduce((sum, s) => sum + s.netPay, 0) / staffPayroll.length)
        : 0,
    };

    return NextResponse.json({
      success: true,
      period: {
        month: startDate.toLocaleString('default', { month: 'long', year: 'numeric' }),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      staff: staffPayroll,
      totals,
    });
  } catch (error) {
    console.error('Payroll summary error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
