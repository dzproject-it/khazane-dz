import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Package, ArrowLeftRight, AlertTriangle, TrendingUp } from 'lucide-react';
import api from '../services/api';
import { CreateMovementModal } from '../components/CreateMovementModal';
import { useI18n } from '../contexts/I18nContext';
import type { MovementType, StockMovement } from '../types';

const typeBadge: Record<MovementType, string> = {
  IN: 'bg-green-100 text-green-700',
  OUT: 'bg-red-100 text-red-700',
  TRANSFER: 'bg-blue-100 text-blue-700',
  ADJUSTMENT: 'bg-gray-100 text-gray-700',
};

export function DashboardPage() {
  const [movementType, setMovementType] = useState<MovementType>('IN');
  const [showMovement, setShowMovement] = useState(false);
  const { t, locale } = useI18n();

  const { data: productCount } = useQuery<{ data: unknown[]; total: number }>({
    queryKey: ['dashboard-products'],
    queryFn: () => api.get('/products', { params: { per_page: 1 } }).then((r) => r.data),
  });

  const { data: alertsData } = useQuery<unknown[]>({
    queryKey: ['dashboard-alerts'],
    queryFn: () => api.get('/alerts', { params: { status: 'TRIGGERED' } }).then((r) => r.data),
  });

  const { data: movementsData } = useQuery<{ data: StockMovement[] }>({
    queryKey: ['dashboard-movements'],
    queryFn: () => api.get('/movements', { params: { per_page: 10 } }).then((r) => r.data),
  });

  function openMovement(type: MovementType) {
    setMovementType(type);
    setShowMovement(true);
  }

  const stats = [
    { label: t.dashboard.activeProducts, value: productCount?.total ?? '—', icon: Package, color: 'bg-blue-50 text-blue-600' },
    { label: t.dashboard.recentMovements, value: movementsData?.data?.length ?? '—', icon: ArrowLeftRight, color: 'bg-green-50 text-green-600' },
    { label: t.dashboard.activeAlerts, value: alertsData?.length ?? '—', icon: AlertTriangle, color: 'bg-red-50 text-red-600' },
    { label: t.dashboard.totalOps, value: '—', icon: TrendingUp, color: 'bg-purple-50 text-purple-600' },
  ];

  const dateLocale = locale === 'ar' ? 'ar-DZ' : locale === 'en' ? 'en-GB' : 'fr-DZ';

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">{t.dashboard.title}</h2>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{String(stat.value)}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.dashboard.quickActions}</h3>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => openMovement('IN')} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium">
            {t.dashboard.stockIn}
          </button>
          <button onClick={() => openMovement('OUT')} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium">
            {t.dashboard.stockOut}
          </button>
          <button onClick={() => openMovement('TRANSFER')} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
            {t.dashboard.transfer}
          </button>
          <button onClick={() => openMovement('ADJUSTMENT')} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium">
            {t.dashboard.adjustment}
          </button>
        </div>
      </div>

      {/* Recent movements */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 pb-4">
          <h3 className="text-lg font-semibold text-gray-900">{t.dashboard.lastMovements}</h3>
        </div>
        {movementsData?.data?.length ? (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-y border-gray-200">
              <tr>
                <th className="text-left px-4 py-2.5 font-medium text-gray-600">{t.movements.ref}</th>
                <th className="text-left px-4 py-2.5 font-medium text-gray-600">{t.movements.type}</th>
                <th className="text-left px-4 py-2.5 font-medium text-gray-600">{t.movements.product}</th>
                <th className="text-right px-4 py-2.5 font-medium text-gray-600">{t.movements.quantity}</th>
                <th className="text-left px-4 py-2.5 font-medium text-gray-600">{t.movements.date}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {movementsData.data.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5 font-mono text-xs">{m.reference}</td>
                  <td className="px-4 py-2.5">
                    <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${typeBadge[m.type]}`}>
                      {t.movements.typeLabels[m.type]}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">{m.product?.name ?? '—'}</td>
                  <td className="px-4 py-2.5 text-right font-medium">{m.quantity}</td>
                  <td className="px-4 py-2.5 text-gray-500">{new Date(m.createdAt).toLocaleString(dateLocale)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="px-6 pb-6 text-gray-500 text-sm">{t.dashboard.noMovements}</p>
        )}
      </div>

      <CreateMovementModal open={showMovement} onClose={() => setShowMovement(false)} defaultType={movementType} />
    </div>
  );
}
