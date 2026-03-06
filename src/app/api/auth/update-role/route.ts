import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { secretsManager } from '@/lib/secrets';
import { userService, restaurantService, systemAdminService, businessInvitationService, staffInvitationService } from '@/lib/database';
import type { UserRole } from '@/types';

interface JWTPayload {
  phone: string;
  email?: string;
  role?: UserRole;
  restaurant_id?: string | null;
  restaurant_name?: string;
  exp: number;
  iat: number;
}

// Superadmin email - hardcoded for security
const SUPERADMIN_EMAIL = 'gaurav18115@gmail.com';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { role, invitationToken } = body;

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

    let finalRole: UserRole;
    let restaurantId: string | null = null;
    let restaurantName: string | null = null;
    let userEmail: string | undefined = decoded.email;

    // Determine the user's role based on invitation or superadmin status
    if (role === 'superadmin') {
      // Check if this phone belongs to a system admin
      try {
        const systemAdmin = await systemAdminService.getByPhone(decoded.phone);
        if (systemAdmin && systemAdmin.email === SUPERADMIN_EMAIL) {
          finalRole = 'superadmin';
          userEmail = systemAdmin.email;
          console.log(`✅ Superadmin login: ${decoded.phone}`);
        } else {
          return NextResponse.json(
            { error: 'You are not authorized as a superadmin' },
            { status: 403 }
          );
        }
      } catch (error) {
        console.log('Failed to verify superadmin:', error);
        return NextResponse.json(
          { error: 'You are not authorized as a superadmin' },
          { status: 403 }
        );
      }
    } else if (invitationToken) {
      // User is accepting an invitation
      // First check for business invitation (business_admin)
      try {
        const businessInvitation = await businessInvitationService.getByToken(invitationToken);
        if (businessInvitation && businessInvitation.phone === decoded.phone) {
          if (businessInvitation.status !== 'pending') {
            return NextResponse.json(
              { error: 'This invitation has already been used or has expired' },
              { status: 400 }
            );
          }
          if (new Date(businessInvitation.expires_at) < new Date()) {
            return NextResponse.json(
              { error: 'This invitation has expired' },
              { status: 400 }
            );
          }

          finalRole = 'business_admin';
          restaurantName = businessInvitation.restaurant_name;
          userEmail = businessInvitation.email;

          // Create restaurant for this business admin
          const restaurant = await restaurantService.createRestaurant({
            name: businessInvitation.restaurant_name,
            address: '', // To be filled later
            phone: decoded.phone,
          });
          restaurantId = restaurant.id;

          // Mark invitation as accepted
          await businessInvitationService.markAccepted(businessInvitation.id);

          console.log(`✅ Business admin accepted invitation: ${decoded.phone} for ${restaurantName}`);
        }
      } catch (error) {
        console.log('Not a business invitation, checking staff invitation:', error);
      }

      // If not a business invitation, check for staff invitation (employee)
      if (!finalRole!) {
        try {
          const staffInvitation = await staffInvitationService.getByToken(invitationToken);
          if (staffInvitation && staffInvitation.phone === decoded.phone) {
            if (staffInvitation.status !== 'pending') {
              return NextResponse.json(
                { error: 'This invitation has already been used or has expired' },
                { status: 400 }
              );
            }
            if (new Date(staffInvitation.expires_at) < new Date()) {
              return NextResponse.json(
                { error: 'This invitation has expired' },
                { status: 400 }
              );
            }

            finalRole = 'employee';
            restaurantId = staffInvitation.restaurant_id;

            // Get restaurant name
            const restaurant = await restaurantService.getRestaurantById(restaurantId);
            restaurantName = restaurant?.name || null;

            // Mark invitation as accepted
            await staffInvitationService.markAccepted(staffInvitation.id);

            console.log(`✅ Employee accepted invitation: ${decoded.phone} for ${restaurantName}`);
          } else {
            return NextResponse.json(
              { error: 'Invalid invitation token' },
              { status: 400 }
            );
          }
        } catch (error) {
          console.log('Failed to verify staff invitation:', error);
          return NextResponse.json(
            { error: 'Invalid invitation token' },
            { status: 400 }
          );
        }
      }
    } else if (role === 'business_admin') {
      // Freemium model: Allow self-registration as business_admin
      // Check for existing user first
      try {
        const existingUser = await userService.getUserByPhone(decoded.phone);
        if (existingUser && existingUser.restaurant_id) {
          // Existing user - use their current role and restaurant
          const userRole = existingUser.role as string;
          if (userRole === 'admin' || userRole === 'business_admin') {
            finalRole = 'business_admin';
          } else if (userRole === 'superadmin') {
            finalRole = 'superadmin';
          } else {
            finalRole = 'business_admin';
          }
          restaurantId = existingUser.restaurant_id;
          const restaurant = await restaurantService.getRestaurantById(restaurantId);
          restaurantName = restaurant?.name || null;
          console.log(`✅ Existing business admin login: ${decoded.phone}`);
        } else {
          // New user - allow self-registration as business_admin
          // Restaurant will be created during onboarding
          finalRole = 'business_admin';
          restaurantId = null;
          restaurantName = null;
          console.log(`✅ New business admin registration: ${decoded.phone}`);
        }
      } catch (error) {
        // If check fails, still allow registration
        console.log('Check existing user failed, allowing new registration:', error);
        finalRole = 'business_admin';
        restaurantId = null;
        restaurantName = null;
      }
    } else if (role === 'employee') {
      // Employees must have an invitation or be existing users
      try {
        const existingUser = await userService.getUserByPhone(decoded.phone);
        if (existingUser && existingUser.restaurant_id) {
          const userRole = existingUser.role as string;
          if (userRole === 'staff' || userRole === 'team_member' || userRole === 'employee') {
            finalRole = 'employee';
          } else {
            finalRole = 'employee';
          }
          restaurantId = existingUser.restaurant_id;
          const restaurant = await restaurantService.getRestaurantById(restaurantId);
          restaurantName = restaurant?.name || null;
          console.log(`✅ Existing employee login: ${decoded.phone}`);
        } else {
          // No invitation and no existing user - employees need invitation
          return NextResponse.json(
            { error: 'Employees must be invited by a restaurant administrator. Please ask your manager to send you an invitation.' },
            { status: 403 }
          );
        }
      } catch (error) {
        console.log('Failed to check existing employee:', error);
        return NextResponse.json(
          { error: 'Employees must be invited by a restaurant administrator. Please ask your manager to send you an invitation.' },
          { status: 403 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'Invalid role. Must be "superadmin", "business_admin", or "employee"' },
        { status: 400 }
      );
    }

    // Create or update user in database
    try {
      let user = await userService.getUserByPhone(decoded.phone);
      if (!user) {
        user = await userService.createUser({
          phone: decoded.phone,
          email: userEmail,
          role: finalRole!,
          restaurant_id: restaurantId,
          status: 'active'
        });
      } else {
        await userService.updateUser(user.id, {
          role: finalRole!,
          restaurant_id: restaurantId || undefined,
          status: 'active'
        });
      }
    } catch (error) {
      console.log('Failed to update user in database:', error);
      // Continue anyway - user can still get the token
    }

    // Create new token with role information
    const newTokenPayload: JWTPayload = {
      phone: decoded.phone,
      email: userEmail,
      role: finalRole!,
      restaurant_id: restaurantId,
      restaurant_name: restaurantName || undefined,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
    };

    const newToken = jwt.sign(
      newTokenPayload,
      jwtSecret,
      {
        issuer: 'restaurant-daily',
        audience: 'restaurant-daily-users'
      }
    );

    console.log(`User ${decoded.phone} authenticated as: ${finalRole}`);

    return NextResponse.json({
      success: true,
      token: newToken,
      role: finalRole!,
      restaurantId,
      restaurantName,
      message: `Authenticated as ${finalRole}`
    });

  } catch (error) {
    console.error('Role update error:', error);
    return NextResponse.json(
      { error: 'Failed to update role' },
      { status: 500 }
    );
  }
}
