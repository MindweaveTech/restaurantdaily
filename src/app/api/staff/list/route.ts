import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurant_id');

    const supabase = await getSupabaseAdmin();

    // Build query to fetch staff members
    let query = supabase
      .from('users')
      .select('*')
      .in('role', ['business_admin', 'employee'])
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    // Filter by restaurant if provided
    if (restaurantId) {
      query = query.eq('restaurant_id', restaurantId);
    }

    const { data: staff, error } = await query;

    if (error) {
      console.error('Error fetching staff:', error);
      return NextResponse.json(
        { error: 'Failed to fetch staff', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      staff: staff || [],
      count: staff?.length || 0,
    });
  } catch (error) {
    console.error('Staff list error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
