import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { restaurantService, userService } from '@/lib/database';
import { secretsManager } from '@/lib/secrets';

interface JWTPayload {
  phone: string;
  role: string;
  restaurant_id?: string | null;
  exp: number;
  iat: number;
}

interface RestaurantData {
  name: string;
  address: string;
  googleMapsLink?: string;
  description?: string;
  cuisine?: string;
  phone?: string;
  email?: string;
  // KYC fields
  gstNumber?: string;
  fssaiNumber?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: RestaurantData = await request.json();
    const { name, address, googleMapsLink, description, cuisine, phone, email, gstNumber, fssaiNumber } = body;

    // Validate required fields
    if (!name?.trim() || !address?.trim()) {
      return NextResponse.json(
        { error: 'Restaurant name and address are required' },
        { status: 400 }
      );
    }

    // Validate KYC fields
    if (!gstNumber?.trim()) {
      return NextResponse.json(
        { error: 'GST number is required for business verification' },
        { status: 400 }
      );
    }

    if (!fssaiNumber?.trim()) {
      return NextResponse.json(
        { error: 'FSSAI license number is required for food businesses' },
        { status: 400 }
      );
    }

    // Validate GST format (15 characters)
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i;
    if (!gstRegex.test(gstNumber.trim())) {
      return NextResponse.json(
        { error: 'Invalid GST number format. Must be 15 characters (e.g., 22AAAAA0000A1Z5)' },
        { status: 400 }
      );
    }

    // Validate FSSAI format (14 digits)
    const fssaiRegex = /^\d{14}$/;
    if (!fssaiRegex.test(fssaiNumber.trim())) {
      return NextResponse.json(
        { error: 'Invalid FSSAI number format. Must be 14 digits' },
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

    // Get JWT secret from Vault or environment
    const jwtSecret = await secretsManager.getJWTSecret() || process.env.JWT_SECRET || 'your-super-secret-jwt-key-for-development';
    if (!jwtSecret) {
      console.error('JWT secret not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Verify current token
    let decoded: JWTPayload;
    try {
      decoded = jwt.verify(token, jwtSecret) as JWTPayload;
    } catch {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Ensure user is admin or business_admin
    if (decoded.role !== 'admin' && decoded.role !== 'business_admin') {
      return NextResponse.json(
        { error: 'Only restaurant admins can create restaurants' },
        { status: 403 }
      );
    }

    // Check if user already has a restaurant
    const existingUser = await userService.getUserByPhone(decoded.phone);
    if (existingUser && existingUser.restaurant_id) {
      return NextResponse.json(
        { error: 'User already has a restaurant associated' },
        { status: 400 }
      );
    }

    // Create restaurant in database
    const restaurant = await restaurantService.createRestaurant({
      name: name.trim(),
      address: address.trim(),
      phone: decoded.phone, // Use admin's phone as restaurant contact
      google_maps_link: googleMapsLink,
      gst_number: gstNumber.trim().toUpperCase(),
      fssai_number: fssaiNumber.trim(),
      settings: {
        description: description || null,
        cuisine: cuisine || null,
        contact_phone: phone || null,
        contact_email: email || null,
      },
    });

    console.log(`✅ Restaurant created: ${restaurant.name} (GST: ${gstNumber}, FSSAI: ${fssaiNumber})`);

    // Create or update user record
    let user = existingUser;
    if (!user) {
      // Create new business_admin user
      user = await userService.createUser({
        phone: decoded.phone,
        restaurant_id: restaurant.id,
        role: 'business_admin',
        status: 'active',
      });
    } else {
      // Update existing user with restaurant
      user = await userService.updateUser(user.id, {
        restaurant_id: restaurant.id,
        role: 'business_admin',
        status: 'active',
      });
    }

    // Create new token with restaurant context
    const newTokenPayload = {
      phone: decoded.phone,
      role: decoded.role,
      restaurant_id: restaurant.id,
      restaurant_name: restaurant.name,
    };

    const newToken = jwt.sign(
      newTokenPayload,
      jwtSecret,
      {
        expiresIn: '24h',
        issuer: 'restaurant-daily',
        audience: 'restaurant-daily-users'
      }
    );

    return NextResponse.json({
      success: true,
      token: newToken,
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        address: restaurant.address,
        googleMapsLink: restaurant.google_maps_link,
        description: restaurant.settings?.description,
        cuisine: restaurant.settings?.cuisine,
        phone: restaurant.settings?.contact_phone,
        email: restaurant.settings?.contact_email,
      },
      message: 'Restaurant created successfully'
    });

  } catch (error) {
    console.error('Restaurant creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create restaurant' },
      { status: 500 }
    );
  }
}