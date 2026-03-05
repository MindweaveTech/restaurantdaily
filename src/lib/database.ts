import {
  getSupabaseAdmin,
  supabaseAdmin,
  Restaurant,
  User,
  StaffInvitation,
  SystemAdmin,
  BusinessInvitation,
  CashSession,
  PettyVoucher,
  ElectricityPayment,
  Notification,
  VoucherCategory,
  VoucherStatus,
  PaymentStatus,
  NotificationType,
  NotificationPriority,
} from './supabase';
import { SupabaseClient } from '@supabase/supabase-js';
import type { UserRole } from '@/types';

// Helper to get client with fallback
async function getClient(): Promise<SupabaseClient> {
  try {
    return await getSupabaseAdmin();
  } catch {
    if (!supabaseAdmin) {
      throw new Error('No Supabase client available');
    }
    return supabaseAdmin;
  }
}

// System Admin operations (for superadmins)
export class SystemAdminService {
  async getByEmail(email: string): Promise<SystemAdmin | null> {
    const client = await getClient();
    const { data, error } = await client
      .from('system_admins')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('Database error fetching system admin by email:', error);
      throw new Error(`Failed to fetch system admin: ${error.message}`);
    }
    return data;
  }

  async getByPhone(phone: string): Promise<SystemAdmin | null> {
    const client = await getClient();
    const { data, error } = await client
      .from('system_admins')
      .select('*')
      .eq('phone', phone)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('Database error fetching system admin by phone:', error);
      throw new Error(`Failed to fetch system admin: ${error.message}`);
    }
    return data;
  }

  async updateLastLogin(id: string): Promise<void> {
    const client = await getClient();
    const { error } = await client
      .from('system_admins')
      .update({ last_login: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Database error updating system admin last login:', error);
    }
  }
}

// Business Invitation operations (for inviting business admins)
export class BusinessInvitationService {
  async createInvitation(data: {
    invited_by: string;
    phone: string;
    restaurant_name: string;
    email?: string;
  }): Promise<BusinessInvitation> {
    const invitationToken = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    const invitationData = {
      invited_by: data.invited_by,
      phone: data.phone,
      email: data.email || null,
      restaurant_name: data.restaurant_name,
      role: 'business_admin' as const,
      status: 'pending' as const,
      invitation_token: invitationToken,
      expires_at: expiresAt.toISOString(),
    };

    const client = await getClient();
    const { data: invitation, error } = await client
      .from('business_invitations')
      .insert([invitationData])
      .select()
      .single();

    if (error) {
      console.error('Database error creating business invitation:', error);
      throw new Error(`Failed to create business invitation: ${error.message}`);
    }
    return invitation;
  }

  async getByToken(token: string): Promise<BusinessInvitation | null> {
    const client = await getClient();
    const { data, error } = await client
      .from('business_invitations')
      .select('*')
      .eq('invitation_token', token)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('Database error fetching business invitation:', error);
      throw new Error(`Failed to fetch business invitation: ${error.message}`);
    }
    return data;
  }

  async markAccepted(id: string): Promise<void> {
    const client = await getClient();
    const { error } = await client
      .from('business_invitations')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('Database error accepting business invitation:', error);
      throw new Error(`Failed to accept business invitation: ${error.message}`);
    }
  }

  async getAllPending(): Promise<BusinessInvitation[]> {
    const client = await getClient();
    const { data, error } = await client
      .from('business_invitations')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error fetching pending business invitations:', error);
      throw new Error(`Failed to fetch business invitations: ${error.message}`);
    }
    return data || [];
  }
}

// Restaurant operations
export class RestaurantService {

  async createRestaurant(data: {
    name: string;
    address: string;
    phone: string;
    google_maps_link?: string;
    logo_url?: string;
    settings?: Record<string, unknown>;
  }): Promise<Restaurant> {

    const restaurantData = {
      name: data.name.trim(),
      address: data.address.trim(),
      phone: data.phone,
      google_maps_link: data.google_maps_link || null,
      logo_url: data.logo_url || null,
      settings: data.settings || {},
      status: 'active' as const,
    };

    const client = await getClient();
    const { data: restaurant, error } = await client
      .from('restaurants')
      .insert([restaurantData])
      .select()
      .single();

    if (error) {
      console.error('Database error creating restaurant:', error);
      throw new Error(`Failed to create restaurant: ${error.message}`);
    }

    return restaurant;
  }

  async getRestaurantById(id: string): Promise<Restaurant | null> {
    const client = await getClient();
    const { data: restaurant, error } = await client
      .from('restaurants')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Restaurant not found
        return null;
      }
      console.error('Database error fetching restaurant:', error);
      throw new Error(`Failed to fetch restaurant: ${error.message}`);
    }

    return restaurant;
  }

  async getRestaurantByPhone(phone: string): Promise<Restaurant | null> {
    const client = await getClient();
    const { data: restaurant, error } = await client
      .from('restaurants')
      .select('*')
      .eq('phone', phone)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Restaurant not found
        return null;
      }
      console.error('Database error fetching restaurant by phone:', error);
      throw new Error(`Failed to fetch restaurant: ${error.message}`);
    }

    return restaurant;
  }

  async updateRestaurant(id: string, updates: Partial<Omit<Restaurant, 'id' | 'created_at' | 'updated_at'>>): Promise<Restaurant> {
    const client = await getClient();
    const { data: restaurant, error } = await client
      .from('restaurants')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Database error updating restaurant:', error);
      throw new Error(`Failed to update restaurant: ${error.message}`);
    }

    return restaurant;
  }
}

// User operations
export class UserService {

  async createUser(data: {
    phone: string;
    email?: string;
    name?: string;
    restaurant_id?: string | null;
    role: UserRole;
    permissions?: string[];
    status?: 'pending' | 'active' | 'inactive';
    invited_by?: string;
  }): Promise<User> {

    const userData = {
      phone: data.phone,
      email: data.email || null,
      name: data.name || null,
      restaurant_id: data.restaurant_id || null,
      role: data.role,
      permissions: data.permissions || [],
      status: data.status || 'active',
      invited_by: data.invited_by || null,
      first_login: null,
      last_login: null,
    };

    const client = await getClient();
    const { data: user, error } = await client
      .from('users')
      .insert([userData])
      .select()
      .single();

    if (error) {
      console.error('Database error creating user:', error);
      throw new Error(`Failed to create user: ${error.message}`);
    }

    return user;
  }

  async getUserByPhone(phone: string): Promise<User | null> {
    const client = await getClient();
    const { data: user, error } = await client
      .from('users')
      .select('*')
      .eq('phone', phone)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // User not found
        return null;
      }
      console.error('Database error fetching user:', error);
      throw new Error(`Failed to fetch user: ${error.message}`);
    }

    return user;
  }

  async updateUser(id: string, updates: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>): Promise<User> {
    const client = await getClient();
    const { data: user, error } = await client
      .from('users')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Database error updating user:', error);
      throw new Error(`Failed to update user: ${error.message}`);
    }

    return user;
  }

  async updateLastLogin(phone: string): Promise<void> {
    const client = await getClient();
    const { error } = await client
      .from('users')
      .update({
        last_login: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('phone', phone);

    if (error) {
      console.error('Database error updating last login:', error);
      // Don't throw error for login tracking failures
    }
  }
}

// Staff invitation operations
export class StaffInvitationService {

  async createInvitation(data: {
    restaurant_id: string;
    phone: string;
    invited_by: string;
    role?: 'staff';
    permissions?: string[];
  }): Promise<StaffInvitation> {

    // Generate secure invitation token
    const invitationToken = crypto.randomUUID();

    // Set expiration to 7 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invitationData = {
      restaurant_id: data.restaurant_id,
      phone: data.phone,
      invited_by: data.invited_by,
      role: data.role || 'staff' as const,
      permissions: data.permissions || [],
      status: 'pending' as const,
      invitation_token: invitationToken,
      expires_at: expiresAt.toISOString(),
    };

    const client = await getClient();
    const { data: invitation, error } = await client
      .from('staff_invitations')
      .insert([invitationData])
      .select()
      .single();

    if (error) {
      console.error('Database error creating staff invitation:', error);
      throw new Error(`Failed to create staff invitation: ${error.message}`);
    }

    return invitation;
  }

  async getInvitationByToken(token: string): Promise<StaffInvitation | null> {
    const client = await getClient();
    const { data: invitation, error } = await client
      .from('staff_invitations')
      .select('*')
      .eq('invitation_token', token)
      .eq('status', 'pending')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Invitation not found
        return null;
      }
      console.error('Database error fetching invitation:', error);
      throw new Error(`Failed to fetch invitation: ${error.message}`);
    }

    return invitation;
  }

  // Alias for getInvitationByToken for consistency with other services
  async getByToken(token: string): Promise<StaffInvitation | null> {
    return this.getInvitationByToken(token);
  }

  async markAccepted(id: string): Promise<void> {
    const client = await getClient();
    const { error } = await client
      .from('staff_invitations')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('Database error marking staff invitation accepted:', error);
      throw new Error(`Failed to accept staff invitation: ${error.message}`);
    }
  }

  async getRestaurantInvitations(restaurant_id: string): Promise<StaffInvitation[]> {
    const client = await getClient();
    const { data: invitations, error } = await client
      .from('staff_invitations')
      .select('*')
      .eq('restaurant_id', restaurant_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error fetching restaurant invitations:', error);
      throw new Error(`Failed to fetch invitations: ${error.message}`);
    }

    return invitations || [];
  }

  async acceptInvitation(invitationId: string): Promise<StaffInvitation> {
    const client = await getClient();
    const { data: invitation, error } = await client
      .from('staff_invitations')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString()
      })
      .eq('id', invitationId)
      .eq('status', 'pending')
      .select()
      .single();

    if (error) {
      console.error('Database error accepting invitation:', error);
      throw new Error(`Failed to accept invitation: ${error.message}`);
    }

    return invitation;
  }

  async cancelInvitation(invitationId: string): Promise<StaffInvitation> {
    const client = await getClient();
    const { data: invitation, error } = await client
      .from('staff_invitations')
      .update({ status: 'cancelled' })
      .eq('id', invitationId)
      .eq('status', 'pending')
      .select()
      .single();

    if (error) {
      console.error('Database error cancelling invitation:', error);
      throw new Error(`Failed to cancel invitation: ${error.message}`);
    }

    return invitation;
  }

  async expireOldInvitations(): Promise<void> {
    const client = await getClient();
    const { error } = await client
      .from('staff_invitations')
      .update({ status: 'expired' })
      .eq('status', 'pending')
      .lt('expires_at', new Date().toISOString());

    if (error) {
      console.error('Database error expiring old invitations:', error);
      // Don't throw error for cleanup operations
    }
  }

  async checkExistingInvitation(restaurant_id: string, phone: string): Promise<StaffInvitation | null> {
    const client = await getClient();
    const { data: invitation, error } = await client
      .from('staff_invitations')
      .select('*')
      .eq('restaurant_id', restaurant_id)
      .eq('phone', phone)
      .eq('status', 'pending')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No existing invitation
        return null;
      }
      console.error('Database error checking existing invitation:', error);
      throw new Error(`Failed to check existing invitation: ${error.message}`);
    }

    return invitation;
  }
}

// Attendance operations
export class AttendanceService {

  // Check if user has an active check-in (not checked out)
  async getActiveCheckIn(userId: string, restaurantId: string): Promise<{
    id: string;
    user_id: string;
    restaurant_id: string;
    check_in_time: string;
    check_out_time: string | null;
    status: string;
    notes: string | null;
    break_minutes: number;
  } | null> {
    const client = await getClient();
    const { data, error } = await client
      .from('attendance_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('restaurant_id', restaurantId)
      .is('check_out_time', null)
      .order('check_in_time', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // No active check-in
      console.error('Database error fetching active check-in:', error);
      throw new Error(`Failed to fetch active check-in: ${error.message}`);
    }
    return data;
  }

  // Check in a user
  async checkIn(data: {
    userId: string;
    restaurantId: string;
    latitude?: number;
    longitude?: number;
    notes?: string;
  }): Promise<{
    id: string;
    user_id: string;
    restaurant_id: string;
    check_in_time: string;
    status: string;
  }> {
    // First check if user already has an active check-in
    const activeCheckIn = await this.getActiveCheckIn(data.userId, data.restaurantId);
    if (activeCheckIn) {
      throw new Error('User already has an active check-in. Please check out first.');
    }

    const checkInData = {
      user_id: data.userId,
      restaurant_id: data.restaurantId,
      check_in_lat: data.latitude || null,
      check_in_lng: data.longitude || null,
      notes: data.notes || null,
      status: 'checked_in',
    };

    const client = await getClient();
    const { data: attendance, error } = await client
      .from('attendance_logs')
      .insert([checkInData])
      .select()
      .single();

    if (error) {
      console.error('Database error creating check-in:', error);
      throw new Error(`Failed to check in: ${error.message}`);
    }

    return attendance;
  }

  // Check out a user
  async checkOut(data: {
    attendanceId: string;
    userId: string;
    latitude?: number;
    longitude?: number;
    notes?: string;
    breakMinutes?: number;
  }): Promise<{
    id: string;
    user_id: string;
    check_in_time: string;
    check_out_time: string;
    hours_worked: number;
    status: string;
  }> {
    const client = await getClient();

    const updateData: Record<string, unknown> = {
      check_out_time: new Date().toISOString(),
      check_out_lat: data.latitude || null,
      check_out_lng: data.longitude || null,
    };

    if (data.notes) {
      updateData.notes = data.notes;
    }

    if (data.breakMinutes !== undefined) {
      updateData.break_minutes = data.breakMinutes;
    }

    const { data: attendance, error } = await client
      .from('attendance_logs')
      .update(updateData)
      .eq('id', data.attendanceId)
      .eq('user_id', data.userId) // Security: ensure user owns this record
      .is('check_out_time', null) // Prevent double checkout
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('No active check-in found or already checked out');
      }
      console.error('Database error checking out:', error);
      throw new Error(`Failed to check out: ${error.message}`);
    }

    return attendance;
  }

  // Get today's attendance for a restaurant (admin view)
  async getTodayAttendance(restaurantId: string): Promise<Array<{
    id: string;
    user_id: string;
    check_in_time: string;
    check_out_time: string | null;
    hours_worked: number | null;
    status: string;
    user_name: string | null;
    user_phone: string;
  }>> {
    const client = await getClient();

    // Get start of today in UTC
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data, error } = await client
      .from('attendance_logs')
      .select(`
        id,
        user_id,
        check_in_time,
        check_out_time,
        hours_worked,
        status,
        users!inner (
          name,
          phone
        )
      `)
      .eq('restaurant_id', restaurantId)
      .gte('check_in_time', today.toISOString())
      .order('check_in_time', { ascending: false });

    if (error) {
      console.error('Database error fetching today attendance:', error);
      throw new Error(`Failed to fetch today's attendance: ${error.message}`);
    }

    // Transform the data to flatten user info
    // Note: Supabase returns joined data as arrays, so we handle both cases
    return (data || []).map((record: {
      id: string;
      user_id: string;
      check_in_time: string;
      check_out_time: string | null;
      hours_worked: number | null;
      status: string;
      users: { name: string | null; phone: string } | { name: string | null; phone: string }[];
    }) => {
      // Handle both single object and array formats from Supabase
      const user = Array.isArray(record.users) ? record.users[0] : record.users;
      return {
        id: record.id,
        user_id: record.user_id,
        check_in_time: record.check_in_time,
        check_out_time: record.check_out_time,
        hours_worked: record.hours_worked,
        status: record.status,
        user_name: user?.name || null,
        user_phone: user?.phone || '',
      };
    });
  }

  // Get attendance history with filters
  async getAttendanceHistory(options: {
    restaurantId: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<{
    data: Array<{
      id: string;
      user_id: string;
      check_in_time: string;
      check_out_time: string | null;
      hours_worked: number | null;
      overtime_hours: number;
      status: string;
      notes: string | null;
      user_name: string | null;
      user_phone: string;
    }>;
    total: number;
  }> {
    const client = await getClient();

    let query = client
      .from('attendance_logs')
      .select(`
        id,
        user_id,
        check_in_time,
        check_out_time,
        hours_worked,
        overtime_hours,
        status,
        notes,
        users!inner (
          name,
          phone
        )
      `, { count: 'exact' })
      .eq('restaurant_id', options.restaurantId)
      .order('check_in_time', { ascending: false });

    if (options.userId) {
      query = query.eq('user_id', options.userId);
    }

    if (options.startDate) {
      query = query.gte('check_in_time', options.startDate);
    }

    if (options.endDate) {
      query = query.lte('check_in_time', options.endDate);
    }

    if (options.status) {
      query = query.eq('status', options.status);
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 50) - 1);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Database error fetching attendance history:', error);
      throw new Error(`Failed to fetch attendance history: ${error.message}`);
    }

    // Transform the data - handle both array and object formats from Supabase
    const transformedData = (data || []).map((record: {
      id: string;
      user_id: string;
      check_in_time: string;
      check_out_time: string | null;
      hours_worked: number | null;
      overtime_hours: number;
      status: string;
      notes: string | null;
      users: { name: string | null; phone: string } | { name: string | null; phone: string }[];
    }) => {
      const user = Array.isArray(record.users) ? record.users[0] : record.users;
      return {
        id: record.id,
        user_id: record.user_id,
        check_in_time: record.check_in_time,
        check_out_time: record.check_out_time,
        hours_worked: record.hours_worked,
        overtime_hours: record.overtime_hours,
        status: record.status,
        notes: record.notes,
        user_name: user?.name || null,
        user_phone: user?.phone || '',
      };
    });

    return {
      data: transformedData,
      total: count || 0,
    };
  }

  // Get user's attendance history
  async getUserAttendanceHistory(userId: string, options?: {
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<Array<{
    id: string;
    check_in_time: string;
    check_out_time: string | null;
    hours_worked: number | null;
    status: string;
    notes: string | null;
  }>> {
    const client = await getClient();

    let query = client
      .from('attendance_logs')
      .select('id, check_in_time, check_out_time, hours_worked, status, notes')
      .eq('user_id', userId)
      .order('check_in_time', { ascending: false });

    if (options?.startDate) {
      query = query.gte('check_in_time', options.startDate);
    }

    if (options?.endDate) {
      query = query.lte('check_in_time', options.endDate);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Database error fetching user attendance history:', error);
      throw new Error(`Failed to fetch attendance history: ${error.message}`);
    }

    return data || [];
  }

  // Get attendance summary for a restaurant
  async getAttendanceSummary(restaurantId: string): Promise<{
    totalStaff: number;
    checkedIn: number;
    checkedOut: number;
    notCheckedIn: number;
  }> {
    const client = await getClient();

    // Get start of today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get total active staff
    const { count: totalStaff } = await client
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('restaurant_id', restaurantId)
      .eq('status', 'active')
      .eq('role', 'employee');

    // Get today's check-ins
    const { data: todayAttendance } = await client
      .from('attendance_logs')
      .select('user_id, status')
      .eq('restaurant_id', restaurantId)
      .gte('check_in_time', today.toISOString());

    const checkedIn = todayAttendance?.filter(a => a.status === 'checked_in').length || 0;
    const checkedOut = todayAttendance?.filter(a => a.status === 'checked_out').length || 0;
    const total = totalStaff || 0;
    const notCheckedIn = Math.max(0, total - (checkedIn + checkedOut));

    return {
      totalStaff: total,
      checkedIn,
      checkedOut,
      notCheckedIn,
    };
  }
}

// Cash Session operations
export class CashSessionService {

  async createSession(data: {
    userId: string;
    restaurantId: string;
    openingBalance: number;
    notes?: string;
  }): Promise<CashSession> {
    // Check for existing active session
    const activeSession = await this.getActiveSession(data.userId, data.restaurantId);
    if (activeSession) {
      throw new Error('User already has an active cash session. Please close it first.');
    }

    const sessionData = {
      user_id: data.userId,
      restaurant_id: data.restaurantId,
      opening_balance: data.openingBalance,
      notes: data.notes || null,
      status: 'active' as const,
    };

    const client = await getClient();
    const { data: session, error } = await client
      .from('cash_sessions')
      .insert([sessionData])
      .select()
      .single();

    if (error) {
      console.error('Database error creating cash session:', error);
      throw new Error(`Failed to create cash session: ${error.message}`);
    }

    return session;
  }

  async getActiveSession(userId: string, restaurantId: string): Promise<CashSession | null> {
    const client = await getClient();
    const { data, error } = await client
      .from('cash_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('restaurant_id', restaurantId)
      .eq('status', 'active')
      .order('start_time', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('Database error fetching active session:', error);
      throw new Error(`Failed to fetch active session: ${error.message}`);
    }
    return data;
  }

  async closeSession(data: {
    sessionId: string;
    userId: string;
    closingBalance: number;
    totalSales?: number;
    totalRefunds?: number;
    cashPayments?: number;
    cardPayments?: number;
    upiPayments?: number;
    otherPayments?: number;
    notes?: string;
  }): Promise<CashSession> {
    const client = await getClient();

    const updateData: Record<string, unknown> = {
      closing_balance: data.closingBalance,
      status: 'closed',
      end_time: new Date().toISOString(),
    };

    if (data.totalSales !== undefined) updateData.total_sales = data.totalSales;
    if (data.totalRefunds !== undefined) updateData.total_refunds = data.totalRefunds;
    if (data.cashPayments !== undefined) updateData.cash_payments = data.cashPayments;
    if (data.cardPayments !== undefined) updateData.card_payments = data.cardPayments;
    if (data.upiPayments !== undefined) updateData.upi_payments = data.upiPayments;
    if (data.otherPayments !== undefined) updateData.other_payments = data.otherPayments;
    if (data.notes) updateData.notes = data.notes;

    const { data: session, error } = await client
      .from('cash_sessions')
      .update(updateData)
      .eq('id', data.sessionId)
      .eq('user_id', data.userId)
      .eq('status', 'active')
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('No active session found or already closed');
      }
      console.error('Database error closing session:', error);
      throw new Error(`Failed to close session: ${error.message}`);
    }

    return session;
  }

  async getSessionById(sessionId: string): Promise<CashSession | null> {
    const client = await getClient();
    const { data, error } = await client
      .from('cash_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to fetch session: ${error.message}`);
    }
    return data;
  }

  async getRestaurantSessions(restaurantId: string, options?: {
    status?: 'active' | 'closed';
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<CashSession[]> {
    const client = await getClient();
    let query = client
      .from('cash_sessions')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('start_time', { ascending: false });

    if (options?.status) query = query.eq('status', options.status);
    if (options?.startDate) query = query.gte('start_time', options.startDate);
    if (options?.endDate) query = query.lte('start_time', options.endDate);
    if (options?.limit) query = query.limit(options.limit);

    const { data, error } = await query;
    if (error) throw new Error(`Failed to fetch sessions: ${error.message}`);
    return data || [];
  }
}

// Petty Voucher operations
export class PettyVoucherService {

  async createVoucher(data: {
    userId: string;
    restaurantId: string;
    amount: number;
    description: string;
    category: VoucherCategory;
    date?: string;
    vendorName?: string;
    vendorContact?: string;
    receiptUrl?: string;
  }): Promise<PettyVoucher> {
    const voucherData = {
      user_id: data.userId,
      restaurant_id: data.restaurantId,
      amount: data.amount,
      description: data.description,
      category: data.category,
      date: data.date || new Date().toISOString().split('T')[0],
      vendor_name: data.vendorName || null,
      vendor_contact: data.vendorContact || null,
      receipt_url: data.receiptUrl || null,
      status: 'pending' as const,
    };

    const client = await getClient();
    const { data: voucher, error } = await client
      .from('petty_vouchers')
      .insert([voucherData])
      .select()
      .single();

    if (error) {
      console.error('Database error creating voucher:', error);
      throw new Error(`Failed to create voucher: ${error.message}`);
    }

    return voucher;
  }

  async getVoucherById(voucherId: string): Promise<PettyVoucher | null> {
    const client = await getClient();
    const { data, error } = await client
      .from('petty_vouchers')
      .select('*')
      .eq('id', voucherId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to fetch voucher: ${error.message}`);
    }
    return data;
  }

  async updateVoucherStatus(data: {
    voucherId: string;
    status: VoucherStatus;
    approvedBy?: string;
    rejectionReason?: string;
  }): Promise<PettyVoucher> {
    const client = await getClient();

    const updateData: Record<string, unknown> = {
      status: data.status,
    };

    if (data.status === 'approved' && data.approvedBy) {
      updateData.approved_by = data.approvedBy;
      updateData.approved_at = new Date().toISOString();
    }

    if (data.status === 'rejected' && data.rejectionReason) {
      updateData.rejection_reason = data.rejectionReason;
    }

    const { data: voucher, error } = await client
      .from('petty_vouchers')
      .update(updateData)
      .eq('id', data.voucherId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update voucher: ${error.message}`);
    return voucher;
  }

  async getRestaurantVouchers(restaurantId: string, options?: {
    status?: VoucherStatus;
    category?: VoucherCategory;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ data: PettyVoucher[]; total: number }> {
    const client = await getClient();
    let query = client
      .from('petty_vouchers')
      .select('*', { count: 'exact' })
      .eq('restaurant_id', restaurantId)
      .order('date', { ascending: false });

    if (options?.status) query = query.eq('status', options.status);
    if (options?.category) query = query.eq('category', options.category);
    if (options?.startDate) query = query.gte('date', options.startDate);
    if (options?.endDate) query = query.lte('date', options.endDate);
    if (options?.limit) query = query.limit(options.limit);
    if (options?.offset) query = query.range(options.offset, options.offset + (options.limit || 50) - 1);

    const { data, error, count } = await query;
    if (error) throw new Error(`Failed to fetch vouchers: ${error.message}`);
    return { data: data || [], total: count || 0 };
  }

  async getUserVouchers(userId: string, options?: {
    status?: VoucherStatus;
    limit?: number;
  }): Promise<PettyVoucher[]> {
    const client = await getClient();
    let query = client
      .from('petty_vouchers')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (options?.status) query = query.eq('status', options.status);
    if (options?.limit) query = query.limit(options.limit);

    const { data, error } = await query;
    if (error) throw new Error(`Failed to fetch user vouchers: ${error.message}`);
    return data || [];
  }

  async getPendingCount(restaurantId: string): Promise<number> {
    const client = await getClient();
    const { count, error } = await client
      .from('petty_vouchers')
      .select('*', { count: 'exact', head: true })
      .eq('restaurant_id', restaurantId)
      .eq('status', 'pending');

    if (error) throw new Error(`Failed to count pending vouchers: ${error.message}`);
    return count || 0;
  }
}

// Electricity Payment operations
export class ElectricityPaymentService {

  async createPayment(data: {
    restaurantId: string;
    createdBy: string;
    amount: number;
    billDate: string;
    dueDate: string;
    vendorName: string;
    billNumber?: string;
    unitsConsumed?: number;
    ratePerUnit?: number;
    fixedCharges?: number;
    taxes?: number;
    vendorAccountNumber?: string;
    meterNumber?: string;
    billUrl?: string;
    notes?: string;
  }): Promise<ElectricityPayment> {
    const paymentData = {
      restaurant_id: data.restaurantId,
      created_by: data.createdBy,
      amount: data.amount,
      bill_date: data.billDate,
      due_date: data.dueDate,
      vendor_name: data.vendorName,
      bill_number: data.billNumber || null,
      units_consumed: data.unitsConsumed || null,
      rate_per_unit: data.ratePerUnit || null,
      fixed_charges: data.fixedCharges || 0,
      taxes: data.taxes || 0,
      vendor_account_number: data.vendorAccountNumber || null,
      meter_number: data.meterNumber || null,
      bill_url: data.billUrl || null,
      notes: data.notes || null,
      status: 'pending' as const,
    };

    const client = await getClient();
    const { data: payment, error } = await client
      .from('electricity_payments')
      .insert([paymentData])
      .select()
      .single();

    if (error) {
      console.error('Database error creating electricity payment:', error);
      throw new Error(`Failed to create payment: ${error.message}`);
    }

    return payment;
  }

  async markAsPaid(data: {
    paymentId: string;
    paidBy: string;
    paidAmount: number;
    paymentMethod?: string;
    paymentReference?: string;
    receiptUrl?: string;
  }): Promise<ElectricityPayment> {
    const client = await getClient();

    const updateData = {
      status: 'paid' as const,
      paid_date: new Date().toISOString().split('T')[0],
      paid_by: data.paidBy,
      paid_amount: data.paidAmount,
      payment_method: data.paymentMethod || null,
      payment_reference: data.paymentReference || null,
      receipt_url: data.receiptUrl || null,
    };

    const { data: payment, error } = await client
      .from('electricity_payments')
      .update(updateData)
      .eq('id', data.paymentId)
      .select()
      .single();

    if (error) throw new Error(`Failed to mark payment as paid: ${error.message}`);
    return payment;
  }

  async getRestaurantPayments(restaurantId: string, options?: {
    status?: PaymentStatus;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<ElectricityPayment[]> {
    const client = await getClient();
    let query = client
      .from('electricity_payments')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('due_date', { ascending: false });

    if (options?.status) query = query.eq('status', options.status);
    if (options?.startDate) query = query.gte('bill_date', options.startDate);
    if (options?.endDate) query = query.lte('bill_date', options.endDate);
    if (options?.limit) query = query.limit(options.limit);

    const { data, error } = await query;
    if (error) throw new Error(`Failed to fetch payments: ${error.message}`);
    return data || [];
  }

  async getPendingPayments(restaurantId: string): Promise<ElectricityPayment[]> {
    const client = await getClient();
    const { data, error } = await client
      .from('electricity_payments')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .in('status', ['pending', 'overdue'])
      .order('due_date', { ascending: true });

    if (error) throw new Error(`Failed to fetch pending payments: ${error.message}`);
    return data || [];
  }
}

// Notification operations
export class NotificationService {

  async createNotification(data: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    restaurantId?: string;
    actionUrl?: string;
    actionLabel?: string;
    entityType?: string;
    entityId?: string;
    priority?: NotificationPriority;
    icon?: string;
  }): Promise<Notification> {
    const notificationData = {
      user_id: data.userId,
      restaurant_id: data.restaurantId || null,
      type: data.type,
      title: data.title,
      message: data.message,
      action_url: data.actionUrl || null,
      action_label: data.actionLabel || null,
      entity_type: data.entityType || null,
      entity_id: data.entityId || null,
      priority: data.priority || 'normal',
      icon: data.icon || null,
    };

    const client = await getClient();
    const { data: notification, error } = await client
      .from('notifications')
      .insert([notificationData])
      .select()
      .single();

    if (error) throw new Error(`Failed to create notification: ${error.message}`);
    return notification;
  }

  async getUserNotifications(userId: string, options?: {
    unreadOnly?: boolean;
    limit?: number;
  }): Promise<Notification[]> {
    const client = await getClient();
    let query = client
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('archived', false)
      .order('created_at', { ascending: false });

    if (options?.unreadOnly) query = query.eq('read', false);
    if (options?.limit) query = query.limit(options.limit);

    const { data, error } = await query;
    if (error) throw new Error(`Failed to fetch notifications: ${error.message}`);
    return data || [];
  }

  async markAsRead(notificationId: string, userId: string): Promise<void> {
    const client = await getClient();
    const { error } = await client
      .from('notifications')
      .update({ read: true, read_at: new Date().toISOString() })
      .eq('id', notificationId)
      .eq('user_id', userId);

    if (error) throw new Error(`Failed to mark notification as read: ${error.message}`);
  }

  async markAllAsRead(userId: string): Promise<number> {
    const client = await getClient();
    const { data, error } = await client
      .from('notifications')
      .update({ read: true, read_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('read', false)
      .select();

    if (error) throw new Error(`Failed to mark notifications as read: ${error.message}`);
    return data?.length || 0;
  }

  async getUnreadCount(userId: string): Promise<number> {
    const client = await getClient();
    const { count, error } = await client
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false)
      .eq('archived', false);

    if (error) throw new Error(`Failed to count notifications: ${error.message}`);
    return count || 0;
  }

  async archiveNotification(notificationId: string, userId: string): Promise<void> {
    const client = await getClient();
    const { error } = await client
      .from('notifications')
      .update({ archived: true })
      .eq('id', notificationId)
      .eq('user_id', userId);

    if (error) throw new Error(`Failed to archive notification: ${error.message}`);
  }
}

// Singleton instances
export const systemAdminService = new SystemAdminService();
export const businessInvitationService = new BusinessInvitationService();
export const restaurantService = new RestaurantService();
export const userService = new UserService();
export const staffInvitationService = new StaffInvitationService();
export const attendanceService = new AttendanceService();
export const cashSessionService = new CashSessionService();
export const pettyVoucherService = new PettyVoucherService();
export const electricityPaymentService = new ElectricityPaymentService();
export const notificationService = new NotificationService();