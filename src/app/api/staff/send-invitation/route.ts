import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { staffInvitationService, restaurantService } from '@/lib/database';
import { secretsManager } from '@/lib/secrets';
import TwilioMessagingClient from '@/lib/messaging/twilio-client';

interface JWTPayload {
  phone: string;
  role: string;
  restaurant_id?: string;
  restaurant_name?: string;
  exp: number;
  iat: number;
}

interface SendInvitationRequest {
  invitation_id: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: SendInvitationRequest = await request.json();
    const { invitation_id } = body;

    // Validate required fields
    if (!invitation_id?.trim()) {
      return NextResponse.json(
        { error: 'Invitation ID is required' },
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

    // Ensure user is admin
    if (decoded.role !== 'admin' || !decoded.restaurant_id) {
      return NextResponse.json(
        { error: 'Only restaurant admins can send invitations' },
        { status: 403 }
      );
    }

    // Get the invitation
    const invitations = await staffInvitationService.getRestaurantInvitations(decoded.restaurant_id);
    const invitation = invitations.find(inv => inv.id === invitation_id);

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      );
    }

    if (invitation.status !== 'pending') {
      return NextResponse.json(
        { error: 'Invitation is no longer pending' },
        { status: 400 }
      );
    }

    // Check if invitation has expired
    if (new Date(invitation.expires_at) < new Date()) {
      await staffInvitationService.cancelInvitation(invitation.id);
      return NextResponse.json(
        { error: 'Invitation has expired' },
        { status: 400 }
      );
    }

    // Get restaurant information
    const restaurant = await restaurantService.getRestaurantById(invitation.restaurant_id);
    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      );
    }

    // Create invitation link
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://restaurant-daily.mindweave.tech';
    const invitationLink = `${baseUrl}/staff/accept-invitation?token=${invitation.invitation_token}`;

    // Send SMS invitation
    const messageResult = await TwilioMessagingClient.sendStaffInvitation(
      invitation.phone,
      restaurant.name,
      invitationLink,
      invitation.expires_at
    );

    if (!messageResult.success) {
      return NextResponse.json(
        { error: `Failed to send invitation: ${messageResult.error}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Invitation sent successfully via SMS',
      messageSid: messageResult.messageSid,
      method: messageResult.method,
      cost: messageResult.cost
    });

  } catch (error) {
    console.error('Send invitation error:', error);
    return NextResponse.json(
      { error: 'Failed to send invitation' },
      { status: 500 }
    );
  }
}


