import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurant_id');

    const supabase = await getSupabaseAdmin();

    let query = supabase
      .from('restaurants')
      .select('*');

    if (restaurantId) {
      query = query.eq('id', restaurantId);
    }

    const { data: restaurants, error } = await query.limit(1).single();

    if (error) {
      console.error('Error fetching restaurant:', error);
      return NextResponse.json(
        { error: 'Failed to fetch restaurant', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      restaurant: restaurants,
    });
  } catch (error) {
    console.error('Restaurant info error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
