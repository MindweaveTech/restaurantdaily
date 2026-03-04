# Restaurant Daily - Project Plan

## Overview
Mobile-first restaurant performance tracking app with cash management, voucher tracking, and payment monitoring.

## Architecture
- **Frontend**: Next.js 15.5.3 with React 18
- **Styling**: Tailwind CSS (mobile-first)
- **State**: Zustand state management
- **Auth**: JWT with phone/WhatsApp OTP (production ready)
- **Database**: Supabase (PostgreSQL with real-time features)
- **Secrets**: HashiCorp Vault for secure credential management
- **Messaging**: Twilio WhatsApp Business API (with SMS fallback)
- **Deployment**: Azure VM with nginx reverse proxy + PM2

## Core Features

### Authentication System ✅ OPERATIONAL
- Phone number input with international country codes and validation
- WhatsApp OTP verification via Twilio (production ready)
- Visual role selection interface (Restaurant Admin/Staff Member)
- JWT token management with restaurant context and security
- Multi-restaurant support with complete data isolation via RLS

### Restaurant Management ✅ OPERATIONAL
- Role-based authentication and onboarding flows
- Restaurant profile setup (3-step wizard with validation)
- Admin dashboard with quick action cards and management features
- Staff welcome interface with feature overview
- Restaurant-specific navigation and permissions system

### Cash Management
- Start/end cash sessions
- Opening/closing balance
- Transaction tracking
- Session reports

### Voucher Tracking
- Petty cash vouchers
- Expense categories
- Approval workflow
- Receipt attachments

### Payment Monitoring
- Electricity payment tracking
- Due date alerts
- Payment history
- Vendor management

### User Roles & Restaurant Management
- **Restaurant Admin**: Full restaurant management, staff invitation, settings
- **Staff Member**: Restaurant-specific access, daily operations (cash/vouchers)
- **Multi-restaurant Support**: Scalable architecture for restaurant chains

### Restaurant Management Features
- Restaurant profile management (name, address, Google Maps)
- Staff invitation system via WhatsApp
- Role-based permissions and feature access
- Restaurant-specific data isolation and security

## Technical Stack
- Next.js 15.5.3 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Zustand (state management)
- React Hook Form + Zod validation
- Supabase (PostgreSQL database)
- HashiCorp Vault (secrets management)
- Twilio (WhatsApp/SMS messaging)
- PM2 (production process management)
- libphonenumber-js (phone validation)
- Date-fns
- Recharts (analytics)

## Development Phases

### Phase 1: Foundation ✅ COMPLETED
1. ✅ Project setup with Next.js 15.5.3 + TypeScript
2. ✅ Mobile-first responsive homepage with loading animation
3. ✅ Playwright testing framework (4/4 tests passing)
4. ✅ Azure VM deployment with nginx reverse proxy
5. ✅ PM2 production process management
6. ✅ Husky pre-push hooks for quality gates
7. ✅ Complete documentation and GitHub setup
8. ✅ HTTPS deployment with Let's Encrypt SSL
9. ✅ Custom domain setup (restaurant-daily.mindweave.tech)
10. ✅ CSS loading fix for HTTPS (nginx headers + next.config.js)
11. ✅ HashiCorp Vault setup for secrets management
12. ✅ Supabase database setup and Vault integration
13. ✅ Twilio WhatsApp integration (production ready)
14. ✅ Authentication architecture design
15. ✅ Complete OTP messaging system with rate limiting

### Phase 2: Authentication Frontend ✅ COMPLETED
1. ✅ Phone number input component with validation
2. ✅ OTP verification interface (6-digit input with timer)
3. ✅ JWT token management and secure storage
4. ✅ Complete authentication flow (phone → WhatsApp OTP → dashboard)
5. ✅ WhatsApp messaging integration (sandbox mode)
6. ✅ Rate limiting and security features

**Status**: Authentication system fully functional - phone input, WhatsApp OTP delivery, verification, and JWT tokens

### Phase 3: Restaurant Management System ✅ COMPLETED
1. ✅ Restaurant admin role selection interface with visual cards
2. ✅ Restaurant profile management (name, address, Google Maps, settings)
3. ✅ Role-based onboarding flows (Admin setup wizard, Staff welcome)
4. ✅ JWT token enhancement with restaurant context
5. ✅ Multi-restaurant database schema (restaurants, users, staff_invitations)
6. ✅ Row Level Security (RLS) policies for data isolation
7. ✅ Restaurant-specific route protection and permissions
8. ✅ Admin dashboard with restaurant management features
9. ✅ Hybrid secrets management (Vault-first with fallback)
10. ✅ Complete API endpoints for restaurant and user operations
11. ✅ **Supabase CLI integration** - proper migration workflow
12. ✅ **Production database deployment** - schema applied to cloud (`20250914120000_initial_schema.sql`)
13. ✅ **Database tables created** - restaurants, users, staff_invitations with RLS
14. ✅ **Vault integration enhanced** - Supabase auth token stored as `supabase_auth_token`

**Status**: Restaurant management system fully operational with production database, comprehensive E2E testing (31 tests), authentication fixes, role selection flow working, and security hardening complete

### Phase 4: Self-Registration & KYC (CURRENT)

#### 4.1 Self-Registration for Restaurant Admins
1. **Remove invitation requirement for admins** - Allow direct registration
2. **Basic info collection** - Restaurant name, owner name, phone (already verified)
3. **Email collection** - Optional, for receipts and notifications
4. **Terms acceptance** - ToS and Privacy Policy consent

#### 4.2 Business KYC Verification (India-specific)
| Document | Priority | Provider | Purpose |
|----------|----------|----------|---------|
| **FSSAI License** | Critical | Surepass | Mandatory for food businesses |
| **PAN** | High | Surepass/Signzy | Business/proprietor identity |
| **GSTIN** | High | Surepass/Signzy | Tax compliance verification |
| **Bank Account** | Critical | Cashfree | For payouts/refunds |

**Recommended KYC Flow:**
```
1. Phone OTP (already done) ✅
2. Basic Info Collection
3. FSSAI License Verification → instant API check
4. PAN Verification → instant API check
5. GSTIN Verification (if registered) → instant API check
6. Bank Account via UPI VPA → instant verification
7. Account activated → Ready for operations
```

#### 4.3 Bank Account & Payouts Integration
- **Provider**: Cashfree Payouts (recommended)
  - UPI VPA verification (free with Payouts)
  - Reverse Penny Drop for bank account verification
  - 24x7 payouts via IMPS/UPI
  - Bulk payout support
- **Alternative**: Razorpay/RazorpayX
- **Use Cases**: Staff salary payouts, vendor payments, refunds

#### 4.4 Verification API Providers
| Provider | Services | Pricing |
|----------|----------|---------|
| [Surepass](https://surepass.io/) | GST, FSSAI, PAN, Shop & Establishment | Pay-as-you-go |
| [Signzy](https://signzy.com/) | GST, PAN, Bank verification | Pay-as-you-go |
| [Cashfree](https://cashfree.com/) | Bank verification, UPI, Payouts | Per-transaction |

### Phase 5: Core Business Features
1. **Staff Invitation System** - WhatsApp-based team member invitations
2. **Staff Management Dashboard** - Admin interface for team management
3. **Cash Session Management** - Start/end sessions with balance tracking
4. **Transaction Logging** - Categorization and validation systems
5. **Petty Voucher Tracking** - Expense management with approval workflow
6. **Receipt Attachment System** - Photo upload and documentation
7. **Session Reports & Analytics** - Daily/weekly performance summaries

### Phase 6: Advanced Operations & Monitoring
1. **Electricity Payment Monitoring** - Due date tracking and vendor management
2. **Advanced Reporting Dashboard** - Multi-dimensional analytics
3. **Real-time Notifications** - Supabase realtime integration
4. **Audit Logs & Compliance** - Complete activity tracking
5. **Performance Optimization** - Query optimization and caching

### Phase 7: Polish & Advanced Features
1. ✅ SSL/HTTPS setup for production
2. ✅ Database migration to PostgreSQL (Supabase)
3. Real-time notifications using Supabase realtime
4. Advanced reporting and analytics
5. Mobile app version (React Native)
6. SMS fallback after Twilio account upgrade
7. Advanced security monitoring and audit logs

---

## KYC & Payments Technical Reference

### India-Specific Compliance Requirements
- **FSSAI License**: Mandatory for all food businesses (14-digit number)
- **GSTIN**: Required if turnover > ₹40 lakh (₹20 lakh for services)
- **PAN**: Required for all business bank accounts
- **Shop & Establishment**: State-level business registration

### FSSAI Verification API
```javascript
// Example: Surepass FSSAI API
POST /api/v1/fssai/verify
{
  "fssai_number": "10019022000015"
}
// Returns: company_name, license_status, expiry_date, district
```

### GST Verification API
```javascript
// Example: Signzy/Surepass GST API
POST /api/v1/gst/verify
{
  "gstin": "29AABCU9603R1ZM"
}
// Returns: legal_name, trade_name, status, address, constitution
```

### Bank Account Verification Options
1. **UPI VPA Verification** (Recommended - instant, free with Cashfree)
   - User provides UPI ID (e.g., business@upi)
   - Returns account holder name for verification

2. **Penny Drop** (Traditional - ₹1-2 per verification)
   - Deposits ₹1 to account
   - Returns account holder name
   - 91% success rate

3. **Reverse Penny Drop** (Higher accuracy)
   - User initiates ₹1 payment
   - Confirms account ownership

### Payout Integration (Cashfree)
```javascript
// Example: Create Payout
POST /payout/v1/authorize
{
  "beneId": "JOHN18012",
  "amount": "1000.00",
  "transferMode": "upi",
  "beneDetails": {
    "vpa": "staff@upi"
  }
}
```

### Cost Estimates (Per Transaction)
| Service | Provider | Cost |
|---------|----------|------|
| FSSAI Verification | Surepass | ₹2-5 |
| GST Verification | Surepass | ₹2-5 |
| PAN Verification | Surepass | ₹2-5 |
| UPI VPA Verification | Cashfree | Free (with Payouts) |
| Penny Drop | Cashfree | ₹2-3 |
| Payout (UPI/IMPS) | Cashfree | ₹5-10 |