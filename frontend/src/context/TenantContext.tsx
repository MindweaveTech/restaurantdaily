import { createContext, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from 'react-oidc-context';
import { getTenantFromToken, getRoleFromToken, mapTenantToDatabase } from '../config/auth';

interface TenantContextType {
  tenant: string | null;
  database: string;
  displayName: string;
  role: string | null;
  isSuperAdmin: boolean;
  isTenantOwner: boolean;
  isTenantStaff: boolean;
}

const TenantContext = createContext<TenantContextType | null>(null);

const TENANT_DISPLAY_NAMES: Record<string, string> = {
  'gr-kitchens': 'GR Kitchens',
  // Add more tenants as they're onboarded
};

export function TenantProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();

  const value = useMemo(() => {
    const profile = auth.user?.profile as Record<string, unknown> | undefined;
    const tenant = getTenantFromToken(profile);
    const role = getRoleFromToken(profile);

    return {
      tenant,
      database: tenant ? mapTenantToDatabase(tenant) : 'restaurantdaily',
      displayName: tenant ? (TENANT_DISPLAY_NAMES[tenant] || tenant) : 'Restaurant Daily',
      role,
      isSuperAdmin: role === 'super-admin',
      isTenantOwner: role === 'tenant-owner',
      isTenantStaff: role === 'tenant-staff',
    };
  }, [auth.user?.profile]);

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant(): TenantContextType {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}
