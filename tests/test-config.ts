/**
 * Test Configuration for Playwright E2E Tests
 *
 * This file contains test phone numbers and other configuration
 * used for automated testing with real SMS OTP delivery.
 */

export const testConfig = {
  // Org Admin test account
  orgAdmin: {
    phone: process.env.TEST_ORG_ADMIN_PHONE || '+918826175074',
    // Format without country code for input fields
    phoneLocal: '8826175074',
    countryCode: '+91',
  },

  // Phone to receive OTP (can be same as admin or different)
  otpReceiver: {
    phone: process.env.TEST_OTP_RECEIVER_PHONE || '+918826175074',
  },

  // Timeouts for OTP-related tests (in milliseconds)
  timeouts: {
    otpDelivery: 30000, // Wait up to 30s for OTP to arrive
    otpInput: 5000,     // Time to enter OTP
    pageLoad: 10000,    // Page navigation timeout
  },

  // Test URLs
  urls: {
    home: '/',
    authPhone: '/auth/phone',
    authVerify: '/auth/verify',
    authRoleSelection: '/auth/role-selection',
    dashboard: '/dashboard',
    adminDashboard: '/dashboard/admin',
    staffDashboard: '/dashboard/staff',
  },
};

// Helper to format phone for display
export function formatPhoneDisplay(phone: string): string {
  return phone.replace(/^\+91/, '+91 ');
}

// Helper to extract digits only
export function phoneDigitsOnly(phone: string): string {
  return phone.replace(/\D/g, '').slice(-10);
}
