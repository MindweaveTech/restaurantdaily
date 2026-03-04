import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { secretsManager } from '@/lib/secrets';
import { systemAdminService, businessInvitationService } from '@/lib/database';
import { PhoneValidator } from '@/lib/messaging/phone-validator';
import { TwilioMessagingClient } from '@/lib/messaging/twilio-client';
import type { UserRole } from '@/types';

// Note: Staff invitations are sent via SMS
// TwilioMessagingClient.sendStaffInvitation handles SMS delivery

interface JWTPayload {
  phone: string;
  email?: string;
  role: UserRole;
  exp: number;
  iat: number;
}

const SUPERADMIN_EMAIL = 'gaurav18115@gmail.com';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, restaurantName, email } = body;

    // Validate required fields
    if (!phone || !restaurantName) {
      return NextResponse.json(
        { error: 'Phone number and restaurant name are required' },
        { status: 400 }
      );
    }

    // Validate phone number
    const phoneValidation = PhoneValidator.validate(phone);
    if (!phoneValidation.isValid) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
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

    // Verify caller is a superadmin
    if (decoded.role !== 'superadmin') {
      return NextResponse.json(
        { error: 'Only superadmins can invite business administrators' },
        { status: 403 }
      );
    }

    // Double-check superadmin status in database
    const systemAdmin = await systemAdminService.getByPhone(decoded.phone);
    if (!systemAdmin || systemAdmin.email !== SUPERADMIN_EMAIL) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Create invitation
    const invitation = await businessInvitationService.createInvitation({
      invited_by: systemAdmin.id,
      phone: phoneValidation.formatted!,
      restaurant_name: restaurantName.trim(),
      email: email?.trim(),
    });

    // Generate invitation URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://restaurant-daily.mindweave.tech';
    const invitationUrl = `${baseUrl}/auth/phone?invitation=${invitation.invitation_token}`;

    // Send SMS invitation message
    try {
      console.log(`✅ Business invitation created for ${phoneValidation.formatted}`);
      console.log(`📱 Invitation URL: ${invitationUrl}`);

      // Send SMS invitation
      await TwilioMessagingClient.sendStaffInvitation(
        phoneValidation.formatted!,
        restaurantName.trim(),
        invitationUrl,
        invitation.expires_at
      );
    } catch (error) {
      console.error('Failed to send SMS notification:', error);
      // Don't fail the request, invitation is still created
    }

    return NextResponse.json({
      success: true,
      invitation: {
        id: invitation.id,
        phone: invitation.phone,
        restaurantName: invitation.restaurant_name,
        status: invitation.status,
        expiresAt: invitation.expires_at,
        invitationUrl,
      },
      message: `Invitation sent to ${PhoneValidator.formatForDisplay(phoneValidation.formatted!)}`
    });

  } catch (error) {
    console.error('Error creating business invitation:', error);
    return NextResponse.json(
      { error: 'Failed to create invitation' },
      { status: 500 }
    );
  }
}

// Get all pending business invitations
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

    // Verify caller is a superadmin
    if (decoded.role !== 'superadmin') {
      return NextResponse.json(
        { error: 'Only superadmins can view business invitations' },
        { status: 403 }
      );
    }

    // Get all pending invitations
    const invitations = await businessInvitationService.getAllPending();

    return NextResponse.json({
      success: true,
      invitations: invitations.map(inv => ({
        id: inv.id,
        phone: inv.phone,
        email: inv.email,
        restaurantName: inv.restaurant_name,
        status: inv.status,
        expiresAt: inv.expires_at,
        createdAt: inv.created_at,
      })),
    });

  } catch (error) {
    console.error('Error fetching business invitations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invitations' },
      { status: 500 }
    );
  }
}
