import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, LayoutGrid, Pencil, Trash2, Plus, MapPin } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useI18n } from '../contexts/I18nContext';
import { ZoneFormModal } from '../components/ZoneFormModal';
import type { Site, Zone } from '../types';

export function SiteDetailPage() {
  const { siteId } = useParams<{ siteId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useI18n();

  const [showForm, setShowForm] = useState(false);
  const [editingZone, setEditingZone] = useState<Zone | null>(null);
  const [deletingZone, setDeletingZone] = useState<Zone | null>(null);

  const { data: site, isLoading: loadingSite } = useQuery<Site>({
    queryKey: ['site', siteId],
    queryFn: () => api.get(`/sites/${siteId}`).then((r) => r.data),
    enabled: !!siteId,
  });

  const { data: zones, isLoading: loadingZones } = useQuery<(Zone & { _count?: { locations: number } })[]>({
    queryKey: ['zones', siteId],
    queryFn: () => api.get(`/sites/${siteId}/zones`).then((r) => r.data),
    enabled: !!siteId,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/zones/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zones', siteId] });
      toast.success(t.storage.zoneDeleteSuccess);
      setDeletingZone(null);
    },
    onError: () => toast.error(t.storage.zoneDeleteError),
  });

  const zoneTypeLabels: Record<string, string> = {
    AISLE: t.storage.typeAisle,
    SHELF: t.storage.typeShelf,
    AREA: t.storage.typeArea,
    OTHER: t.storage.typeZoneOther,
  };

  function openCreate() {
    setEditingZone(null);
    setShowForm(true);
  }

  function openEdit(zone: Zone) {
    setEditingZone(zone);
    setShowForm(true);
  }

  const isLoading = loadingSite || loadingZones;

  return (
    <div>
      {/* Breadcrumb */}
      <button
        onClick={() => navigate('/storage')}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 mb-4"
      >
        <ArrowLeft size={16} />
        {t.storage.backToSites}
      </button>

      {/* Site header */}
      {site && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{site.name}</h2>
          <p className="text-sm text-gray-500 mt-1">
            {site.code} — {site.type}
            {site.address && ` · ${site.address}`}
          </p>
        </div>
      )}

      {/* Zone list header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{t.storage.zones}</h3>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <Plus size={16} />
          {t.storage.newZone}
        </button>
      </div>

      {isLoading ? (
        <p className="text-gray-500">{t.storage.loading}</p>
      ) : !zones?.length ? (
        <p className="text-gray-500">{t.storage.noZones}</p>
      ) : (
        <div className="grid gap-4">
          {zones.map((zone) => (
            <div
              key={zone.id}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-primary-200 transition-all cursor-pointer"
              onClick={() => navigate(`/storage/${siteId}/zones/${zone.id}`)}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                  <LayoutGrid className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900">{zone.name}</h4>
                  <p className="text-xs text-gray-500">
                    {zone.code} — {zoneTypeLabels[zone.type] || zone.type}
                    {zone._count != null && ` · ${zone._count.locations} ${t.storage.locations}`}
                  </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={(e) => { e.stopPropagation(); openEdit(zone); }}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title={t.storage.editZone}
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setDeletingZone(zone); }}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title={t.storage.deleteZone}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-sm text-primary-600 font-medium">{t.storage.viewLocations} →</span>
                <MapPin size={16} className="text-primary-400" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Zone form modal */}
      {siteId && (
        <ZoneFormModal
          open={showForm}
          onClose={() => setShowForm(false)}
          siteId={siteId}
          zone={editingZone}
        />
      )}

      {/* Delete confirmation */}
      {deletingZone && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t.storage.deleteZone}</h3>
            <p className="text-sm text-gray-600 mb-6">{t.storage.zoneDeleteConfirm}</p>
            <p className="text-sm font-medium text-gray-800 mb-6">
              {deletingZone.code} — {deletingZone.name}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeletingZone(null)}
                className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                {t.storage.cancel}
              </button>
              <button
                onClick={() => deleteMutation.mutate(deletingZone.id)}
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
