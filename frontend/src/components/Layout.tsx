import { Outlet, NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Warehouse,
  ArrowLeftRight,
  Bell,
  Truck,
  Users,
  ShieldCheck,
  KeyRound,
  Settings,
  LogOut,
  Menu,
  X,
  Search,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useI18n } from '../contexts/I18nContext';
import { GlobalSearch } from './GlobalSearch';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import type { Site, Alert } from '../types';

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const { t } = useI18n();
  const isDark = theme.sidebarStyle === 'dark';

  const { data: sites } = useQuery<Site[]>({
    queryKey: ['sites'],
    queryFn: () => api.get('/sites').then((r) => r.data),
  });

  const { data: alerts } = useQuery<Alert[]>({
    queryKey: ['alerts'],
    queryFn: () => api.get('/alerts').then((r) => r.data),
    refetchInterval: 30000,
  });
  const alertCount = alerts?.filter((a) => a.status === 'TRIGGERED').length ?? 0;

  const navItems = [
    { to: '/', label: t.nav.dashboard, icon: LayoutDashboard },
    { to: '/products', label: t.nav.products, icon: Package },
    { to: '/storage', label: t.nav.storage, icon: Warehouse },
    { to: '/movements', label: t.nav.movements, icon: ArrowLeftRight },
    { to: '/alerts', label: t.nav.alerts, icon: Bell },
    { to: '/suppliers', label: t.nav.suppliers, icon: Truck },
    { to: '/clients', label: t.nav.clients, icon: Users },
    ...(user?.role === 'ADMIN' || user?.role === 'MANAGER' ? [{ to: '/users', label: t.nav.users, icon: ShieldCheck }] : []),
    ...(user?.role === 'ADMIN' ? [{ to: '/licensing', label: t.nav.license, icon: KeyRound }] : []),
    { to: '/settings', label: t.nav.settings, icon: Settings },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Sidebar mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform transition-transform lg:translate-x-0 lg:static lg:z-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isDark ? 'bg-gray-900 border-r border-gray-800' : 'bg-white border-r border-gray-200'}`}
      >
        <div className={`flex items-center justify-between h-16 px-6 ${isDark ? 'border-b border-gray-800' : 'border-b border-gray-200'}`}>
          <div className="flex items-center gap-2 min-w-0">
            {theme.logoUrl && <img src={theme.logoUrl} alt="" className="w-8 h-8 rounded object-contain" />}
            <h1 className={`text-xl font-bold truncate ${isDark ? 'text-white' : 'text-primary-700'}`}>{theme.appName}</h1>
          </div>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : ''}`} />
          </button>
        </div>
        <nav className="mt-4 px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? isDark ? 'bg-primary-900 text-primary-300' : 'bg-primary-50 text-primary-700'
                    : isDark ? 'text-gray-400 hover:bg-gray-800 hover:text-gray-200' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className={`absolute bottom-0 left-0 right-0 p-4 ${isDark ? 'border-t border-gray-800' : 'border-t border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${isDark ? 'bg-primary-900 text-primary-300' : 'bg-primary-100 text-primary-700'}`}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium truncate ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>{user?.name}</p>
              <p className={`text-xs truncate ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{user?.role}</p>
            </div>
            <button onClick={logout} className={`${isDark ? 'text-gray-500 hover:text-red-400' : 'text-gray-400 hover:text-red-500'}`} title={t.nav.logout}>
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center gap-4 px-4 lg:px-8">
          <button className="lg:hidden flex-shrink-0" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-6 h-6 text-gray-600" />
          </button>
          <div className="flex-shrink-0">
            <select className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
              <option value="">{t.nav.allSites}</option>
              {sites?.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 hidden sm:flex justify-center">
            <GlobalSearch />
          </div>
          <button className="sm:hidden flex-shrink-0 text-gray-500 hover:text-gray-700" onClick={() => setMobileSearchOpen(!mobileSearchOpen)}>
            <Search className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 flex-shrink-0 ms-auto">
            <NavLink to="/alerts" className="relative text-gray-500 hover:text-gray-700">
              <Bell className="w-5 h-5" />
              {alertCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {alertCount > 9 ? '9+' : alertCount}
                </span>
              )}
            </NavLink>
          </div>
        </header>

        {/* Mobile search bar */}
        {mobileSearchOpen && (
          <div className="sm:hidden px-4 py-2 bg-white border-b border-gray-200">
            <GlobalSearch />
          </div>
        )}

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
