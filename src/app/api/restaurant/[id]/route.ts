import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { restaurantService } from '@/lib/database';
import { secretsManager } from '@/lib/secrets';

interface JWTPayload {
  sub: string;
  phone: string;
  role: string;
  restaurant_id?: string;
  exp: number;
  iat: number;
}

interface RestaurantUpdateRequest {
  name?: string;
  address?: string;
  phone?: string;
  google_maps_link?: string;
  logo_url?: string;
  settings?: Record<string, unknown>;
}

// GET /api/restaurant/[id] - Get restaurant details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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
    const jwtSecret = await secretsManager.getJWTSecret() || process.env.JWT_SECRET || 'your-super-secret-jwt-key-for-development';

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

    // Verify user has access to this restaurant
    if (decoded.restaurant_id !== id && decoded.role !== 'superadmin') {
      return NextResponse.json(
        { error: 'You do not have access to this restaurant' },
        { status: 403 }
      );
    }

    const restaurant = await restaurantService.getRestaurantById(id);
    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        address: restaurant.address,
        phone: restaurant.phone,
        google_maps_link: restaurant.google_maps_link,
        logo_url: restaurant.logo_url,
        settings: restaurant.settings,
        status: restaurant.status,
        created_at: restaurant.created_at,
      }
    });

  } catch (error) {
    console.error('Get restaurant error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch restaurant' },
      { status: 500 }
    );
  }
}

// PUT /api/restaurant/[id] - Update restaurant details
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: RestaurantUpdateRequest = await request.json();
    const { name, address, phone, google_maps_link, logo_url, settings } = body;

    // Validate at least one field is provided
    const hasUpdates = name?.trim() || address?.trim() || phone?.trim() ||
                       google_maps_link !== undefined || logo_url !== undefined ||
                       settings !== undefined;
    if (!hasUpdates) {
      return NextResponse.json(
        { error: 'At least one field is required for update' },
        { status: 400 }
      );
    }

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
    const jwtSecret = await secretsManager.getJWTSecret() || process.env.JWT_SECRET || 'your-super-secret-jwt-key-for-development';

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

    // Only business_admin of this restaurant can update it
    if (decoded.role !== 'business_admin' || decoded.restaurant_id !== id) {
      return NextResponse.json(
        { error: 'Only the restaurant admin can update restaurant details' },
        { status: 403 }
      );
    }

    // Verify restaurant exists
    const existingRestaurant = await restaurantService.getRestaurantById(id);
    if (!existingRestaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      );
    }

    // Build update object
    const updates: Partial<RestaurantUpdateRequest> = {};
    if (name?.trim()) updates.name = name.trim();
    if (address?.trim()) updates.address = address.trim();
    if (phone?.trim()) updates.phone = phone.trim();
    if (google_maps_link !== undefined) updates.google_maps_link = google_maps_link;
    if (logo_url !== undefined) updates.logo_url = logo_url;
    if (settings !== undefined) updates.settings = settings;

    // Update restaurant
    const updatedRestaurant = await restaurantService.updateRestaurant(id, updates);

    return NextResponse.json({
      success: true,
      restaurant: {
        id: updatedRestaurant.id,
        name: updatedRestaurant.name,
        address: updatedRestaurant.address,
        phone: updatedRestaurant.phone,
        google_maps_link: updatedRestaurant.google_maps_link,
        logo_url: updatedRestaurant.logo_url,
        settings: updatedRestaurant.settings,
        status: updatedRestaurant.status,
      },
      message: 'Restaurant updated successfully'
    });

  } catch (error) {
    console.error('Update restaurant error:', error);
    return NextResponse.json(
      { error: 'Failed to update restaurant' },
      { status: 500 }
    );
  }
}
