# Restaurant Daily

Multi-tenant restaurant management SaaS platform built with React + Vite frontend, Odoo 17 CE backend, and Keycloak authentication.

**GitHub**: https://github.com/MindweaveTech/restaurantdaily
**Production**: https://restaurantdaily.mindweave.tech

## Project Structure

```
RestaurantDaily/
├── frontend/                    # Vite + React + TypeScript
│   ├── src/
│   │   ├── api/odoo.ts         # JSON-RPC client for Odoo
│   │   ├── components/
│   │   │   ├── Layout.tsx      # Tenant portal sidebar (blue)
│   │   │   ├── AdminLayout.tsx # Admin portal sidebar (violet)
│   │   │   └── ProtectedRoute.tsx
│   │   ├── config/auth.ts      # Keycloak OIDC + token helpers
│   │   ├── context/TenantContext.tsx  # Role & tenant state
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx   # Tenant dashboard
│   │   │   ├── Sales.tsx
│   │   │   ├── Expenses.tsx
│   │   │   ├── Staff.tsx
│   │   │   └── admin/          # Super admin pages
│   │   │       ├── AdminDashboard.tsx
│   │   │       ├── Tenants.tsx
│   │   │       ├── Usage.tsx
│   │   │       ├── Billing.tsx
│   │   │       └── Communications.tsx
│   │   └── App.tsx             # Role-based routing
│   └── vite.config.ts
├── addons/rd_import/           # Odoo 17 CE custom module
├── tenants/gr-kitchens/        # Tenant data parsers & imports
├── docker-compose.yml          # Local Odoo + PostgreSQL
└── odoo.conf
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Vite + React 19 + TypeScript + Tailwind CSS + Recharts |
| Backend | Odoo 17 CE (headless JSON-RPC) |
| Auth | Keycloak (single realm, group-based multi-tenancy) |
| Database | PostgreSQL |

## Multi-Tenant Authentication

### Architecture

Single Keycloak realm (`restaurantdaily`) with tenant isolation via groups:

```
Realm: restaurantdaily
├── Client: restaurantdaily-frontend (public, PKCE)
├── Roles: super-admin, tenant-owner, tenant-staff
├── Groups:
│   └── tenants/
│       └── gr-kitchens/
│           ├── owners/
│           └── staff/
└── Token Mappers: tenant_id, groups, roles
```

### Role-Based Routing

| Role | Portal | Routes |
|------|--------|--------|
| super-admin | Admin (violet) | /admin/* |
| tenant-owner | Tenant (blue) | /* |
| tenant-staff | Tenant (blue) | /* |

### Auth Flow

1. User visits app → redirected to Keycloak login
2. After login, JWT contains: `tenant_id`, `groups`, `roles`
3. App extracts role from token
4. Super admins → `/admin/` portal
5. Tenant users → `/` tenant portal

### Test Users

| Username | Password | Role | Tenant |
|----------|----------|------|--------|
| admin | admin123 (temp) | super-admin | - |
| owner.grkitchens | owner123 (temp) | tenant-owner | gr-kitchens |

## Quick Start

### Development

```bash
# Terminal 1: Start Odoo backend
cd /Users/grao/Projects/MindWeave/RestaurantDaily
docker-compose up -d
# Odoo: http://localhost:8010

# Terminal 2: Start frontend
cd frontend
npm install
npm run dev
# Frontend: http://localhost:5173
```

### Build & Deploy

```bash
# Build frontend
cd frontend && npm run build

# Deploy to server
rsync -avz --delete frontend/dist/ mindweavehq:/home/grao/Projects/RestaurantDaily/frontend/dist/

# Restart container
ssh mindweavehq "cd /home/grao/Projects/RestaurantDaily && docker compose restart"
```

## Server Deployment

**Server**: mindweavehq (`141.148.212.116`)

| Service | Port | Container |
|---------|------|-----------|
| Frontend App | 3010 | restaurantdaily-app |
| Landing Page | 8010 | restaurantdaily-landing |

### Server Paths

- **Project**: `/home/grao/Projects/RestaurantDaily/`
- **Frontend dist**: `/home/grao/Projects/RestaurantDaily/frontend/dist/`
- **Nginx config**: `/home/grao/Developer/nginx-configs/restaurantdaily.mindweave.tech`

## Keycloak Management

Use scripts in `/Users/grao/Projects/MindWeave/Keycloak/scripts/`:

```bash
# Add new tenant
./add-tenant.sh restaurantdaily pizza-palace "Pizza Palace"

# Add user to tenant
./add-user.sh restaurantdaily owner@pizza.com "John Pizza" pizza-palace owner
```

## Odoo Configuration

- **Local URL**: http://localhost:8010
- **Database**: restaurantdaily
- **Admin**: admin / admin

### Custom Models (rd_import)

| Model | Purpose |
|-------|---------|
| rd.daily.sales | Daily sales by channel |
| rd.expense | Petty cash vouchers |
| rd.employee | Staff directory |
| rd.attendance | Monthly attendance |
| rd.ingredient | Ingredient master |

## Key Files

| File | Purpose |
|------|---------|
| `src/config/auth.ts` | Keycloak config, token helpers |
| `src/context/TenantContext.tsx` | Role flags, tenant state |
| `src/App.tsx` | Role-based routing logic |
| `src/components/AdminLayout.tsx` | Super admin sidebar |
| `src/components/Layout.tsx` | Tenant user sidebar |
| `src/api/odoo.ts` | Odoo JSON-RPC client |

## Adding a New Tenant

1. **Keycloak**: `./add-tenant.sh restaurantdaily <slug> "<Name>"`
2. **User**: `./add-user.sh restaurantdaily <email> "<Name>" <slug> owner`
3. **Frontend** (optional): Add display name mapping in `TenantContext.tsx`
4. **Data**: Create `tenants/<slug>/` with import scripts if needed

## Development Notes

- Frontend uses `verbatimModuleSyntax` - use `import type` for type-only imports
- Vite proxy handles CORS for local Odoo JSON-RPC calls
- Super admin has no tenant_id (null) - sees admin portal
- Tenant users have tenant_id from JWT - see tenant portal
