import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from 'react-oidc-context';
import { useEffect } from 'react';
import { getOidcConfig } from './config/auth';
import { TenantProvider, useTenant } from './context/TenantContext';
import { setTenant } from './api/odoo';
import ProtectedRoute from './components/ProtectedRoute';

// Tenant Layout & Pages
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Sales from './pages/Sales';
import Expenses from './pages/Expenses';
import Staff from './pages/Staff';

// Admin Layout & Pages
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import Tenants from './pages/admin/Tenants';
import Usage from './pages/admin/Usage';
import Billing from './pages/admin/Billing';
import Communications from './pages/admin/Communications';

// Component to sync tenant with API client
function TenantSync({ children }: { children: React.ReactNode }) {
  const { database } = useTenant();

  useEffect(() => {
    setTenant(database);
  }, [database]);

  return <>{children}</>;
}

// Role-based routing
function AppRoutes() {
  const { isSuperAdmin } = useTenant();

  // Super Admin sees admin portal
  if (isSuperAdmin) {
    return (
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="tenants" element={<Tenants />} />
          <Route path="usage" element={<Usage />} />
          <Route path="billing" element={<Billing />} />
          <Route path="comms" element={<Communications />} />
        </Route>
        {/* Redirect any other path to admin dashboard */}
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    );
  }

  // Tenant users see tenant portal
  return (
    <TenantSync>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="sales" element={<Sales />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="staff" element={<Staff />} />
        </Route>
        {/* Redirect any other path to tenant dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </TenantSync>
  );
}

function App() {
  const oidcConfig = getOidcConfig();

  return (
    <AuthProvider {...oidcConfig}>
      <BrowserRouter>
        <TenantProvider>
          <ProtectedRoute>
            <AppRoutes />
          </ProtectedRoute>
        </TenantProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
