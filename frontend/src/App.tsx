import { Routes, Route, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Layout } from './components/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { ProductsPage } from './pages/ProductsPage';
import { StoragePage } from './pages/StoragePage';
import { SiteDetailPage } from './pages/SiteDetailPage';
import { ZoneDetailPage } from './pages/ZoneDetailPage';
import { MovementsPage } from './pages/MovementsPage';
import { AlertsPage } from './pages/AlertsPage';
import { SuppliersPage } from './pages/SuppliersPage';
import { ClientsPage } from './pages/ClientsPage';
import { SettingsPage } from './pages/SettingsPage';
import { UsersPage } from './pages/UsersPage';
import { LicensePage } from './pages/LicensePage';
import { LicenseActivationPage } from './pages/LicenseActivationPage';
import { LoginPage } from './pages/LoginPage';
import { useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { I18nProvider } from './contexts/I18nContext';
import api from './services/api';

function App() {
  const { isAuthenticated } = useAuth();

  // Public license check — no auth required
  const { data: licenseStatus, isLoading: checkingLicense } = useQuery<{ active: boolean }>({
    queryKey: ['license-status'],
    queryFn: () => api.get('/licensing/status').then((r) => r.data),
    staleTime: 60_000,
    retry: false,
  });

  // Loading license check
  if (checkingLicense) {
    return (
      <I18nProvider>
        <ThemeProvider>
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          </div>
        </ThemeProvider>
      </I18nProvider>
    );
  }

  // No active license → force activation
  if (!licenseStatus?.active) {
    return (
      <I18nProvider>
        <ThemeProvider>
          <Routes>
            <Route path="*" element={<LicenseActivationPage />} />
          </Routes>
        </ThemeProvider>
      </I18nProvider>
    );
  }

  if (!isAuthenticated) {
    return (
      <I18nProvider>
        <ThemeProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </ThemeProvider>
      </I18nProvider>
    );
  }

  return (
    <I18nProvider>
      <ThemeProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/storage" element={<StoragePage />} />
            <Route path="/storage/:siteId" element={<SiteDetailPage />} />
            <Route path="/storage/:siteId/zones/:zoneId" element={<ZoneDetailPage />} />
            <Route path="/movements" element={<MovementsPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/suppliers" element={<SuppliersPage />} />
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/licensing" element={<LicensePage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ThemeProvider>
    </I18nProvider>
  );
}

export default App;
