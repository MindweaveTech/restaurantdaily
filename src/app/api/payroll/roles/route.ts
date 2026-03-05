import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurant_id');

    const supabase = await getSupabaseAdmin();

    // Get all active staff members with their settings
    let query = supabase
      .from('users')
      .select('settings')
      .in('role', ['business_admin', 'employee'])
      .eq('status', 'active');

    if (restaurantId) {
      query = query.eq('restaurant_id', restaurantId);
    }

    const { data: users, error } = await query;

    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json(
        { error: 'Failed to fetch roles', details: error.message },
        { status: 500 }
      );
    }

    // Extract unique roles from user settings
    const roleMap = new Map<string, { salary: number; hours: number; count: number }>();

    for (const user of users || []) {
      const settings = user.settings as {
        job_title?: string;
        monthly_salary?: number;
        shift_hours?: number;
      } | null;

      if (settings?.job_title) {
        const existing = roleMap.get(settings.job_title);
        if (existing) {
          existing.count++;
        } else {
          roleMap.set(settings.job_title, {
            salary: settings.monthly_salary || 14000,
            hours: settings.shift_hours || 10,
            count: 1,
          });
        }
      }
    }

    const roles = Array.from(roleMap.entries()).map(([name, data], index) => ({
      id: index + 1,
      name,
      baseSalary: data.salary,
      shiftHours: data.hours,
      paidLeaves: 4,
      staffCount: data.count,
    }));

    return NextResponse.json({
      success: true,
      roles,
    });
  } catch (error) {
    console.error('Payroll roles error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
