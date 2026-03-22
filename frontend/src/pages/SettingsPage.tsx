import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, ChevronRight, X, Palette, Upload } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useTheme } from '../contexts/ThemeContext';
import { useI18n } from '../contexts/I18nContext';
import { localeNames, type Locale } from '../i18n/translations';
import type { Category, CustomFieldDef, User } from '../types';

/* ── Petit modal générique ── */
function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100"><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ══════════════ UTILISATEURS ══════════════ */
function UsersPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: () => api.get('/users').then((r) => r.data),
    enabled: open,
  });

  const roleBadge: Record<string, string> = {
    ADMIN: 'bg-red-100 text-red-700',
    MANAGER: 'bg-blue-100 text-blue-700',
    OPERATOR: 'bg-green-100 text-green-700',
    VIEWER: 'bg-gray-100 text-gray-600',
  };

  return (
    <Modal open={open} onClose={onClose} title="Utilisateurs">
      {isLoading ? <p className="text-sm text-gray-500">Chargement...</p> : (
        <div className="space-y-2">
          {users?.map((u) => (
            <div key={u.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div>
                <p className="font-medium text-sm">{u.name}</p>
                <p className="text-xs text-gray-500">{u.email}</p>
              </div>
              <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${roleBadge[u.role] || 'bg-gray-100'}`}>{u.role}</span>
            </div>
          ))}
          {!users?.length && <p className="text-sm text-gray-500">Aucun utilisateur.</p>}
        </div>
      )}
    </Modal>
  );
}

/* ══════════════ CHAMPS PERSONNALISÉS ══════════════ */
function CustomFieldsPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ name: '', fieldType: 'TEXT' as string, isRequired: false });

  const { data: fields, isLoading } = useQuery<CustomFieldDef[]>({
    queryKey: ['custom-fields'],
    queryFn: () => api.get('/custom-fields').then((r) => r.data),
    enabled: open,
  });

  const createMut = useMutation({
    mutationFn: (data: typeof form) => api.post('/custom-fields', data),
    onSuccess: () => { toast.success('Champ créé'); queryClient.invalidateQueries({ queryKey: ['custom-fields'] }); setForm({ name: '', fieldType: 'TEXT', isRequired: false }); },
    onError: () => toast.error('Erreur lors de la création'),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => api.delete(`/custom-fields/${id}`),
    onSuccess: () => { toast.success('Champ supprimé'); queryClient.invalidateQueries({ queryKey: ['custom-fields'] }); },
  });

  const fieldTypeLabels: Record<string, string> = { TEXT: 'Texte', NUMBER: 'Nombre', DATE: 'Date', SELECT: 'Sélection' };

  return (
    <Modal open={open} onClose={onClose} title="Champs personnalisés">
      {/* Liste */}
      {isLoading ? <p className="text-sm text-gray-500">Chargement...</p> : (
        <div className="space-y-2 mb-5">
          {fields?.map((f) => (
            <div key={f.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div>
                <p className="font-medium text-sm">{f.name} {f.isRequired && <span className="text-red-500">*</span>}</p>
                <p className="text-xs text-gray-500">{fieldTypeLabels[f.fieldType] || f.fieldType}</p>
              </div>
              <button onClick={() => deleteMut.mutate(f.id)} className="p-1 rounded hover:bg-red-50 text-red-500"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
          {!fields?.length && <p className="text-sm text-gray-500">Aucun champ personnalisé.</p>}
        </div>
      )}
      {/* Formulaire ajout */}
      <form onSubmit={(e) => { e.preventDefault(); createMut.mutate(form); }} className="border-t border-gray-200 pt-4 space-y-3">
        <p className="text-sm font-medium text-gray-700">Ajouter un champ</p>
        <div className="grid grid-cols-2 gap-3">
          <input
            required
            placeholder="Nom du champ"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
          />
          <select value={form.fieldType} onChange={(e) => setForm((f) => ({ ...f, fieldType: e.target.value }))} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500">
            <option value="TEXT">Texte</option>
            <option value="NUMBER">Nombre</option>
            <option value="DATE">Date</option>
            <option value="SELECT">Sélection</option>
          </select>
        </div>
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isRequired} onChange={(e) => setForm((f) => ({ ...f, isRequired: e.target.checked }))} className="rounded" />
            Obligatoire
          </label>
          <button type="submit" disabled={createMut.isPending} className="flex items-center gap-1 px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
            <Plus className="w-4 h-4" /> {createMut.isPending ? 'Ajout...' : 'Ajouter'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ══════════════ SEUILS ══════════════ */
function ThresholdsPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ productId: '', minQuantity: '', safetyQuantity: '', reorderPoint: '' });

  const { data: thresholds, isLoading } = useQuery<any[]>({
    queryKey: ['thresholds'],
    queryFn: () => api.get('/thresholds').then((r) => r.data),
    enabled: open,
  });

  const { data: products } = useQuery<{ data: { id: string; sku: string; name: string }[] }>({
    queryKey: ['products-for-thresholds'],
    queryFn: () => api.get('/products', { params: { per_page: 500 } }).then((r) => r.data),
    enabled: open,
  });

  const createMut = useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post('/thresholds', data),
    onSuccess: () => { toast.success('Seuil créé'); queryClient.invalidateQueries({ queryKey: ['thresholds'] }); setForm({ productId: '', minQuantity: '', safetyQuantity: '', reorderPoint: '' }); },
    onError: () => toast.error('Erreur lors de la création'),
  });

  return (
    <Modal open={open} onClose={onClose} title="Seuils & Alertes">
      {isLoading ? <p className="text-sm text-gray-500">Chargement...</p> : (
        <div className="space-y-2 mb-5">
          {thresholds?.map((t: any) => (
            <div key={t.id} className="p-3 border border-gray-200 rounded-lg text-sm">
              <p className="font-medium">{t.product?.name || t.productId}</p>
              <p className="text-xs text-gray-500">Min: {t.minQuantity} | Sécurité: {t.safetyQuantity} | Commande: {t.reorderPoint}</p>
            </div>
          ))}
          {!thresholds?.length && <p className="text-sm text-gray-500">Aucun seuil configuré.</p>}
        </div>
      )}
      <form onSubmit={(e) => { e.preventDefault(); createMut.mutate({ productId: form.productId, minQuantity: Number(form.minQuantity), safetyQuantity: Number(form.safetyQuantity), reorderPoint: Number(form.reorderPoint) }); }} className="border-t border-gray-200 pt-4 space-y-3">
        <p className="text-sm font-medium text-gray-700">Ajouter un seuil</p>
        <select required value={form.productId} onChange={(e) => setForm((f) => ({ ...f, productId: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500">
          <option value="">— Produit —</option>
          {products?.data?.map((p) => <option key={p.id} value={p.id}>{p.sku} — {p.name}</option>)}
        </select>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Stock min.</label>
            <input type="number" required min={0} value={form.minQuantity} onChange={(e) => setForm((f) => ({ ...f, minQuantity: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Sécurité</label>
            <input type="number" required min={0} value={form.safetyQuantity} onChange={(e) => setForm((f) => ({ ...f, safetyQuantity: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Pt commande</label>
            <input type="number" required min={0} value={form.reorderPoint} onChange={(e) => setForm((f) => ({ ...f, reorderPoint: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500" />
          </div>
        </div>
        <div className="flex justify-end">
          <button type="submit" disabled={createMut.isPending} className="flex items-center gap-1 px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
            <Plus className="w-4 h-4" /> {createMut.isPending ? 'Ajout...' : 'Ajouter'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ══════════════ CATÉGORIES ══════════════ */
function CategoriesPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ name: '', parentId: '' });

  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then((r) => r.data),
    enabled: open,
  });

  const createMut = useMutation({
    mutationFn: (data: { name: string; parentId?: string }) => api.post('/categories', data),
    onSuccess: () => { toast.success('Catégorie créée'); queryClient.invalidateQueries({ queryKey: ['categories'] }); setForm({ name: '', parentId: '' }); },
    onError: () => toast.error('Erreur lors de la création'),
  });

  function renderTree(cats: Category[], depth = 0): React.ReactNode {
    return cats.map((cat) => (
      <div key={cat.id}>
        <div className="flex items-center gap-2 p-2 rounded hover:bg-gray-50" style={{ paddingLeft: `${12 + depth * 20}px` }}>
          {cat.children?.length ? <ChevronRight className="w-3.5 h-3.5 text-gray-400" /> : <span className="w-3.5" />}
          <span className="text-sm">{cat.name}</span>
        </div>
        {cat.children?.length ? renderTree(cat.children, depth + 1) : null}
      </div>
    ));
  }

  const flatCategories = (cats: Category[], prefix = ''): { id: string; label: string }[] =>
    cats.flatMap((c) => [{ id: c.id, label: prefix + c.name }, ...(c.children ? flatCategories(c.children, prefix + c.name + ' > ') : [])]);

  return (
    <Modal open={open} onClose={onClose} title="Catégories">
      {isLoading ? <p className="text-sm text-gray-500">Chargement...</p> : (
        <div className="mb-5 border border-gray-200 rounded-lg overflow-hidden">
          {categories?.length ? renderTree(categories) : <p className="p-3 text-sm text-gray-500">Aucune catégorie.</p>}
        </div>
      )}
      <form onSubmit={(e) => { e.preventDefault(); createMut.mutate({ name: form.name, parentId: form.parentId || undefined }); }} className="border-t border-gray-200 pt-4 space-y-3">
        <p className="text-sm font-medium text-gray-700">Ajouter une catégorie</p>
        <div className="grid grid-cols-2 gap-3">
          <input
            required
            placeholder="Nom"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
          />
          <select value={form.parentId} onChange={(e) => setForm((f) => ({ ...f, parentId: e.target.value }))} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500">
            <option value="">— Racine —</option>
            {categories && flatCategories(categories).map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </div>
        <div className="flex justify-end">
          <button type="submit" disabled={createMut.isPending} className="flex items-center gap-1 px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
            <Plus className="w-4 h-4" /> {createMut.isPending ? 'Ajout...' : 'Ajouter'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ══════════════ APPARENCE ══════════════ */
const presetColors: { label: string; hue: number; sat: number }[] = [
  { label: 'Bleu', hue: 221, sat: 83 },
  { label: 'Indigo', hue: 245, sat: 75 },
  { label: 'Violet', hue: 271, sat: 81 },
  { label: 'Rose', hue: 330, sat: 80 },
  { label: 'Rouge', hue: 0, sat: 72 },
  { label: 'Orange', hue: 25, sat: 95 },
  { label: 'Jaune', hue: 45, sat: 93 },
  { label: 'Vert', hue: 142, sat: 76 },
  { label: 'Teal', hue: 172, sat: 66 },
  { label: 'Cyan', hue: 199, sat: 89 },
];

function AppearancePanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { theme, updateTheme, resetTheme } = useTheme();

  if (!open) return null;

  return (
    <Modal open={open} onClose={onClose} title="Apparence & Marque">
      <div className="space-y-5">
        {/* Nom d'application */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'application</label>
          <input
            type="text"
            value={theme.appName}
            onChange={(e) => updateTheme({ appName: e.target.value })}
            placeholder="Khazane-DZ"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Logo (upload fichier) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Logo</label>
          <div className="flex items-center gap-3">
            {theme.logoUrl ? (
              <img src={theme.logoUrl} alt="Logo" className="w-12 h-12 rounded object-contain border border-gray-200" />
            ) : (
              <div className="w-12 h-12 rounded border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400">
                <Upload className="w-5 h-5" />
              </div>
            )}
            <div className="flex flex-col gap-1">
              <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-50 text-primary-700 text-sm font-medium rounded-lg cursor-pointer hover:bg-primary-100 transition-colors">
                <Upload className="w-4 h-4" />
                Choisir une image
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (file.size > 2 * 1024 * 1024) {
                      toast.error('Image trop volumineuse (max 2 Mo)');
                      return;
                    }
                    const reader = new FileReader();
                    reader.onload = () => updateTheme({ logoUrl: reader.result as string });
                    reader.readAsDataURL(file);
                    e.target.value = '';
                  }}
                />
              </label>
              {theme.logoUrl && (
                <button onClick={() => updateTheme({ logoUrl: '' })} className="text-xs text-red-500 hover:underline text-start">
                  Supprimer le logo
                </button>
              )}
            </div>
          </div>
          <p className="mt-1 text-xs text-gray-400">PNG, JPG, SVG ou WebP — max 2 Mo</p>
        </div>

        {/* Couleur primaire */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Couleur primaire</label>
          <div className="flex flex-wrap gap-2">
            {presetColors.map((c) => (
              <button
                key={c.label}
                type="button"
                onClick={() => updateTheme({ primaryHue: c.hue, primarySaturation: c.sat })}
                className={`w-9 h-9 rounded-lg border-2 transition-all ${
                  theme.primaryHue === c.hue && theme.primarySaturation === c.sat
                    ? 'border-gray-900 scale-110'
                    : 'border-transparent hover:scale-105'
                }`}
                style={{ backgroundColor: `hsl(${c.hue}, ${c.sat}%, 50%)` }}
                title={c.label}
              />
            ))}
          </div>
          <div className="mt-3 flex items-center gap-3">
            <label className="text-xs text-gray-500">Personnalisé :</label>
            <input
              type="range"
              min={0}
              max={360}
              value={theme.primaryHue}
              onChange={(e) => updateTheme({ primaryHue: Number(e.target.value) })}
              className="flex-1"
            />
            <div className="w-8 h-8 rounded-lg border border-gray-200" style={{ backgroundColor: `hsl(${theme.primaryHue}, ${theme.primarySaturation}%, 50%)` }} />
          </div>
        </div>

        {/* Style sidebar */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Style du menu latéral</label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => updateTheme({ sidebarStyle: 'light' })}
              className={`flex-1 p-3 rounded-lg border-2 text-center text-sm font-medium transition-colors ${
                theme.sidebarStyle === 'light' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="w-full h-8 rounded bg-white border border-gray-200 mb-2" />
              Clair
            </button>
            <button
              type="button"
              onClick={() => updateTheme({ sidebarStyle: 'dark' })}
              className={`flex-1 p-3 rounded-lg border-2 text-center text-sm font-medium transition-colors ${
                theme.sidebarStyle === 'dark' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="w-full h-8 rounded bg-gray-900 mb-2" />
              Sombre
            </button>
          </div>
        </div>

        {/* Reset */}
        <div className="flex justify-between pt-3 border-t border-gray-200">
          <button
            type="button"
            onClick={() => { resetTheme(); toast.success('Thème réinitialisé'); }}
            className="text-sm text-red-500 hover:underline"
          >
            Réinitialiser par défaut
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Fermer
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* ══════════════ PAGE SETTINGS ══════════════ */
export function SettingsPage() {
  const [panel, setPanel] = useState<'users' | 'fields' | 'thresholds' | 'categories' | 'appearance' | null>(null);
  const { t, locale, setLocale } = useI18n();

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">{t.settings.title}</h2>

      <div className="space-y-6 max-w-2xl">
        {/* Langue */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">{t.settings.language}</h3>
          <p className="text-sm text-gray-500 mb-4">{t.settings.languageDesc}</p>
          <div className="flex gap-2">
            {(Object.entries(localeNames) as [Locale, string][]).map(([code, name]) => (
              <button
                key={code}
                onClick={() => setLocale(code)}
                className={`px-4 py-2 text-sm font-medium rounded-lg border-2 transition-colors ${
                  locale === code
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </section>

        {/* Apparence - en premier */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">{t.settings.appearance}</h3>
          <p className="text-sm text-gray-500 mb-4">{t.settings.appearanceDesc}</p>
          <button onClick={() => setPanel('appearance')} className="flex items-center gap-2 px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700">
            <Palette className="w-4 h-4" /> {t.settings.customizeBtn}
          </button>
        </section>

        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">{t.settings.users}</h3>
          <p className="text-sm text-gray-500 mb-4">{t.settings.usersDesc}</p>
          <button onClick={() => setPanel('users')} className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700">
            {t.settings.manageUsersBtn}
          </button>
        </section>

        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">{t.settings.customFields}</h3>
          <p className="text-sm text-gray-500 mb-4">{t.settings.customFieldsDesc}</p>
          <button onClick={() => setPanel('fields')} className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700">
            {t.settings.configureFieldsBtn}
          </button>
        </section>

        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">{t.settings.thresholds}</h3>
          <p className="text-sm text-gray-500 mb-4">{t.settings.thresholdsDesc}</p>
          <button onClick={() => setPanel('thresholds')} className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700">
            {t.settings.manageThresholdsBtn}
          </button>
        </section>

        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">{t.settings.categories}</h3>
          <p className="text-sm text-gray-500 mb-4">{t.settings.categoriesDesc}</p>
          <button onClick={() => setPanel('categories')} className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700">
            {t.settings.manageCategoriesBtn}
          </button>
        </section>
      </div>

      <AppearancePanel open={panel === 'appearance'} onClose={() => setPanel(null)} />
      <UsersPanel open={panel === 'users'} onClose={() => setPanel(null)} />
      <CustomFieldsPanel open={panel === 'fields'} onClose={() => setPanel(null)} />
      <ThresholdsPanel open={panel === 'thresholds'} onClose={() => setPanel(null)} />
      <CategoriesPanel open={panel === 'categories'} onClose={() => setPanel(null)} />
    </div>
  );
}
