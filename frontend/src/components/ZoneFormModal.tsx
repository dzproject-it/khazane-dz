import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useI18n } from '../contexts/I18nContext';
import type { Zone } from '../types';

interface Props {
  open: boolean;
  onClose: () => void;
  siteId: string;
  zone?: Zone | null;
}

const emptyForm = { name: '', code: '', type: 'AISLE' as 'AISLE' | 'SHELF' | 'AREA' | 'OTHER' };

export function ZoneFormModal({ open, onClose, siteId, zone }: Props) {
  const queryClient = useQueryClient();
  const { t } = useI18n();
  const isEdit = !!zone;
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (open && zone) {
      setForm({ name: zone.name, code: zone.code, type: zone.type });
    } else if (open) {
      setForm(emptyForm);
    }
  }, [open, zone]);

  const createMutation = useMutation({
    mutationFn: (data: typeof form) => api.post(`/sites/${siteId}/zones`, data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zones', siteId] });
      toast.success(t.storage.zoneSuccess);
      onClose();
    },
    onError: () => toast.error(t.storage.zoneError),
  });

  const updateMutation = useMutation({
    mutationFn: (data: typeof form) => api.put(`/zones/${zone!.id}`, data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zones', siteId] });
      toast.success(t.storage.zoneUpdateSuccess);
      onClose();
    },
    onError: () => toast.error(t.storage.zoneUpdateError),
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.code.trim()) return;
    if (isEdit) {
      updateMutation.mutate(form);
    } else {
      createMutation.mutate(form);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            {isEdit ? t.storage.editZone : t.storage.createZone}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.storage.zoneCode}</label>
            <input
              type="text"
              value={form.code}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="ZONE-A1"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.storage.zoneName}</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.storage.zoneType}</label>
            <select
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as typeof f.type }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="AISLE">{t.storage.typeAisle}</option>
              <option value="SHELF">{t.storage.typeShelf}</option>
              <option value="AREA">{t.storage.typeArea}</option>
              <option value="OTHER">{t.storage.typeZoneOther}</option>
            </select>
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
