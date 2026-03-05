import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { userService } from '@/lib/database';
import { secretsManager } from '@/lib/secrets';

interface JWTPayload {
  sub: string;
  phone: string;
  role: string;
  restaurant_id?: string;
  exp: number;
  iat: number;
}

interface StaffUpdateRequest {
  name?: string;
  email?: string;
  status?: 'active' | 'inactive';
}

// GET /api/staff/[id] - Get staff member details
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

    // Only business_admin can access this
    if (decoded.role !== 'business_admin' || !decoded.restaurant_id) {
      return NextResponse.json(
        { error: 'Only restaurant admins can view staff details' },
        { status: 403 }
      );
    }

    // Get the staff member (need to fetch by ID - we'll need a method for this)
    const client = await import('@/lib/supabase').then(m => m.getSupabaseAdmin());
    const { data: staff, error } = await client
      .from('users')
      .select('*')
      .eq('id', id)
      .eq('restaurant_id', decoded.restaurant_id)
      .eq('role', 'employee')
      .single();

    if (error || !staff) {
      return NextResponse.json(
        { error: 'Staff member not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      staff: {
        id: staff.id,
        phone: staff.phone,
        email: staff.email,
        name: staff.name,
        role: staff.role,
        status: staff.status,
        permissions: staff.permissions,
        created_at: staff.created_at,
        last_login: staff.last_login,
      }
    });

  } catch (error) {
    console.error('Get staff error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch staff member' },
      { status: 500 }
    );
  }
}

// PUT /api/staff/[id] - Update staff member
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: StaffUpdateRequest = await request.json();
    const { name, email, status } = body;

    // Validate at least one field is provided
    if (!name?.trim() && !email?.trim() && !status) {
      return NextResponse.json(
        { error: 'At least one field is required for update' },
        { status: 400 }
      );
    }

    // Validate email format if provided
    if (email && !isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
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

    // Only business_admin can update staff
    if (decoded.role !== 'business_admin' || !decoded.restaurant_id) {
      return NextResponse.json(
        { error: 'Only restaurant admins can update staff members' },
        { status: 403 }
      );
    }

    // Verify staff belongs to the same restaurant
    const client = await import('@/lib/supabase').then(m => m.getSupabaseAdmin());
    const { data: existingStaff, error: fetchError } = await client
      .from('users')
      .select('*')
      .eq('id', id)
      .eq('restaurant_id', decoded.restaurant_id)
      .eq('role', 'employee')
      .single();

    if (fetchError || !existingStaff) {
      return NextResponse.json(
        { error: 'Staff member not found in your restaurant' },
        { status: 404 }
      );
    }

    // Build update object
    const updates: { name?: string; email?: string; status?: 'active' | 'inactive' } = {};
    if (name?.trim()) updates.name = name.trim();
    if (email?.trim()) updates.email = email.trim().toLowerCase();
    if (status) updates.status = status;

    // Update staff
    const updatedStaff = await userService.updateUser(id, updates);

    return NextResponse.json({
      success: true,
      staff: {
        id: updatedStaff.id,
        phone: updatedStaff.phone,
        email: updatedStaff.email,
        name: updatedStaff.name,
        role: updatedStaff.role,
        status: updatedStaff.status,
      },
      message: 'Staff member updated successfully'
    });

  } catch (error) {
    console.error('Update staff error:', error);
    return NextResponse.json(
      { error: 'Failed to update staff member' },
      { status: 500 }
    );
  }
}

// DELETE /api/staff/[id] - Remove staff member (soft delete by setting status to inactive)
export async function DELETE(
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

    // Only business_admin can delete staff
    if (decoded.role !== 'business_admin' || !decoded.restaurant_id) {
      return NextResponse.json(
        { error: 'Only restaurant admins can remove staff members' },
        { status: 403 }
      );
    }

    // Verify staff belongs to the same restaurant
    const client = await import('@/lib/supabase').then(m => m.getSupabaseAdmin());
    const { data: existingStaff, error: fetchError } = await client
      .from('users')
      .select('id, role, restaurant_id')
      .eq('id', id)
      .eq('restaurant_id', decoded.restaurant_id)
      .eq('role', 'employee')
      .single();

    if (fetchError || !existingStaff) {
      return NextResponse.json(
        { error: 'Staff member not found in your restaurant' },
        { status: 404 }
      );
    }

    // Soft delete by setting status to inactive
    await userService.updateUser(id, { status: 'inactive' });

    return NextResponse.json({
      success: true,
      message: 'Staff member removed successfully'
    });

  } catch (error) {
    console.error('Delete staff error:', error);
    return NextResponse.json(
      { error: 'Failed to remove staff member' },
      { status: 500 }
    );
  }
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
