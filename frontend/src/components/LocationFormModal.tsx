import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useI18n } from '../contexts/I18nContext';
import type { Location } from '../types';

interface Props {
  open: boolean;
  onClose: () => void;
  zoneId: string;
  location?: Location | null;
}

const emptyForm = { code: '', label: '', maxCapacity: '' };

export function LocationFormModal({ open, onClose, zoneId, location }: Props) {
  const queryClient = useQueryClient();
  const { t } = useI18n();
  const isEdit = !!location;
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (open && location) {
      setForm({
        code: location.code,
        label: location.label || '',
        maxCapacity: location.maxCapacity != null ? String(location.maxCapacity) : '',
      });
    } else if (open) {
      setForm(emptyForm);
    }
  }, [open, location]);

  const createMutation = useMutation({
    mutationFn: (data: { code: string; label?: string; maxCapacity?: number }) =>
      api.post(`/zones/${zoneId}/locations`, data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations', zoneId] });
      toast.success(t.storage.locationSuccess);
      onClose();
    },
    onError: () => toast.error(t.storage.locationError),
  });

  const updateMutation = useMutation({
    mutationFn: (data: { code?: string; label?: string; maxCapacity?: number }) =>
      api.put(`/locations/${location!.id}`, data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations', zoneId] });
      toast.success(t.storage.locationUpdateSuccess);
      onClose();
    },
    onError: () => toast.error(t.storage.locationUpdateError),
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.code.trim()) return;
    const payload: { code: string; label?: string; maxCapacity?: number } = {
      code: form.code,
      label: form.label || undefined,
      maxCapacity: form.maxCapacity ? parseInt(form.maxCapacity, 10) : undefined,
    };
    if (isEdit) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            {isEdit ? t.storage.editLocation : t.storage.createLocation}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.storage.locationCode}</label>
            <input
              type="text"
              value={form.code}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="LOC-001"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.storage.locationLabel}</label>
            <input
              type="text"
              value={form.label}
              onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.storage.locationCapacity}</label>
            <input
              type="number"
              min="0"
              value={form.maxCapacity}
              onChange={(e) => setForm((f) => ({ ...f, maxCapacity: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              {t.storage.cancel}
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 text-sm text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {isPending ? t.storage.saving : t.storage.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
