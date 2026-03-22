import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import api from '../services/api';
import { useI18n } from '../contexts/I18nContext';
import type { Alert } from '../types';

type AlertStatus = 'TRIGGERED' | 'ACKNOWLEDGED' | 'RESOLVED';

const statusStyle: Record<AlertStatus, { color: string; icon: typeof AlertTriangle }> = {
  TRIGGERED: { color: 'bg-red-100 text-red-700', icon: AlertTriangle },
  ACKNOWLEDGED: { color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  RESOLVED: { color: 'bg-green-100 text-green-700', icon: CheckCircle },
};

export function AlertsPage() {
  const { data: alerts, isLoading } = useQuery<Alert[]>({
    queryKey: ['alerts'],
    queryFn: () => api.get('/alerts').then((r) => r.data),
  });
  const { t, locale } = useI18n();
  const dateLocale = locale === 'ar' ? 'ar-DZ' : locale === 'en' ? 'en-GB' : 'fr-FR';

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">{t.alerts.title}</h2>

      {isLoading ? (
        <p className="text-gray-500">{t.alerts.loading}</p>
      ) : alerts?.length ? (
        <div className="space-y-3">
          {alerts.map((alert) => {
            const conf = statusStyle[alert.status as AlertStatus];
            return (
              <div key={alert.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${conf.color}`}>
                  <conf.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {alert.threshold?.product?.name || 'Produit'} — {t.alerts.stock} {alert.currentQty}
                  </p>
                  <p className="text-sm text-gray-500">
                    {t.alerts.minThreshold} {alert.threshold?.minQuantity} | {t.alerts.safety} {alert.threshold?.safetyQuantity}
                    {alert.threshold?.site && ` | ${t.alerts.site} ${alert.threshold.site.name}`}
                  </p>
                </div>
                <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${conf.color}`}>
                  {t.alerts.statusLabels[alert.status as AlertStatus]}
                </span>
                <p className="text-xs text-gray-400">{new Date(alert.triggeredAt).toLocaleString(dateLocale)}</p>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <p className="text-gray-600">{t.alerts.noAlerts}</p>
        </div>
      )}
    </div>
  );
}
