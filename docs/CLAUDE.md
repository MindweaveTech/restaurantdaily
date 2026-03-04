# Claude Code Configuration

## Restaurant Daily - Performance Tracking App

### Lint & Type Check Commands
```bash
npm run lint
npm run type-check
npm run build
```

### Development Commands

#### Server Control Scripts ✅ RECOMMENDED
```bash
./start_app.sh        # Start development server on port 3001
./stop_app.sh         # Stop development server gracefully
./restart_app.sh      # Restart development server
./status_app.sh       # Check server status and resource usage
./logs_app.sh         # View real-time server logs (Ctrl+C to exit)
```

#### NPM Commands
```bash
npm run dev           # Development server (Turbopack) - also: ./start_app.sh
npm start             # Production server (PM2 managed)
npm run build         # Production build
npm run test          # Run Playwright tests
npm run test:ui       # Run tests with UI
npm run test:headed   # Run tests in headed mode
npm run test:report   # Generate updated TEST_REPORT.md
npm run test:full     # Run tests + generate report (complete workflow)
```

### Production Management
```bash
pm2 status            # Check PM2 processes
pm2 logs restaurant-daily  # View app logs
pm2 restart restaurant-daily  # Restart app
pm2 stop restaurant-daily     # Stop app
pm2 delete restaurant-daily   # Remove from PM2
```

### Automated Testing & Quality Gates 🤖

#### Test Report Automation ✅
- **Auto-generated** TEST_REPORT.md on each test run
- **Pre-push hooks** run tests + generate report (Husky)
- **GitHub Actions** update report on push to main
- **Real-time metrics** show current test status (14/14 passing)

#### Quality Gates Pipeline
```bash
# Pre-push workflow (Husky):
1. 🧪 Run Playwright tests (14 tests)
2. 📊 Generate TEST_REPORT.md
3. 🔍 ESLint code quality check
4. 🏗️  Production build validation
5. ✅ Push to repository (if all pass)

# GitHub Actions workflow:
1. 🔧 Setup Node.js environment
2. 📦 Install dependencies + Playwright
3. 🏗️  Build application
4. 🚀 Start production server
5. 🧪 Run full test suite
6. 📊 Auto-update TEST_REPORT.md
7. 💾 Commit updated report to main
8. 🔒 Security audit + secret scanning
```

#### Current Test Status (Live)
- **Total Tests:** 14 (Core App + Authentication)
- **Success Rate:** 100% (14/14 passing)
- **Test Duration:** ~5.3s
- **Coverage:** Homepage, Auth Flow, Mobile Responsive
- **Browsers:** Desktop Chrome, Mobile Chrome (Pixel 5)
- **Last Updated:** Auto-generated on each push

#### Test Development Workflow
```bash
# Local development
npm run test          # Quick test run
npm run test:ui       # Interactive test debugging
npm run test:headed   # Watch tests run in browser

# Report generation
npm run test:report   # Manual report update
npm run test:full     # Complete workflow (test + report)

# Pre-deployment validation
git push origin main  # Triggers full quality gate pipeline
```

### Current Deployment Setup

#### Server Information
- **Azure VM**: Ubuntu Linux (6.8.0-1034-azure)
- **Public IP**: 4.213.183.139
- **Internal IP**: 10.0.0.4
- **Domain**: restaurant-daily.mindweave.tech
- **Fallback IP**: 4.213.183.139

#### Application Stack
- **Frontend**: Next.js 15.5.3 with TypeScript
- **Database**: Supabase (PostgreSQL with real-time features)
- **Secrets Management**: HashiCorp Vault v1.20.3
- **Authentication**: SMS OTP via Twilio (production ready)
- **Messaging**: Twilio SMS API
- **Styling**: Tailwind CSS (mobile-first responsive)
- **State Management**: Zustand
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **Process Manager**: PM2 (production)
- **Git Hooks**: Husky (pre-push testing)
- **Production Server**: Port 3001 (PM2 managed)

#### Nginx Configuration
- **Config File**: `/etc/nginx/sites-available/restaurant-daily`
- **Enabled**: Symlinked to `/etc/nginx/sites-enabled/`
- **Ports**: 443 (HTTPS), 80 (HTTP redirect)
- **SSL**: Let's Encrypt certificate with auto-renewal
- **Proxy**: Forwards all traffic to localhost:3001
- **Headers**: X-Forwarded-Proto, X-Forwarded-Host, X-Forwarded-Server
- **Features**: Gzip compression, proper headers, WebSocket support
- **Status**: Active with HTTPS working

#### Firewall & Security
- **UFW Status**: Active
- **Allowed Ports**: 22 (SSH), 80 (HTTP), 443 (HTTPS via "Nginx Full")
- **SSL Certificate**: Let's Encrypt (mindweavehq@gmail.com)
- **Azure NSG**: Configured for HTTP/HTTPS traffic
- **External Access**: ✅ Working from internet with HTTPS

#### Project Structure
```
/home/grao/Projects/restaurant-daily/
├── src/
│   ├── app/
│   │   └── api/auth/ (OTP request/verify, test messaging)
│   ├── components/ (ui, auth, dashboard, cash, vouchers, payments)
│   ├── lib/
│   │   ├── messaging/ (twilio-client, phone-validator, otp-service)
│   │   ├── auth/
│   │   ├── api/
│   │   └── utils/
│   ├── store/
│   ├── types/
│   └── hooks/
├── CLAUDE.md (this file)
├── PLAN.md (project roadmap)
├── TASKS.md (task management - window size: 5)
├── AUTH_ARCHITECTURE.md (authentication system design)
├── TWILIO_INTEGRATION_PLAN.md (messaging integration guide)
├── SMS_UPGRADE_GUIDE.md (sandbox to production upgrade)
├── test-twilio-messaging.mjs (comprehensive messaging tests)
└── package.json
```

### Project Context
- Next.js React app for restaurant performance tracking
- Mobile-first responsive design (optimized for iPhone/tablets)
- Authentication: phone → SMS OTP → role selection (production ready)
- Features: cash sessions, petty vouchers, electricity payments
- Role-based access (admin/team members)
- Real-time updates and mobile-friendly interface
- Secure messaging via Twilio SMS API

### Quick Access
- **Local Development**: http://localhost:3001
- **Production Access**: https://restaurant-daily.mindweave.tech ✅ HTTPS
- **Fallback IP**: https://4.213.183.139
- **Mobile Testing**: Works on iPhone Safari with HTTPS
- **Production Server**: PM2 managed, auto-restart enabled (port 3001)
- **Pre-push Hooks**: Tests, lint, and build checks before push
- **SSL Status**: Valid certificate, force HTTPS redirect, CSS loading fixed

**Note**: App uses port 3001 consistently in both dev and production. Port 3000 is reserved for Mindweave company site.

### Server Control Scripts 🎛️

The project includes convenient shell scripts for managing the development server without using npm directly.

#### Root-Level Scripts
```bash
./start_app.sh          # Start the development server on port 3001
./stop_app.sh           # Stop the development server gracefully
./restart_app.sh        # Restart the development server
./status_app.sh         # Check server status and resource usage
./logs_app.sh           # View real-time server logs (Ctrl+C to exit)
```

#### Features
- ✅ **PID Management**: Automatically saves/tracks process ID in `.app.pid`
- ✅ **Graceful Shutdown**: 5-second graceful kill, then force kill if needed
- ✅ **Log Tracking**: Automatically logs to `.app.log` file
- ✅ **Memory Monitoring**: Shows memory usage in status
- ✅ **Multiple Start Protection**: Prevents running multiple instances
- ✅ **Clean State**: Auto-removes stale PID files

#### Quick Examples
```bash
# Start server and check status
./start_app.sh
./status_app.sh

# View logs while running
./logs_app.sh

# Restart server
./restart_app.sh

# Stop when done
./stop_app.sh
```

### Secrets Management & Database

#### HashiCorp Vault Configuration

##### Initial Setup (One-time)
```bash
# Start Vault in development mode
vault server -dev

# Note the Root Token from the output (format: hvs.XXXXXXXXX)
# Example output:
# Root Token: hvs.YOUR_GENERATED_TOKEN_HERE
```

##### Development Token Management
```bash
# ✅ RECOMMENDED: Save to .env.local (auto-loaded by Next.js)
echo "VAULT_ADDR=http://127.0.0.1:8200" >> .env.local
echo "VAULT_TOKEN=[GET_FROM_VAULT_OUTPUT]" >> .env.local
echo ".env.local" >> .gitignore

# For manual Vault CLI commands only (temporary session)
export VAULT_ADDR='http://127.0.0.1:8200'
export VAULT_TOKEN='[GET_FROM_VAULT_OUTPUT]'
```

**Why NOT to use ~/.zshrc:**
- Tokens change on every Vault restart
- Requires manual updates each time
- Mixes permanent config with temporary secrets
- .env.local is automatically loaded by Next.js

##### Vault Commands
```bash
vault status                    # Check Vault status
vault kv get secret/supabase   # Get Supabase secrets
vault kv get secret/jwt        # Get JWT secrets
vault kv list secret/          # List all secrets

# Test database connection (using stored credentials)
VAULT_TOKEN='your_token' node test-db-connection.mjs

# Test Twilio messaging integration
node test-twilio-messaging.mjs
```

##### 🔐 Token Security Notes
- **Development tokens** are generated each time Vault dev server starts
- **Never commit tokens** to git repositories (GitHub secret scanning will block)
- **Tokens expire** when Vault dev server stops/restarts
- **Current dev token**: Check Vault server output for latest token (✅ SAVE LOCALLY!)
- **Production**: Use Vault auth methods (AWS IAM, Azure AD, etc.)

##### ✅ WORKING VAULT SETUP (Current)
```bash
# Get token from Vault server output when starting:
vault server -dev
# Look for: "Root Token: hvs.XXXXXXXXXX"

# Set environment variables
export VAULT_ADDR='http://127.0.0.1:8200'
export VAULT_TOKEN='[GET_FROM_VAULT_OUTPUT]'

# Restart PM2 with Vault environment
VAULT_TOKEN='[YOUR_TOKEN]' VAULT_ADDR='http://127.0.0.1:8200' pm2 restart restaurant-daily --update-env
```

#### Supabase Configuration
- **Project Name**: Restaurant Daily
- **Project ID**: hukaqbgfmerutzhtchiu
- **Project URL**: https://hukaqbgfmerutzhtchiu.supabase.co
- **Secrets Location**: Stored in Vault at `secret/supabase`

#### Local Supabase (Development) ✅ RECOMMENDED
Use local Supabase for development to avoid affecting production data.

**Start Local Supabase:**
```bash
supabase start      # Start all containers (PostgreSQL, Auth, Storage, Studio)
supabase stop       # Stop all containers
supabase status     # Check status and get URLs/keys
```

**Local URLs & Keys (auto-configured in .env.local):**
- **API URL**: http://127.0.0.1:54321
- **Studio URL**: http://127.0.0.1:54323 (Database UI)
- **Database**: postgresql://postgres:postgres@127.0.0.1:54322/postgres
- **Anon Key**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
- **Service Key**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU

**Database Commands:**
```bash
# Query database via Docker
docker exec supabase_db_restaurant-daily psql -U postgres -d postgres -c "SELECT * FROM users;"

# Reset database (rerun all migrations)
supabase db reset

# Create new migration
supabase migration new <migration_name>
```

**Switching Between Local and Cloud:**
- **Local Dev**: Uses `.env.local` environment variables (auto-configured)
- **Production**: Uses Vault secrets (no .env.local on server)
- The app automatically uses environment variables when Vault is unavailable

#### Database Schema Planning
- **Users**: Phone-based authentication with roles (admin/team)
- **Cash Sessions**: Opening/closing balance tracking
- **Petty Vouchers**: Expense tracking with categories
- **Electricity Payments**: Payment monitoring and history
- **Audit Logs**: Full activity tracking for compliance

#### Hybrid Secrets Management
**Production**: All secrets stored in Vault for security
**Development**: Vault-first with .env.local fallback

**Current Vault Secrets**:
```bash
# Supabase credentials (production secrets)
vault kv get secret/supabase
# Contains: url, anon_key, service_role_key, database_url

# JWT secrets for authentication
vault kv get secret/jwt
# Contains: access_token_secret

# SMS/WhatsApp credentials
vault kv get secret/sms
# Contains: twilio credentials
```

**Environment Configuration**:
- **Vault-first**: System tries Vault secrets first
- **Fallback**: Uses .env.local only when Vault unavailable
- **Production**: Remove .env.local fallbacks for security

### 📱 Twilio SMS Integration (Production Ready)

#### Current Status: ✅ FULLY WORKING (2026-03-04)
- **SMS Number**: `+14155238886` (Twilio)
- **Account SID**: Stored securely in Vault `secret/sms` ✅ ACTIVE
- **Auth Token**: Stored securely in Vault `secret/sms` ✅ WORKING
- **Delivery Method**: SMS-only
- **Cost**: ~₹0.50/message (SMS)
- **Coverage**: Global (perfect for Indian restaurant market)
- **Status**: Real phone numbers receiving SMS messages ✅

#### Quick Test Commands
```bash
# Test SMS OTP delivery
curl -X POST https://restaurant-daily.mindweave.tech/api/auth/request-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+918826175074", "preferredMethod": "sms"}'

# Run full integration test suite
node test-twilio-messaging.mjs

# Check Twilio connection
curl -X POST https://restaurant-daily.mindweave.tech/api/auth/test-messaging \
  -H "Content-Type: application/json" \
  -d '{"testType": "connection"}'
```

#### Vault Configuration
```bash
# Twilio credentials (store securely in Vault - NEVER commit actual keys!)
vault kv put secret/sms \
  provider="twilio" \
  account_sid="[YOUR_TWILIO_ACCOUNT_SID]" \
  twilio_auth_token="[YOUR_TWILIO_AUTH_TOKEN]" \
  from_number="+14155238886" \
  whatsapp_number="whatsapp:+14155238886" \
  content_sid="HXb5b62575e6e4ff6129ad7c8efe1f983e" \
  webhook_url="https://restaurant-daily.mindweave.tech/api/sms/webhook"

# OTP configuration
vault kv put secret/otp \
  length="6" \
  expiry_minutes="5" \
  max_attempts="3" \
  rate_limit_per_hour="3" \
  cleanup_interval_hours="24"
```

#### API Endpoints
- **Request OTP**: `POST /api/auth/request-otp`
- **Verify OTP**: `POST /api/auth/verify-otp`
- **Resend OTP**: `POST /api/auth/resend-otp`
- **Test Messaging**: `POST /api/auth/test-messaging`

#### Integration Features
- ✅ Phone number validation (E.164 format)
- ✅ SMS message delivery
- ✅ Rate limiting (3 OTPs per hour)
- ✅ OTP expiration (5 minutes)
- ✅ Comprehensive error handling
- ✅ Audit logging
- ✅ Production-ready security

### 🔧 CURRENT WORKING SETUP SUMMARY (2025-09-19)

#### ✅ All Systems Operational
- **Production App**: PM2 managed, auto-restart enabled
- **Vault Server**: Development mode, all secrets configured
- **Twilio Integration**: Real SMS messages working
- **Authentication Flow**: Complete phone → OTP → login
- **Database**: Supabase PostgreSQL with RLS deployed

#### Authentication Flow
✅ **Phone-based OTP**: All users authenticate via phone with SMS OTP
✅ **Role Selection**: All users go through role selection to set up their account
✅ **Secure Tokens**: JWT tokens issued after OTP verification
✅ **Session Management**: Token stored in localStorage, cleared on logout

#### Critical Commands for Restart
```bash
# 1. Start Vault (get new token from output)
vault server -dev
# Look for: "Root Token: hvs.XXXXXXXXXX"

# 2. Update .env.local with new token (one file to manage)
echo "VAULT_ADDR=http://127.0.0.1:8200" > .env.local
echo "VAULT_TOKEN=[PASTE_TOKEN_FROM_STEP_1]" >> .env.local

# 3. All secrets are configured in Vault ✅
export VAULT_ADDR='http://127.0.0.1:8200'
export VAULT_TOKEN='[YOUR_TOKEN]'
vault kv list secret/  # Shows: jwt, otp, sms, supabase

# 4. Restart dev server (reads .env.local automatically)
npm run dev

# 5. Or restart production with Vault environment
VAULT_TOKEN='[YOUR_TOKEN]' VAULT_ADDR='http://127.0.0.1:8200' pm2 restart restaurant-daily --update-env
```

#### 📋 Quick Setup Commands:
```bash
# Start Vault dev server
vault server -dev  # Note the Root Token from output

# Configure all secrets (replace token with actual value)
export VAULT_ADDR='http://127.0.0.1:8200'
export VAULT_TOKEN='[YOUR_VAULT_TOKEN]'
vault kv put secret/supabase url="https://hukaqbgfmerutzhtchiu.supabase.co" anon_key="[KEY]" service_role_key="[KEY]"
vault kv put secret/jwt access_token_secret="[SECRET]"
vault kv put secret/sms provider="twilio" account_sid="[SID]" twilio_auth_token="[TOKEN]" from_number="+14155238886" whatsapp_number="whatsapp:+14155238886"
vault kv put secret/otp length="6" expiry_minutes="5" max_attempts="3" rate_limit_per_hour="3" cleanup_interval_hours="24"
```

#### Architecture Notes
- **Secrets**: Never commit to git, always use Vault
- **Tokens**: Regenerate on each Vault restart
- **Testing**: Use test phone numbers with real Twilio OTP flow
- **Production**: Real Twilio credentials in Vault only