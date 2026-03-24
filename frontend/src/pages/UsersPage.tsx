import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, X, Shield, UserCheck, UserX } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../contexts/I18nContext';
import type { User, UserRole } from '../types';

const ROLE_OPTIONS: { value: UserRole; label: Record<string, string> }[] = [
  { value: 'ADMIN', label: { fr: 'Administrateur', en: 'Administrator', ar: 'مدير' } },
  { value: 'MANAGER', label: { fr: 'Manager', en: 'Manager', ar: 'مشرف' } },
  { value: 'OPERATOR', label: { fr: 'Opérateur', en: 'Operator', ar: 'مشغل' } },
  { value: 'VIEWER', label: { fr: 'Lecteur', en: 'Viewer', ar: 'قارئ' } },
];

const ROLE_BADGE: Record<string, string> = {
  ADMIN: 'bg-red-100 text-red-700',
  MANAGER: 'bg-blue-100 text-blue-700',
  OPERATOR: 'bg-green-100 text-green-700',
  VIEWER: 'bg-gray-100 text-gray-600',
};

const ROLE_DESCRIPTIONS: Record<UserRole, Record<string, string>> = {
  ADMIN: { fr: 'Accès complet : gestion des utilisateurs, paramètres et toutes les données', en: 'Full access: user management, settings and all data', ar: 'وصول كامل: إدارة المستخدمين والإعدادات وجميع البيانات' },
  MANAGER: { fr: 'Lecture des utilisateurs, gestion des produits, mouvements et rapports', en: 'View users, manage products, movements and reports', ar: 'عرض المستخدمين وإدارة المنتجات والحركات والتقارير' },
  OPERATOR: { fr: 'Création de mouvements de stock, lecture des produits', en: 'Create stock movements, view products', ar: 'إنشاء حركات المخزون وعرض المنتجات' },
  VIEWER: { fr: 'Lecture seule sur toutes les données', en: 'Read-only access to all data', ar: 'وصول للقراءة فقط لجميع البيانات' },
};

interface UserFormData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  isActive: boolean;
}

const emptyForm: UserFormData = { name: '', email: '', password: '', role: 'VIEWER', isActive: true };

/* ── Modal générique ── */
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

/* ── Formulaire utilisateur ── */
function UserForm({ form, setForm, onSubmit, isLoading, submitLabel, isEdit, locale }: {
  form: UserFormData;
  setForm: React.Dispatch<React.SetStateAction<UserFormData>>;
  onSubmit: () => void;
  isLoading: boolean;
  submitLabel: string;
  isEdit: boolean;
  locale: string;
}) {
  const labels = {
    fr: { name: 'Nom complet', email: 'Email', password: isEdit ? 'Nouveau mot de passe (laisser vide = inchangé)' : 'Mot de passe', role: 'Rôle', active: 'Compte actif', cancel: 'Annuler', permissions: 'Permissions du rôle' },
    en: { name: 'Full name', email: 'Email', password: isEdit ? 'New password (leave empty = unchanged)' : 'Password', role: 'Role', active: 'Active account', cancel: 'Cancel', permissions: 'Role permissions' },
    ar: { name: 'الاسم الكامل', email: 'البريد الإلكتروني', password: isEdit ? 'كلمة مرور جديدة (اتركها فارغة = بدون تغيير)' : 'كلمة المرور', role: 'الدور', active: 'حساب نشط', cancel: 'إلغاء', permissions: 'صلاحيات الدور' },
  };
  const l = labels[locale as keyof typeof labels] || labels.fr;

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{l.name}</label>
        <input
          required
          type="text"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{l.email}</label>
        <input
          required
          type="email"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{l.password}</label>
        <input
          type="password"
          required={!isEdit}
          minLength={6}
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          placeholder={isEdit ? '••••••' : ''}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{l.role}</label>
        <select
          value={form.role}
          onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as UserRole }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          {ROLE_OPTIONS.map((r) => (
            <option key={r.value} value={r.value}>{r.label[locale] || r.label.fr}</option>
          ))}
        </select>
        <p className="mt-1 text-xs text-gray-500">
          {ROLE_DESCRIPTIONS[form.role]?.[locale] || ROLE_DESCRIPTIONS[form.role]?.fr}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isActive"
          checked={form.isActive}
          onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
        <label htmlFor="isActive" className="text-sm text-gray-700">{l.active}</label>
      </div>
      <div className="flex justify-end gap-3 pt-3 border-t border-gray-200">
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
        >
          {isLoading ? '...' : submitLabel}
        </button>
      </div>
    </form>
  );
}

/* ══════════════ PAGE PRINCIPALE ══════════════ */
export function UsersPage() {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const { locale } = useI18n();
  const [createOpen, setCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<(User & { createdAt?: string }) | null>(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [createForm, setCreateForm] = useState<UserFormData>(emptyForm);
  const [editForm, setEditForm] = useState<UserFormData>(emptyForm);

  const labels = {
    fr: {
      title: 'Gestion des utilisateurs',
      subtitle: 'Créer, modifier et gérer les droits d\'accès des utilisateurs',
      newUser: 'Nouvel utilisateur',
      createTitle: 'Créer un utilisateur',
      editTitle: 'Modifier l\'utilisateur',
      deleteTitle: 'Supprimer l\'utilisateur',
      deleteConfirm: 'Êtes-vous sûr de vouloir supprimer',
      deleteWarning: 'Cette action est irréversible. Toutes les données associées seront supprimées.',
      cancel: 'Annuler',
      delete: 'Supprimer',
      create: 'Créer',
      save: 'Enregistrer',
      name: 'Nom',
      email: 'Email',
      role: 'Rôle',
      status: 'Statut',
      actions: 'Actions',
      active: 'Actif',
      inactive: 'Inactif',
      loading: 'Chargement...',
      noUsers: 'Aucun utilisateur trouvé',
      createSuccess: 'Utilisateur créé avec succès',
      createError: 'Erreur lors de la création',
      updateSuccess: 'Utilisateur modifié avec succès',
      updateError: 'Erreur lors de la modification',
      deleteSuccess: 'Utilisateur supprimé',
      deleteError: 'Erreur lors de la suppression',
      you: '(vous)',
      createdAt: 'Créé le',
    },
    en: {
      title: 'User Management',
      subtitle: 'Create, edit and manage user access rights',
      newUser: 'New user',
      createTitle: 'Create user',
      editTitle: 'Edit user',
      deleteTitle: 'Delete user',
      deleteConfirm: 'Are you sure you want to delete',
      deleteWarning: 'This action is irreversible. All associated data will be deleted.',
      cancel: 'Cancel',
      delete: 'Delete',
      create: 'Create',
      save: 'Save',
      name: 'Name',
      email: 'Email',
      role: 'Role',
      status: 'Status',
      actions: 'Actions',
      active: 'Active',
      inactive: 'Inactive',
      loading: 'Loading...',
      noUsers: 'No users found',
      createSuccess: 'User created successfully',
      createError: 'Error creating user',
      updateSuccess: 'User updated successfully',
      updateError: 'Error updating user',
      deleteSuccess: 'User deleted',
      deleteError: 'Error deleting user',
      you: '(you)',
      createdAt: 'Created on',
    },
    ar: {
      title: 'إدارة المستخدمين',
      subtitle: 'إنشاء وتعديل وإدارة حقوق وصول المستخدمين',
      newUser: 'مستخدم جديد',
      createTitle: 'إنشاء مستخدم',
      editTitle: 'تعديل المستخدم',
      deleteTitle: 'حذف المستخدم',
      deleteConfirm: 'هل أنت متأكد من حذف',
      deleteWarning: 'هذا الإجراء لا رجعة فيه. سيتم حذف جميع البيانات المرتبطة.',
      cancel: 'إلغاء',
      delete: 'حذف',
      create: 'إنشاء',
      save: 'حفظ',
      name: 'الاسم',
      email: 'البريد الإلكتروني',
      role: 'الدور',
      status: 'الحالة',
      actions: 'الإجراءات',
      active: 'نشط',
      inactive: 'غير نشط',
      loading: 'جاري التحميل...',
      noUsers: 'لم يتم العثور على مستخدمين',
      createSuccess: 'تم إنشاء المستخدم بنجاح',
      createError: 'خطأ في إنشاء المستخدم',
      updateSuccess: 'تم تعديل المستخدم بنجاح',
      updateError: 'خطأ في تعديل المستخدم',
      deleteSuccess: 'تم حذف المستخدم',
      deleteError: 'خطأ في حذف المستخدم',
      you: '(أنت)',
      createdAt: 'أُنشئ في',
    },
  };
  const l = labels[locale as keyof typeof labels] || labels.fr;

  const { data, isLoading } = useQuery<{ data: (User & { createdAt?: string })[]; total: number }>({
    queryKey: ['users'],
    queryFn: () => api.get('/users').then((r) => r.data),
  });

  const createMut = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post('/users', body),
    onSuccess: () => {
      toast.success(l.createSuccess);
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setCreateOpen(false);
      setCreateForm(emptyForm);
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || l.createError),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) => api.patch(`/users/${id}`, body),
    onSuccess: () => {
      toast.success(l.updateSuccess);
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setEditUser(null);
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || l.updateError),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => api.delete(`/users/${id}`),
    onSuccess: () => {
      toast.success(l.deleteSuccess);
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setDeleteUser(null);
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || l.deleteError),
  });

  const handleCreate = () => {
    createMut.mutate({
      name: createForm.name,
      email: createForm.email,
      password: createForm.password,
      role: createForm.role,
      isActive: createForm.isActive,
    });
  };

  const handleUpdate = () => {
    if (!editUser) return;
    const body: Record<string, unknown> = {
      name: editForm.name,
      email: editForm.email,
      role: editForm.role,
      isActive: editForm.isActive,
    };
    if (editForm.password) body.password = editForm.password;
    updateMut.mutate({ id: editUser.id, body });
  };

  const openEdit = (u: User & { createdAt?: string }) => {
    setEditUser(u);
    setEditForm({ name: u.name, email: u.email, password: '', role: u.role, isActive: u.isActive });
  };

  const toggleActive = (u: User) => {
    updateMut.mutate({ id: u.id, body: { isActive: !u.isActive } });
  };

  const users = data?.data ?? [];
  const isAdmin = currentUser?.role === 'ADMIN';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{l.title}</h2>
          <p className="text-sm text-gray-500 mt-1">{l.subtitle}</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => { setCreateForm(emptyForm); setCreateOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium"
          >
            <Plus className="w-4 h-4" /> {l.newUser}
          </button>
        )}
      </div>

      {/* Légende des rôles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {ROLE_OPTIONS.map((r) => (
          <div key={r.value} className="bg-white border border-gray-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-4 h-4 text-gray-400" />
              <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${ROLE_BADGE[r.value]}`}>
                {r.label[locale] || r.label.fr}
              </span>
            </div>
            <p className="text-xs text-gray-500">
              {ROLE_DESCRIPTIONS[r.value]?.[locale] || ROLE_DESCRIPTIONS[r.value]?.fr}
            </p>
          </div>
        ))}
      </div>

      {/* Table utilisateurs */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <p className="p-6 text-sm text-gray-500">{l.loading}</p>
        ) : !users.length ? (
          <p className="p-6 text-sm text-gray-500">{l.noUsers}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-left">
                  <th className="px-4 py-3 font-medium text-gray-600">{l.name}</th>
                  <th className="px-4 py-3 font-medium text-gray-600">{l.email}</th>
                  <th className="px-4 py-3 font-medium text-gray-600">{l.role}</th>
                  <th className="px-4 py-3 font-medium text-gray-600">{l.status}</th>
                  <th className="px-4 py-3 font-medium text-gray-600">{l.createdAt}</th>
                  {isAdmin && <th className="px-4 py-3 font-medium text-gray-600 text-right">{l.actions}</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u) => {
                  const isSelf = u.id === currentUser?.id;
                  return (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
                            {u.name?.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-900">
                            {u.name} {isSelf && <span className="text-primary-500 text-xs">{l.you}</span>}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${ROLE_BADGE[u.role] || 'bg-gray-100'}`}>
                          {ROLE_OPTIONS.find((r) => r.value === u.role)?.label[locale] || u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {u.isActive ? (
                          <span className="inline-flex items-center gap-1 text-green-700 text-xs font-medium">
                            <UserCheck className="w-3.5 h-3.5" /> {l.active}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-600 text-xs font-medium">
                            <UserX className="w-3.5 h-3.5" /> {l.inactive}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-DZ' : locale === 'en' ? 'en-GB' : 'fr-FR') : '—'}
                      </td>
                      {isAdmin && (
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEdit(u)}
                              className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-primary-600"
                              title={l.editTitle}
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => toggleActive(u)}
                              className={`p-1.5 rounded hover:bg-gray-100 ${u.isActive ? 'text-gray-500 hover:text-orange-600' : 'text-gray-400 hover:text-green-600'}`}
                              title={u.isActive ? l.inactive : l.active}
                              disabled={isSelf}
                            >
                              {u.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                            </button>
                            {!isSelf && (
                              <button
                                onClick={() => setDeleteUser(u)}
                                className="p-1.5 rounded hover:bg-red-50 text-gray-500 hover:text-red-600"
                                title={l.delete}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Total */}
      {data?.total != null && (
        <p className="mt-3 text-xs text-gray-500">
          {data.total} {locale === 'ar' ? 'مستخدم' : locale === 'en' ? 'user(s)' : 'utilisateur(s)'}
        </p>
      )}

      {/* Modal Création */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title={l.createTitle}>
        <UserForm
          form={createForm}
          setForm={setCreateForm}
          onSubmit={handleCreate}
          isLoading={createMut.isPending}
          submitLabel={l.create}
          isEdit={false}
          locale={locale}
        />
      </Modal>

      {/* Modal Édition */}
      <Modal open={!!editUser} onClose={() => setEditUser(null)} title={l.editTitle}>
        <UserForm
          form={editForm}
          setForm={setEditForm}
          onSubmit={handleUpdate}
          isLoading={updateMut.isPending}
          submitLabel={l.save}
          isEdit={true}
          locale={locale}
        />
      </Modal>

      {/* Modal Suppression */}
      <Modal open={!!deleteUser} onClose={() => setDeleteUser(null)} title={l.deleteTitle}>
        <div className="space-y-4">
          <p className="text-sm text-gray-700">
            {l.deleteConfirm} <strong>{deleteUser?.name}</strong> ({deleteUser?.email}) ?
          </p>
          <p className="text-xs text-red-600">{l.deleteWarning}</p>
          <div className="flex justify-end gap-3 pt-3 border-t border-gray-200">
            <button onClick={() => setDeleteUser(null)} className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
              {l.cancel}
            </button>
            <button
              onClick={() => deleteUser && deleteMut.mutate(deleteUser.id)}
              disabled={deleteMut.isPending}
              className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {deleteMut.isPending ? '...' : l.delete}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
