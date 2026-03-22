import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Plus, Trash2, Phone, Mail, MapPin, User, Building2, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { CreateClientModal } from '../components/CreateClientModal';
import { useI18n } from '../contexts/I18nContext';
import type { Client, PaginatedResponse } from '../types';

export function ClientsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { t } = useI18n();

  const { data, isLoading } = useQuery<PaginatedResponse<Client>>({
    queryKey: ['clients', page, search],
    queryFn: () => api.get('/clients', { params: { page, per_page: 20, search } }).then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/clients/${id}`),
    onSuccess: () => {
      toast.success(t.clients.deleteSuccess);
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
    onError: () => toast.error(t.clients.deleteError),
  });

  const typeColor: Record<string, string> = {
    COMPANY: 'bg-blue-100 text-blue-700',
    INDIVIDUAL: 'bg-purple-100 text-purple-700',
    GOVERNMENT: 'bg-amber-100 text-amber-700',
    OTHER: 'bg-gray-100 text-gray-600',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{t.clients.title}</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { window.location.href = `${api.defaults.baseURL}/export/clients`; }}
            className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Download className="w-4 h-4" /> {t.clients.export}
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <Plus className="w-4 h-4" /> {t.clients.newClient}
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder={t.clients.searchPlaceholder}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>

      {/* Clients table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">{t.clients.code}</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">{t.clients.name}</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">{t.clients.type}</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">{t.clients.contact}</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">{t.clients.phone}</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">{t.clients.status}</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">{t.clients.movementsCount}</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500">{t.clients.loading}</td></tr>
            ) : data?.data?.length ? (
              data.data.map((client) => (
                <>
                  <tr
                    key={client.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => setExpanded(expanded === client.id ? null : client.id)}
                  >
                    <td className="px-4 py-3 font-mono text-xs">{client.code}</td>
                    <td className="px-4 py-3 font-medium">{client.name}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${typeColor[client.type] || typeColor.OTHER}`}>
                        {t.clients.typeLabels[client.type] || client.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{client.contact || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{client.phone || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                        client.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {client.isActive ? t.clients.active : t.clients.inactive}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600">{client._count?.movements ?? 0}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(t.clients.confirmDelete)) deleteMutation.mutate(client.id);
                        }}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                  {expanded === client.id && (
                    <tr key={`${client.id}-detail`}>
                      <td colSpan={8} className="px-6 py-4 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Building2 className="w-4 h-4" /> {t.clients.typeLabels[client.type] || client.type}
                            </div>
                            {client.contact && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <User className="w-4 h-4" /> {client.contact}
                              </div>
                            )}
                            {client.email && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Mail className="w-4 h-4" /> {client.email}
                              </div>
                            )}
                            {client.phone && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Phone className="w-4 h-4" /> {client.phone}
                              </div>
                            )}
                            {client.address && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <MapPin className="w-4 h-4" /> {client.address}
                              </div>
                            )}
                          </div>
                          <div className="space-y-2">
                            {client.nif && (
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">{t.clients.nif} :</span> {client.nif}
                              </p>
                            )}
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">{t.clients.movementsCount} :</span> {client._count?.movements ?? 0}
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))
            ) : (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500">{t.clients.noClients}</td></tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {data && data.total > 20 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-600">
              {data.total} — {t.clients.page} {page}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 text-sm border rounded disabled:opacity-50"
              >
                {t.clients.previous}
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page * 20 >= data.total}
                className="px-3 py-1 text-sm border rounded disabled:opacity-50"
              >
                {t.clients.next}
              </button>
            </div>
          </div>
        )}
      </div>
      <CreateClientModal open={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  );
}
