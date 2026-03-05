import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { pettyVoucherService, userService } from '@/lib/database';
import { secretsManager } from '@/lib/secrets';
import type { VoucherCategory } from '@/lib/supabase';

interface JWTPayload {
  sub: string;
  phone: string;
  role: string;
  restaurant_id?: string;
  exp: number;
  iat: number;
}

interface CreateVoucherRequest {
  amount: number;
  description: string;
  category: VoucherCategory;
  date?: string;
  vendor_name?: string;
  vendor_contact?: string;
  receipt_url?: string;
}

const VALID_CATEGORIES: VoucherCategory[] = [
  'supplies', 'cleaning', 'repairs', 'transport', 'utilities',
  'food_ingredients', 'packaging', 'marketing', 'staff_welfare',
  'office_supplies', 'miscellaneous', 'other'
];

// GET /api/vouchers - Get petty vouchers
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

    if (!decoded.restaurant_id) {
      return NextResponse.json(
        { error: 'No restaurant access' },
        { status: 403 }
      );
    }

    // Get query params
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as 'pending' | 'approved' | 'rejected' | 'paid' | null;
    const category = searchParams.get('category') as VoucherCategory | null;
    const startDate = searchParams.get('start_date') || undefined;
    const endDate = searchParams.get('end_date') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;

    // Get vouchers
    const { data: vouchers, total } = await pettyVoucherService.getRestaurantVouchers(
      decoded.restaurant_id,
      { status: status || undefined, category: category || undefined, startDate, endDate, limit, offset }
    );

    return NextResponse.json({
      success: true,
      vouchers: vouchers.map(v => ({
        id: v.id,
        voucher_number: v.voucher_number,
        amount: v.amount,
        description: v.description,
        category: v.category,
        date: v.date,
        vendor_name: v.vendor_name,
        status: v.status,
        approved_by: v.approved_by,
        approved_at: v.approved_at,
        rejection_reason: v.rejection_reason,
        receipt_url: v.receipt_url,
        created_at: v.created_at,
      })),
      total,
      limit,
      offset,
    });

  } catch (error) {
    console.error('Get vouchers error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vouchers' },
      { status: 500 }
    );
  }
}

// POST /api/vouchers - Create a new petty voucher
export async function POST(request: NextRequest) {
  try {
    const body: CreateVoucherRequest = await request.json();
    const { amount, description, category, date, vendor_name, vendor_contact, receipt_url } = body;

    // Validate required fields
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Valid amount is required' },
        { status: 400 }
      );
    }

    if (!description?.trim()) {
      return NextResponse.json(
        { error: 'Description is required' },
        { status: 400 }
      );
    }

    if (!category || !VALID_CATEGORIES.includes(category)) {
      return NextResponse.json(
        { error: `Invalid category. Valid categories: ${VALID_CATEGORIES.join(', ')}` },
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

    if (!decoded.restaurant_id) {
      return NextResponse.json(
        { error: 'No restaurant access' },
        { status: 403 }
      );
    }

    // Get user ID
    const user = await userService.getUserByPhone(decoded.phone);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Create voucher
    const voucher = await pettyVoucherService.createVoucher({
      userId: user.id,
      restaurantId: decoded.restaurant_id,
      amount,
      description: description.trim(),
      category,
      date,
      vendorName: vendor_name,
      vendorContact: vendor_contact,
      receiptUrl: receipt_url,
    });

    return NextResponse.json({
      success: true,
      voucher: {
        id: voucher.id,
        voucher_number: voucher.voucher_number,
        amount: voucher.amount,
        description: voucher.description,
        category: voucher.category,
        date: voucher.date,
        status: voucher.status,
      },
      message: 'Voucher created successfully'
    });

  } catch (error) {
    console.error('Create voucher error:', error);
    const message = error instanceof Error ? error.message : 'Failed to create voucher';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
