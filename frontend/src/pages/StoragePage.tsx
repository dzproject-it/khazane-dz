import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Warehouse, Pencil, Trash2, Plus } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useI18n } from '../contexts/I18nContext';
import { SiteFormModal } from '../components/SiteFormModal';
import type { Site } from '../types';

export function StoragePage() {
  const queryClient = useQueryClient();
  const { t } = useI18n();
  const [showForm, setShowForm] = useState(false);
  const [editingSite, setEditingSite] = useState<Site | null>(null);
  const [deletingSite, setDeletingSite] = useState<Site | null>(null);

  const { data: sites, isLoading } = useQuery<(Site & { _count?: { zones: number } })[]>({
    queryKey: ['sites'],
    queryFn: () => api.get('/sites').then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/sites/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      toast.success(t.storage.deleteSuccess);
      setDeletingSite(null);
    },
    onError: () => toast.error(t.storage.deleteError),
  });

  function openCreate() {
    setEditingSite(null);
    setShowForm(true);
  }

  function openEdit(site: Site) {
    setEditingSite(site);
    setShowForm(true);
  }

  const typeLabels: Record<string, string> = {
    WAREHOUSE: t.storage.typeWarehouse,
    STORE: t.storage.typeStore,
    OTHER: t.storage.typeOther,
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{t.storage.title}</h2>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <Plus size={16} />
          {t.storage.newSite}
        </button>
      </div>

      {isLoading ? (
        <p className="text-gray-500">{t.storage.loading}</p>
      ) : !sites?.length ? (
        <p className="text-gray-500">{t.storage.noSites}</p>
      ) : (
        <div className="grid gap-4">
          {sites.map((site) => (
            <div key={site.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <Warehouse className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900">{site.name}</h3>
                  <p className="text-xs text-gray-500">
                    {site.code} — {typeLabels[site.type] || site.type}
                    {site._count != null && ` · ${site._count.zones} ${t.storage.zones}`}
                  </p>
                  {site.address && <p className="text-sm text-gray-500 mt-1">{site.address}</p>}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => openEdit(site)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title={t.storage.editSite}
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => setDeletingSite(site)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title={t.storage.deleteSite}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit modal */}
      <SiteFormModal
        open={showForm}
        onClose={() => setShowForm(false)}
        site={editingSite}
      />

      {/* Delete confirmation dialog */}
      {deletingSite && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t.storage.deleteSite}</h3>
            <p className="text-sm text-gray-600 mb-6">{t.storage.deleteConfirm}</p>
            <p className="text-sm font-medium text-gray-800 mb-6">
              {deletingSite.code} — {deletingSite.name}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeletingSite(null)}
                className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                {t.storage.cancel}
              </button>
              <button
                onClick={() => deleteMutation.mutate(deletingSite.id)}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {deleteMutation.isPending ? t.storage.saving : t.storage.confirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
