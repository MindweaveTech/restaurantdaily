# Changelog

All notable changes to Restaurant Daily will be documented in this file.

## [Unreleased]

### Added
- Demo login functionality for testing with predefined phone numbers (+919999999999, +11234567890, +12025551234) using OTP `123456`
- Email and name columns to users table for profile management
- New database migration for user schema updates (`20260306100000_add_user_email_name.sql`)

### Changed
- Role-selection page updated to dark glassmorphism theme to match other auth pages
- Phone number mask on verify page now shows `xxxxxx9999` instead of bullet points
- Freemium model: Business admins can now self-register without invitation
- Restaurant setup page now accepts both `admin` and `business_admin` roles
- Role constraint updated to support `business_admin`, `employee`, `superadmin` roles

### Fixed
- Database schema error: "Could not find the 'email' column of 'users'"
- Role validation in restaurant-setup redirecting business_admin users back to role-selection
- Port consistency in server scripts (standardized to port 3002)
- PROJECT_ROOT path issues in bash scripts

## [0.1.0] - 2026-03-05

### Added
- Initial release of Restaurant Daily
- Phone-based OTP authentication via Twilio SMS
- Role-based access control (Admin/Staff)
- Restaurant onboarding flow
- Admin dashboard with attendance tracking
- Staff management and invitation system
- Cash sessions and petty vouchers tracking
- Dark glassmorphism UI theme
- Mobile-first responsive design
