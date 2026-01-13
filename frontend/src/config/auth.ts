import type { AuthProviderProps } from 'react-oidc-context';

const KEYCLOAK_BASE_URL = 'https://auth.mindweave.tech/keycloak';
const REALM = 'restaurantdaily';
const CLIENT_ID = 'restaurantdaily-frontend';

export function getOidcConfig(): AuthProviderProps {
  const authority = `${KEYCLOAK_BASE_URL}/realms/${REALM}`;

  return {
    authority,
    client_id: CLIENT_ID,
    redirect_uri: window.location.origin + '/',
    post_logout_redirect_uri: window.location.origin + '/',
    scope: 'openid profile email',
    automaticSilentRenew: true,
    onSigninCallback: () => {
      // Remove code and state from URL after login
      window.history.replaceState({}, document.title, window.location.pathname);
    },
  };
}

// Extract tenant_id from user's token
export function getTenantFromToken(profile: Record<string, unknown> | undefined): string | null {
  if (!profile) return null;

  // First try direct tenant_id claim
  if (profile.tenant_id) {
    return profile.tenant_id as string;
  }

  // Fall back to parsing groups: ["/tenants/gr-kitchens/owners"]
  const groups = profile.groups as string[] | undefined;
  if (groups && groups.length > 0) {
    const tenantGroup = groups.find(g => g.startsWith('/tenants/'));
    if (tenantGroup) {
      const parts = tenantGroup.split('/');
      return parts[2] || null; // /tenants/{tenant-slug}/...
    }
  }

  return null;
}

// Get user's role from token
export function getRoleFromToken(profile: Record<string, unknown> | undefined): string | null {
  if (!profile) return null;

  const roles = profile.roles as string[] | undefined;
  if (roles) {
    if (roles.includes('super-admin')) return 'super-admin';
    if (roles.includes('tenant-owner')) return 'tenant-owner';
    if (roles.includes('tenant-staff')) return 'tenant-staff';
  }

  return null;
}

export function getTenantFromPath(): string {
  const path = window.location.pathname;
  const parts = path.split('/').filter(Boolean);
  return parts[0] || 'gr-kitchens';
}

export function mapTenantToDatabase(tenant: string): string {
  // Map tenant slug to Odoo database name
  const mapping: Record<string, string> = {
    'gr-kitchens': 'restaurantdaily',
    // Add more tenants as needed
  };
  return mapping[tenant] || tenant;
}
