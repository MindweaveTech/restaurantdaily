# Restaurant Daily

Multi-tenant restaurant management SaaS platform built on headless Odoo with a custom React frontend and Keycloak authentication.

## Project Structure

```
RestaurantDaily/
├── frontend/                    # Vite + React + TypeScript dashboard
│   ├── src/
│   │   ├── api/odoo.ts         # JSON-RPC client for Odoo
│   │   ├── components/
│   │   │   ├── Layout.tsx      # Sidebar with user info & logout
│   │   │   └── ProtectedRoute.tsx  # Auth guard component
│   │   ├── config/
│   │   │   └── auth.ts         # Keycloak OIDC configuration
│   │   ├── context/
│   │   │   └── TenantContext.tsx   # Tenant state management
│   │   ├── pages/              # Dashboard, Sales, Expenses, Staff
│   │   └── App.tsx             # Tenant-aware routing
│   └── vite.config.ts          # Proxy to Odoo backend
├── addons/                      # Odoo 17 CE modules
│   └── rd_import/              # Restaurant Daily data models
├── tenants/                     # Tenant-specific data and configs
│   └── gr-kitchens/            # GR Kitchens (Burger Singh franchise)
│       ├── data/               # Parsed JSON data
│       ├── parsers/            # Excel sheet parsers
│       ├── import_pipeline.py  # Data import script
│       ├── odoo_import.py      # Odoo XML-RPC importer
│       └── credentials/        # Google Drive service account
├── docker-compose.yml          # Odoo + PostgreSQL
├── odoo.conf                   # Odoo configuration
└── MVP_SCOPE.md                # Product roadmap
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Vite + React + TypeScript + Tailwind CSS + Recharts |
| Backend | Odoo 17 CE (headless, JSON-RPC API) |
| Auth | Keycloak (OIDC + PKCE, realm per tenant) |
| Database | PostgreSQL (via Odoo) |
| Infrastructure | Docker Compose |

## Multi-Tenant Authentication

### Architecture

```
┌─────────────────┐     ┌──────────────────────────┐     ┌─────────────┐
│   React App     │────▶│  auth.mindweave.tech     │────▶│   Odoo      │
│  (frontend)     │     │  /keycloak               │     │  (backend)  │
│                 │◀────│  realm: gr-kitchens      │     │             │
└─────────────────┘     └──────────────────────────┘     └─────────────┘
```

### URL Structure

```
http://localhost:5173/gr-kitchens/          → Dashboard for GR Kitchens
http://localhost:5173/gr-kitchens/sales     → Sales page
http://localhost:5173/gr-kitchens/expenses  → Expenses page
http://localhost:5173/gr-kitchens/staff     → Staff page
```

### Auth Flow

1. User navigates to `/:tenant/`
2. App extracts tenant from URL
3. App checks auth with Keycloak realm matching tenant
4. If not authenticated → redirect to Keycloak login
5. User logs in → redirect back with authorization code
6. App exchanges code for tokens (PKCE)
7. API calls include `Authorization: Bearer <token>` header

### Keycloak Configuration

- **Admin Console**: https://auth.mindweave.tech/keycloak/admin/
- **Admin Credentials**: `admin` / `admin_change_me_immediately`
- **Client ID**: `restaurantdaily-frontend`
- **Realm per tenant**: `gr-kitchens`, etc.

#### Setting Up a New Tenant Realm

1. Login to Keycloak admin console
2. Create realm with tenant name (e.g., `gr-kitchens`)
3. Create client `restaurantdaily-frontend`:
   - Client authentication: OFF (public client)
   - PKCE: S256
   - Valid redirect URIs: `http://localhost:5173/*`, `https://restaurantdaily.mindweave.tech/*`
   - Web origins: `http://localhost:5173`, `https://restaurantdaily.mindweave.tech`
4. Create users in the realm

## Quick Start

### Start Odoo Backend

```bash
cd /Users/grao/Projects/MindWeave/RestaurantDaily
docker-compose up -d
# Odoo runs at http://localhost:8010
```

### Start Frontend

```bash
cd /Users/grao/Projects/MindWeave/RestaurantDaily/frontend
npm install
npm run dev
# Frontend runs at http://localhost:5173
# Navigate to http://localhost:5173/gr-kitchens/
```

### Import Tenant Data (GR Kitchens)

```bash
cd /Users/grao/Projects/MindWeave/RestaurantDaily/tenants/gr-kitchens
source venv/bin/activate

# Import from Google Drive
python import_pipeline.py

# Import to Odoo
python odoo_import.py
```

## Odoo Configuration

- **URL**: http://localhost:8010
- **Database**: restaurantdaily
- **Admin**: admin / admin

### Custom Models (rd_import module)

| Model | Purpose |
|-------|---------|
| rd.daily.sales | Daily sales by channel (delivery, dine-in, takeaway) |
| rd.expense | Petty cash vouchers (PCV) |
| rd.employee | Staff directory |
| rd.attendance | Monthly attendance records |
| rd.ingredient | Ingredient/product master |
| rd.ingredient.price | Price history |

## Frontend API

The frontend connects to Odoo via JSON-RPC proxy at `/jsonrpc`. Key functions in `src/api/odoo.ts`:

```typescript
// Set tenant database
setTenant('restaurantdaily');

// Set access token from Keycloak
setAccessToken(auth.user?.access_token);

// Fetch data
const sales = await getSales(100, 'date desc');
const expenses = await getExpenses(500);
const employees = await getEmployees();
```

### Key Frontend Files

| File | Purpose |
|------|---------|
| `src/config/auth.ts` | Keycloak OIDC configuration |
| `src/context/TenantContext.tsx` | Tenant slug → database mapping |
| `src/components/ProtectedRoute.tsx` | Auth guard, login UI |
| `src/components/Layout.tsx` | Sidebar, user profile, logout |
| `src/api/odoo.ts` | Multi-tenant Odoo JSON-RPC client |

## Adding a New Tenant

1. **Keycloak**: Create realm with tenant slug
2. **Frontend config**: Add mapping in `src/config/auth.ts`:
   ```typescript
   // mapTenantToDatabase()
   'new-tenant': 'odoo_database_name',
   ```
3. **TenantContext**: Add display name in `src/context/TenantContext.tsx`:
   ```typescript
   'new-tenant': 'New Tenant Display Name',
   ```
4. **Data**: Create `tenants/<tenant-name>/` with import scripts
5. **Import**: Run import pipeline for tenant data

## Deployment

**Target**: `restaurantdaily.mindweave.tech`
**Ports**:
- 8010: Odoo backend
- 3000: Frontend production

See parent CLAUDE.md for server deployment details.

## Development Notes

- Frontend uses `verbatimModuleSyntax` - use `import type` for type-only imports
- Vite proxy handles CORS for Odoo JSON-RPC calls
- Odoo Apps/Settings menus hidden via `hide_menus.xml`
- Navigation uses relative paths (empty string for index route with `end` prop)
- Recharts formatters should handle `undefined` values: `Number(value) || 0`
