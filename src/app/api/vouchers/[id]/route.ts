import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { pettyVoucherService, userService } from '@/lib/database';
import { secretsManager } from '@/lib/secrets';
import type { VoucherStatus } from '@/lib/supabase';

interface JWTPayload {
  sub: string;
  phone: string;
  role: string;
  restaurant_id?: string;
  exp: number;
  iat: number;
}

interface UpdateVoucherRequest {
  status?: VoucherStatus;
  rejection_reason?: string;
}

// GET /api/vouchers/[id] - Get voucher details
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

    if (!decoded.restaurant_id) {
      return NextResponse.json(
        { error: 'No restaurant access' },
        { status: 403 }
      );
    }

    const voucher = await pettyVoucherService.getVoucherById(id);
    if (!voucher || voucher.restaurant_id !== decoded.restaurant_id) {
      return NextResponse.json(
        { error: 'Voucher not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      voucher: {
        id: voucher.id,
        voucher_number: voucher.voucher_number,
        amount: voucher.amount,
        description: voucher.description,
        category: voucher.category,
        date: voucher.date,
        vendor_name: voucher.vendor_name,
        vendor_contact: voucher.vendor_contact,
        status: voucher.status,
        approved_by: voucher.approved_by,
        approved_at: voucher.approved_at,
        rejection_reason: voucher.rejection_reason,
        receipt_url: voucher.receipt_url,
        paid: voucher.paid,
        paid_at: voucher.paid_at,
        created_at: voucher.created_at,
      }
    });

  } catch (error) {
    console.error('Get voucher error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch voucher' },
      { status: 500 }
    );
  }
}

// PUT /api/vouchers/[id] - Update voucher status (approve/reject)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: UpdateVoucherRequest = await request.json();
    const { status, rejection_reason } = body;

    // Validate status
    const validStatuses: VoucherStatus[] = ['approved', 'rejected', 'paid', 'void'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Valid statuses: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    // Rejection requires a reason
    if (status === 'rejected' && !rejection_reason?.trim()) {
      return NextResponse.json(
        { error: 'Rejection reason is required when rejecting a voucher' },
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

    // Only business_admin can approve/reject vouchers
    if (decoded.role !== 'business_admin' || !decoded.restaurant_id) {
      return NextResponse.json(
        { error: 'Only restaurant admins can update voucher status' },
        { status: 403 }
      );
    }

    // Verify voucher belongs to the same restaurant
    const existingVoucher = await pettyVoucherService.getVoucherById(id);
    if (!existingVoucher || existingVoucher.restaurant_id !== decoded.restaurant_id) {
      return NextResponse.json(
        { error: 'Voucher not found in your restaurant' },
        { status: 404 }
      );
    }

    // Get user ID for approval tracking
    const user = await userService.getUserByPhone(decoded.phone);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update voucher status
    const updatedVoucher = await pettyVoucherService.updateVoucherStatus({
      voucherId: id,
      status,
      approvedBy: status === 'approved' ? user.id : undefined,
      rejectionReason: rejection_reason,
    });

    return NextResponse.json({
      success: true,
      voucher: {
        id: updatedVoucher.id,
        voucher_number: updatedVoucher.voucher_number,
        amount: updatedVoucher.amount,
        status: updatedVoucher.status,
        approved_by: updatedVoucher.approved_by,
        approved_at: updatedVoucher.approved_at,
        rejection_reason: updatedVoucher.rejection_reason,
      },
      message: `Voucher ${status} successfully`
    });

  } catch (error) {
    console.error('Update voucher error:', error);
    const message = error instanceof Error ? error.message : 'Failed to update voucher';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
