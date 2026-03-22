import { useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, Plus, Download, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { CreateProductModal } from '../components/CreateProductModal';
import { useI18n } from '../contexts/I18nContext';
import type { Product, PaginatedResponse } from '../types';

export function ProductsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { t } = useI18n();

  const { data, isLoading } = useQuery<PaginatedResponse<Product>>({
    queryKey: ['products', page, search],
    queryFn: () => api.get('/products', { params: { page, per_page: 20, search } }).then((r) => r.data),
  });

  const importMutation = useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return api.post('/import/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: (res) => {
      const r = res.data;
      toast.success(`${t.products.importSuccess} : ${r.created} / ${r.updated}${r.errors?.length ? ` (${r.errors.length})` : ''}`);
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg || t.products.exportError);
    },
  });

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      importMutation.mutate(file);
      e.target.value = '';
    }
  }

  async function handleExport() {
    try {
      const res = await api.get('/export/products', { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'produits-khazane.xlsx';
      a.click();
      URL.revokeObjectURL(url);
      toast.success(t.products.exportSuccess);
    } catch {
      toast.error(t.products.exportError);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{t.products.title}</h2>
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            onClick={handleImportClick}
            disabled={importMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <Upload className="w-4 h-4" /> {importMutation.isPending ? t.products.importing : t.products.import}
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Download className="w-4 h-4" /> {t.products.export}
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <Plus className="w-4 h-4" /> {t.products.newProduct}
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
          placeholder={t.products.searchPlaceholder}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>

      {/* Products table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">{t.products.sku}</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">{t.products.name}</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">{t.products.category}</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">{t.products.unit}</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">{t.products.barcode}</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">{t.products.status}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">{t.products.loading}</td></tr>
            ) : data?.data?.length ? (
              data.data.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 cursor-pointer">
                  <td className="px-4 py-3 font-mono text-xs">{product.sku}</td>
                  <td className="px-4 py-3 font-medium">{product.name}</td>
                  <td className="px-4 py-3 text-gray-600">{product.category?.name || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{product.unitOfMeasure}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{product.barcode || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                      product.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {product.isActive ? t.products.active : t.products.inactive}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">{t.products.noProducts}</td></tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {data && data.total > 20 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-600">
              {data.total} — {t.products.page} {page}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 text-sm border rounded disabled:opacity-50"
              >
                {t.products.previous}
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page * 20 >= data.total}
                className="px-3 py-1 text-sm border rounded disabled:opacity-50"
              >
                {t.products.next}
              </button>
            </div>
          </div>
        )}
      </div>
      <CreateProductModal open={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  );
}
