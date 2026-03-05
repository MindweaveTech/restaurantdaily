import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { secretsManager } from './secrets';

// Initialize clients lazily to allow async config loading
let supabaseAdminInstance: SupabaseClient | null = null;
let supabaseInstance: SupabaseClient | null = null;

// Server-side client with service role key (for API routes)
export const getSupabaseAdmin = async () => {
  if (!supabaseAdminInstance) {
    const config = await secretsManager.getSupabaseConfig();

    if (!config.url || !config.serviceKey) {
      throw new Error('Missing Supabase configuration. Check Vault or environment variables.');
    }

    supabaseAdminInstance = createClient(config.url, config.serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return supabaseAdminInstance;
};

// Client-side client with anon key (for frontend)
export const getSupabase = async () => {
  if (!supabaseInstance) {
    const config = await secretsManager.getSupabaseConfig();

    if (!config.url || !config.anonKey) {
      throw new Error('Missing Supabase configuration. Check Vault or environment variables.');
    }

    supabaseInstance = createClient(config.url, config.anonKey);
  }
  return supabaseInstance;
};

// Legacy exports for immediate use (will try environment first)
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabaseAdmin: SupabaseClient | null = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })
  : null;

export const supabase: SupabaseClient | null = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Database types

// Role type for multi-tenant auth
export type UserRole = 'superadmin' | 'business_admin' | 'employee';

export interface SystemAdmin {
  id: string;
  email: string;
  phone?: string;
  name?: string;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at: string;
  last_login?: string;
}

export interface Restaurant {
  id: string;
  name: string;
  address: string;
  google_maps_link?: string;
  phone: string;
  logo_url?: string;
  settings?: Record<string, unknown>;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  phone: string;
  email?: string;
  name?: string;
  restaurant_id?: string;
  role: UserRole;
  permissions?: string[];
  status: 'pending' | 'active' | 'inactive';
  invited_by?: string;
  first_login?: string;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface BusinessInvitation {
  id: string;
  invited_by: string;
  email?: string;
  phone: string;
  restaurant_name: string;
  role: 'business_admin';
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  invitation_token: string;
  expires_at: string;
  accepted_at?: string;
  created_at: string;
}

export interface StaffInvitation {
  id: string;
  restaurant_id: string;
  phone: string;
  invited_by: string;
  role: 'employee';
  permissions?: string[];
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  invitation_token?: string;
  expires_at: string;
  accepted_at?: string;
  created_at: string;
}

// Cash Session types
export type CashSessionStatus = 'active' | 'closed' | 'void';

export interface CashSession {
  id: string;
  user_id: string;
  restaurant_id: string;
  start_time: string;
  end_time?: string;
  opening_balance: number;
  closing_balance?: number;
  total_sales: number;
  total_refunds: number;
  cash_difference?: number;
  cash_payments: number;
  card_payments: number;
  upi_payments: number;
  other_payments: number;
  status: CashSessionStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Petty Voucher types
export type VoucherStatus = 'pending' | 'approved' | 'rejected' | 'paid' | 'void';
export type VoucherCategory =
  | 'supplies' | 'cleaning' | 'repairs' | 'transport' | 'utilities'
  | 'food_ingredients' | 'packaging' | 'marketing' | 'staff_welfare'
  | 'office_supplies' | 'miscellaneous' | 'other';

export interface PettyVoucher {
  id: string;
  user_id: string;
  restaurant_id: string;
  voucher_number?: string;
  amount: number;
  description: string;
  category: VoucherCategory;
  date: string;
  vendor_name?: string;
  vendor_contact?: string;
  status: VoucherStatus;
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
  receipt_url?: string;
  receipt_urls?: string[];
  paid: boolean;
  paid_at?: string;
  paid_by?: string;
  payment_method?: string;
  created_at: string;
  updated_at: string;
}

// Electricity Payment types
export type PaymentStatus = 'pending' | 'paid' | 'overdue' | 'partial' | 'disputed' | 'void';

export interface ElectricityPayment {
  id: string;
  restaurant_id: string;
  created_by?: string;
  bill_number?: string;
  bill_date: string;
  due_date: string;
  billing_period_start?: string;
  billing_period_end?: string;
  amount: number;
  units_consumed?: number;
  rate_per_unit?: number;
  fixed_charges: number;
  taxes: number;
  late_fee: number;
  total_amount?: number;
  vendor_name: string;
  vendor_account_number?: string;
  meter_number?: string;
  status: PaymentStatus;
  paid_date?: string;
  paid_amount?: number;
  paid_by?: string;
  payment_method?: string;
  payment_reference?: string;
  bill_url?: string;
  receipt_url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Notification types
export type NotificationType =
  | 'info' | 'success' | 'warning' | 'error'
  | 'voucher_pending' | 'voucher_approved' | 'voucher_rejected'
  | 'session_reminder' | 'session_closed'
  | 'payment_due' | 'payment_overdue' | 'payment_received'
  | 'attendance_checkin' | 'attendance_checkout'
  | 'staff_invited' | 'staff_joined'
  | 'report_ready' | 'system_update'
  | 'other';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface Notification {
  id: string;
  user_id: string;
  restaurant_id?: string;
  type: NotificationType;
  title: string;
  message: string;
  icon?: string;
  read: boolean;
  read_at?: string;
  archived: boolean;
  action_url?: string;
  action_label?: string;
  action_data?: Record<string, unknown>;
  entity_type?: string;
  entity_id?: string;
  priority: NotificationPriority;
  scheduled_at?: string;
  expires_at?: string;
  created_at: string;
}