import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowDownToLine, ArrowUpFromLine, ArrowLeftRight, SlidersHorizontal, FileText } from 'lucide-react';
import api from '../services/api';
import { CreateMovementModal } from '../components/CreateMovementModal';
import { StockExitVoucher } from '../components/StockExitVoucher';
import { useI18n } from '../contexts/I18nContext';
import type { StockMovement, PaginatedResponse, MovementType } from '../types';

const typeStyle: Record<MovementType, { color: string; icon: typeof ArrowDownToLine }> = {
  IN: { color: 'bg-green-100 text-green-700', icon: ArrowDownToLine },
  OUT: { color: 'bg-red-100 text-red-700', icon: ArrowUpFromLine },
  TRANSFER: { color: 'bg-blue-100 text-blue-700', icon: ArrowLeftRight },
  ADJUSTMENT: { color: 'bg-yellow-100 text-yellow-700', icon: SlidersHorizontal },
};

export function MovementsPage() {
  const [page] = useState(1);
  const [movementType, setMovementType] = useState<MovementType>('IN');
  const [showCreate, setShowCreate] = useState(false);
  const [showVoucher, setShowVoucher] = useState(false);
  const { t, locale } = useI18n();

  function openCreate(type: MovementType) {
    setMovementType(type);
    setShowCreate(true);
  }

  const { data, isLoading } = useQuery<PaginatedResponse<StockMovement>>({
    queryKey: ['movements', page],
    queryFn: () => api.get('/movements', { params: { page, per_page: 20 } }).then((r) => r.data),
  });

  const dateLocale = locale === 'ar' ? 'ar-DZ' : locale === 'en' ? 'en-GB' : 'fr-FR';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{t.movements.title}</h2>
        <div className="flex gap-2">
          <button onClick={() => setShowVoucher(true)} className="flex items-center gap-1.5 px-4 py-2 text-sm bg-gray-700 text-white rounded-lg hover:bg-gray-800">
            <FileText size={16} />
            {t.movements.exitVoucher}
          </button>
          <button onClick={() => openCreate('IN')} className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700">{t.movements.entry}</button>
          <button onClick={() => openCreate('OUT')} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">{t.movements.exit}</button>
          <button onClick={() => openCreate('TRANSFER')} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">{t.movements.transfer}</button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">{t.movements.ref}</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">{t.movements.type}</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">{t.movements.product}</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">{t.movements.supplier}</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">{t.movements.client}</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">{t.movements.quantity}</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">{t.movements.by}</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">{t.movements.date}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500">{t.movements.loading}</td></tr>
            ) : data?.data?.length ? (
              data.data.map((m) => {
                const conf = typeStyle[m.type];
                return (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs">{m.reference.slice(0, 8)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full font-medium ${conf.color}`}>
                        {t.movements.typeLabels[m.type]}
                      </span>
                    </td>
                    <td className="px-4 py-3">{m.product?.name || m.productId}</td>
                    <td className="px-4 py-3 text-gray-600 text-sm">{m.supplier ? `${m.supplier.code} — ${m.supplier.name}` : '—'}</td>
                    <td className="px-4 py-3 text-gray-600 text-sm">{m.client ? `${m.client.code} — ${m.client.name}` : '—'}</td>
                    <td className="px-4 py-3 font-semibold">{m.quantity}</td>
                    <td className="px-4 py-3 text-gray-600">{m.performer?.name || '—'}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{new Date(m.createdAt).toLocaleString(dateLocale)}</td>
                  </tr>
                );
              })
            ) : (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500">{t.movements.noMovements}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <CreateMovementModal open={showCreate} onClose={() => setShowCreate(false)} defaultType={movementType} />
      <StockExitVoucher open={showVoucher} onClose={() => setShowVoucher(false)} />
    </div>
  );
}
