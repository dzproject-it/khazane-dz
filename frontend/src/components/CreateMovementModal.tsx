import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { X, ScanLine } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useI18n } from '../contexts/I18nContext';
import type { Product, MovementType, Site, Supplier, Client } from '../types';
import { BarcodeScanner } from './BarcodeScanner';

interface Props {
  open: boolean;
  onClose: () => void;
  defaultType?: MovementType;
}

const typeColors: Record<MovementType, string> = {
  IN: 'bg-green-100 text-green-700',
  OUT: 'bg-red-100 text-red-700',
  TRANSFER: 'bg-blue-100 text-blue-700',
  ADJUSTMENT: 'bg-gray-100 text-gray-700',
};

export function CreateMovementModal({ open, onClose, defaultType = 'IN' }: Props) {
  const queryClient = useQueryClient();
  const { t } = useI18n();
  const [form, setForm] = useState({
    type: defaultType as MovementType,
    productId: '',
    sourceLocationId: '',
    destLocationId: '',
    quantity: '',
    reason: '',
    supplierId: '',
    clientId: '',
  });
  const [scannerOpen, setScannerOpen] = useState(false);

  useEffect(() => {
    if (open) setForm((f) => ({ ...f, type: defaultType }));
  }, [open, defaultType]);

  const { data: products } = useQuery<{ data: Product[] }>({
    queryKey: ['products-list'],
    queryFn: () => api.get('/products', { params: { per_page: 500 } }).then((r) => r.data),
    enabled: open,
  });

  const { data: sites } = useQuery<Site[]>({
    queryKey: ['sites'],
    queryFn: () => api.get('/sites').then((r) => r.data),
    enabled: open,
  });

  const { data: suppliersData } = useQuery<{ data: Supplier[] }>({
    queryKey: ['suppliers-list'],
    queryFn: () => api.get('/suppliers', { params: { per_page: 500 } }).then((r) => r.data),
    enabled: open && form.type === 'IN',
  });

  const { data: clientsData } = useQuery<{ data: Client[] }>({
    queryKey: ['clients-list'],
    queryFn: () => api.get('/clients', { params: { per_page: 500 } }).then((r) => r.data),
    enabled: open && form.type === 'OUT',
  });

  const allLocations = sites?.flatMap((s) =>
    (s.zones ?? []).flatMap((z) =>
      (z.locations ?? []).map((loc) => ({
        id: loc.id,
        label: `${s.name} > ${z.name} > ${loc.code}${loc.label ? ` (${loc.label})` : ''}`,
      }))
    )
  ) ?? [];

  const mutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post('/movements', data),
    onSuccess: () => {
      toast.success(t.createMovement.success);
      queryClient.invalidateQueries({ queryKey: ['movements'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      resetAndClose();
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg || t.createMovement.error);
    },
  });

  function resetAndClose() {
    setForm({ type: defaultType, productId: '', sourceLocationId: '', destLocationId: '', quantity: '', reason: '', supplierId: '', clientId: '' });
    onClose();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload: Record<string, unknown> = {
      type: form.type,
      productId: form.productId,
      quantity: Number(form.quantity),
      reason: form.reason || undefined,
    };
    if (form.type === 'IN' || form.type === 'ADJUSTMENT') {
      payload.destLocationId = form.destLocationId;
    } else if (form.type === 'OUT') {
      payload.sourceLocationId = form.sourceLocationId;
    } else if (form.type === 'TRANSFER') {
      payload.sourceLocationId = form.sourceLocationId;
      payload.destLocationId = form.destLocationId;
    }
    if (form.type === 'IN' && form.supplierId) {
      payload.supplierId = form.supplierId;
    }
    if (form.type === 'OUT' && form.clientId) {
      payload.clientId = form.clientId;
    }
    mutation.mutate(payload);
  }

  function handleBarcodeScan(code: string) {
    const match = products?.data?.find(
      (p) => p.barcode === code || p.sku === code
    );
    if (match) {
      setForm((f) => ({ ...f, productId: match.id }));
      toast.success(`${t.scanner.productFound}: ${match.name}`);
    } else {
      toast.error(`${t.scanner.productNotFound}: ${code}`);
    }
    setScannerOpen(false);
  }

  const needsSource = form.type === 'OUT' || form.type === 'TRANSFER';
  const needsDest = form.type === 'IN' || form.type === 'TRANSFER' || form.type === 'ADJUSTMENT';

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40" onClick={resetAndClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-gray-900">{t.createMovement.title}</h3>
          <button onClick={resetAndClose} className="p-1 rounded hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t.createMovement.movementType}</label>
            <div className="flex gap-2">
              {(['IN', 'OUT', 'TRANSFER', 'ADJUSTMENT'] as MovementType[]).map((mt) => (
                <button
                  key={mt}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, type: mt, sourceLocationId: '', destLocationId: '' }))}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                    form.type === mt
                      ? `${typeColors[mt]} border-current`
                      : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {t.createMovement.typeLabels[mt]}
                </button>
              ))}
            </div>
          </div>

          {/* Product + Scan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.createMovement.product} *</label>
            <div className="flex gap-2">
              <select
                required
                value={form.productId}
                onChange={(e) => setForm((f) => ({ ...f, productId: e.target.value }))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
              >
                <option value="">{t.createMovement.selectOption}</option>
                {products?.data?.map((p) => (
                  <option key={p.id} value={p.id}>{p.sku} — {p.name}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setScannerOpen(true)}
                title={t.scanner.scanButton}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-primary-50 text-primary-700 border border-primary-200 rounded-lg hover:bg-primary-100 transition-colors"
              >
                <ScanLine className="w-4 h-4" />
                <span className="hidden sm:inline">{t.scanner.scanButton}</span>
              </button>
            </div>
          </div>

          <BarcodeScanner
            open={scannerOpen}
            onClose={() => setScannerOpen(false)}
            onScan={handleBarcodeScan}
          />

          {/* Locations */}
          <div className="grid grid-cols-2 gap-4">
            {needsSource && (
              <div className={needsDest ? '' : 'col-span-2'}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.createMovement.sourceLocation} *</label>
                <select
                  required
                  value={form.sourceLocationId}
                  onChange={(e) => setForm((f) => ({ ...f, sourceLocationId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                >
                  <option value="">{t.createMovement.selectOption}</option>
                  {allLocations.map((loc) => (
                    <option key={loc.id} value={loc.id}>{loc.label}</option>
                  ))}
                </select>
              </div>
            )}
            {needsDest && (
              <div className={needsSource ? '' : 'col-span-2'}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.createMovement.destLocation} *</label>
                <select
                  required
                  value={form.destLocationId}
                  onChange={(e) => setForm((f) => ({ ...f, destLocationId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                >
                  <option value="">{t.createMovement.selectOption}</option>
                  {allLocations.map((loc) => (
                    <option key={loc.id} value={loc.id}>{loc.label}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Supplier (IN) / Client (OUT) */}
          {form.type === 'IN' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.createMovement.supplier}</label>
              <select
                value={form.supplierId}
                onChange={(e) => setForm((f) => ({ ...f, supplierId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
              >
                <option value="">{t.createMovement.selectOption}</option>
                {suppliersData?.data?.map((s) => (
                  <option key={s.id} value={s.id}>{s.code} — {s.name}</option>
                ))}
              </select>
            </div>
          )}
          {form.type === 'OUT' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.createMovement.client}</label>
              <select
                value={form.clientId}
                onChange={(e) => setForm((f) => ({ ...f, clientId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
              >
                <option value="">{t.createMovement.selectOption}</option>
                {clientsData?.data?.map((c) => (
                  <option key={c.id} value={c.id}>{c.code} — {c.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Quantity + Reason */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.createMovement.quantity} *</label>
              <input
                type="number"
                required
                min={form.type === 'ADJUSTMENT' ? undefined : 1}
                step="any"
                value={form.quantity}
                onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
                placeholder="10"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.createMovement.reason}</label>
              <input
                type="text"
                value={form.reason}
                onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
                placeholder={t.createMovement.reasonPlaceholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-200">
            <button
              type="button"
              onClick={resetAndClose}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {t.createMovement.cancel}
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {mutation.isPending ? t.createMovement.saving : t.createMovement.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
