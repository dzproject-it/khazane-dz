import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Plus, Trash2, Phone, Mail, MapPin, User, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { CreateSupplierModal } from '../components/CreateSupplierModal';
import { useI18n } from '../contexts/I18nContext';
import type { Supplier, PaginatedResponse } from '../types';

export function SuppliersPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { t } = useI18n();

  const { data, isLoading } = useQuery<PaginatedResponse<Supplier>>({
    queryKey: ['suppliers', page, search],
    queryFn: () => api.get('/suppliers', { params: { page, per_page: 20, search } }).then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/suppliers/${id}`),
    onSuccess: () => {
      toast.success(t.suppliers.deleteSuccess);
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
    onError: () => toast.error(t.suppliers.deleteError),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{t.suppliers.title}</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { window.location.href = `${api.defaults.baseURL}/export/suppliers`; }}
            className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Download className="w-4 h-4" /> {t.suppliers.export}
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <Plus className="w-4 h-4" /> {t.suppliers.newSupplier}
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
          placeholder={t.suppliers.searchPlaceholder}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>

      {/* Suppliers table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">{t.suppliers.code}</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">{t.suppliers.name}</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">{t.suppliers.contact}</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">{t.suppliers.email}</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">{t.suppliers.phone}</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">{t.suppliers.status}</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">{t.suppliers.productsCount}</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500">{t.suppliers.loading}</td></tr>
            ) : data?.data?.length ? (
              data.data.map((supplier) => (
                <>
                  <tr
                    key={supplier.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => setExpanded(expanded === supplier.id ? null : supplier.id)}
                  >
                    <td className="px-4 py-3 font-mono text-xs">{supplier.code}</td>
                    <td className="px-4 py-3 font-medium">{supplier.name}</td>
                    <td className="px-4 py-3 text-gray-600">{supplier.contact || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{supplier.email || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{supplier.phone || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                        supplier.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {supplier.isActive ? t.suppliers.active : t.suppliers.inactive}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600">{supplier.products?.length ?? 0}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(t.suppliers.confirmDelete)) deleteMutation.mutate(supplier.id);
                        }}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                  {expanded === supplier.id && (
                    <tr key={`${supplier.id}-detail`}>
                      <td colSpan={8} className="px-6 py-4 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            {supplier.contact && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <User className="w-4 h-4" /> {supplier.contact}
                              </div>
                            )}
                            {supplier.email && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Mail className="w-4 h-4" /> {supplier.email}
                              </div>
                            )}
                            {supplier.phone && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Phone className="w-4 h-4" /> {supplier.phone}
                              </div>
                            )}
                            {supplier.address && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <MapPin className="w-4 h-4" /> {supplier.address}
                              </div>
                            )}
                            {supplier.nif && (
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">{t.suppliers.nif} :</span> {supplier.nif}
                              </p>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">{t.suppliers.linkedProducts}</p>
                            {supplier.products?.length ? (
                              <div className="flex flex-wrap gap-2">
                                {supplier.products.map((ps) => (
                                  <span key={ps.product.id} className="px-2 py-1 text-xs bg-primary-50 text-primary-700 rounded-full">
                                    {ps.product.sku} — {ps.product.name}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-400">{t.suppliers.noLinkedProducts}</p>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))
            ) : (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500">{t.suppliers.noSuppliers}</td></tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {data && data.total > 20 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-600">
              {data.total} — {t.suppliers.page} {page}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 text-sm border rounded disabled:opacity-50"
              >
                {t.suppliers.previous}
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page * 20 >= data.total}
                className="px-3 py-1 text-sm border rounded disabled:opacity-50"
              >
                {t.suppliers.next}
              </button>
            </div>
          </div>
        )}
      </div>
      <CreateSupplierModal open={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  );
}
