import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useI18n } from '../contexts/I18nContext';
import type { Site } from '../types';

interface Props {
  open: boolean;
  onClose: () => void;
  site?: Site | null;
}

const emptyForm = { name: '', code: '', type: 'WAREHOUSE' as 'WAREHOUSE' | 'STORE' | 'OTHER', address: '' };

export function SiteFormModal({ open, onClose, site }: Props) {
  const queryClient = useQueryClient();
  const { t } = useI18n();
  const isEdit = !!site;
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (open && site) {
      setForm({ name: site.name, code: site.code, type: site.type, address: site.address || '' });
    } else if (open) {
      setForm(emptyForm);
    }
  }, [open, site]);

  const createMutation = useMutation({
    mutationFn: (data: typeof form) => api.post('/sites', data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      toast.success(t.storage.success);
      onClose();
    },
    onError: () => toast.error(t.storage.error),
  });

  const updateMutation = useMutation({
    mutationFn: (data: typeof form) => api.put(`/sites/${site!.id}`, data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      toast.success(t.storage.updateSuccess);
      onClose();
    },
    onError: () => toast.error(t.storage.updateError),
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
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            {isEdit ? t.storage.editSite : t.storage.createSite}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.storage.siteCode}</label>
            <input
              type="text"
              value={form.code}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="SITE-001"
              required
            />
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.storage.siteName}</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.storage.siteType}</label>
            <select
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as typeof f.type }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="WAREHOUSE">{t.storage.typeWarehouse}</option>
              <option value="STORE">{t.storage.typeStore}</option>
              <option value="OTHER">{t.storage.typeOther}</option>
            </select>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.storage.siteAddress}</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Actions */}
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
