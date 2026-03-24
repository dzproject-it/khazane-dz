import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MapPin, Pencil, Trash2, Plus, Package } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useI18n } from '../contexts/I18nContext';
import { LocationFormModal } from '../components/LocationFormModal';
import type { Zone, Location } from '../types';

export function ZoneDetailPage() {
  const { siteId, zoneId } = useParams<{ siteId: string; zoneId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useI18n();

  const [showForm, setShowForm] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [deletingLocation, setDeletingLocation] = useState<Location | null>(null);

  const { data: zone, isLoading: loadingZone } = useQuery<Zone & { site?: { name: string; code: string } }>({
    queryKey: ['zone', zoneId],
    queryFn: () => api.get(`/zones/${zoneId}`).then((r) => r.data),
    enabled: !!zoneId,
  });

  const { data: locations, isLoading: loadingLocations } = useQuery<Location[]>({
    queryKey: ['locations', zoneId],
    queryFn: () => api.get(`/zones/${zoneId}/locations`).then((r) => r.data),
    enabled: !!zoneId,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/locations/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations', zoneId] });
      toast.success(t.storage.locationDeleteSuccess);
      setDeletingLocation(null);
    },
    onError: () => toast.error(t.storage.locationDeleteError),
  });

  function openCreate() {
    setEditingLocation(null);
    setShowForm(true);
  }

  function openEdit(loc: Location) {
    setEditingLocation(loc);
    setShowForm(true);
  }

  const isLoading = loadingZone || loadingLocations;

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <button onClick={() => navigate('/storage')} className="hover:text-primary-600">
          {t.storage.backToSites}
        </button>
        <span>/</span>
        <button onClick={() => navigate(`/storage/${siteId}`)} className="hover:text-primary-600">
          {zone?.site?.name || t.storage.backToZones}
        </button>
        <span>/</span>
        <span className="text-gray-900 font-medium">{zone?.name}</span>
      </div>

      {/* Zone header */}
      {zone && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{zone.name}</h2>
          <p className="text-sm text-gray-500 mt-1">
            {zone.code} — {zone.type}
          </p>
        </div>
      )}

      {/* Locations header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{t.storage.locations}</h3>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <Plus size={16} />
          {t.storage.newLocation}
        </button>
      </div>

      {isLoading ? (
        <p className="text-gray-500">{t.storage.loading}</p>
      ) : !locations?.length ? (
        <p className="text-gray-500">{t.storage.noLocations}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {locations.map((loc) => (
            <div
              key={loc.id}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{loc.code}</h4>
                    {loc.label && <p className="text-sm text-gray-500">{loc.label}</p>}
                    {loc.maxCapacity != null && (
                      <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                        <Package size={12} />
                        {t.storage.locationCapacity}: {loc.maxCapacity}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => openEdit(loc)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title={t.storage.editLocation}
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => setDeletingLocation(loc)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title={t.storage.deleteLocation}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Location form modal */}
      {zoneId && (
        <LocationFormModal
          open={showForm}
          onClose={() => setShowForm(false)}
          zoneId={zoneId}
          location={editingLocation}
        />
      )}

      {/* Delete confirmation */}
      {deletingLocation && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t.storage.deleteLocation}</h3>
            <p className="text-sm text-gray-600 mb-6">{t.storage.locationDeleteConfirm}</p>
            <p className="text-sm font-medium text-gray-800 mb-6">{deletingLocation.code}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeletingLocation(null)}
                className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                {t.storage.cancel}
              </button>
              <button
                onClick={() => deleteMutation.mutate(deletingLocation.id)}
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
