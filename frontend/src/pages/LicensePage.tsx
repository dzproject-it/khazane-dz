import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Key, Shield, ShieldCheck, ShieldX, Copy, Check, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useI18n } from '../contexts/I18nContext';

interface License {
  id: string;
  licenseKey: string;
  plan: 'TRIAL' | 'PRO' | 'ENTERPRISE';
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED';
  maxUsers: number;
  maxProducts: number;
  maxSites: number;
  licensee?: string;
  activatedAt?: string;
  expiresAt: string;
  createdAt: string;
}

interface LicenseLimits {
  plan: 'TRIAL' | 'PRO' | 'ENTERPRISE';
  maxUsers: number;
  maxProducts: number;
  maxSites: number;
  expiresAt: string;
  isValid: boolean;
}

interface LimitCheck {
  allowed: boolean;
  current: number;
  max: number;
}

const PLAN_COLORS = {
  TRIAL: 'bg-yellow-100 text-yellow-800',
  PRO: 'bg-blue-100 text-blue-800',
  ENTERPRISE: 'bg-purple-100 text-purple-800',
};

const STATUS_COLORS = {
  ACTIVE: 'bg-green-100 text-green-800',
  EXPIRED: 'bg-red-100 text-red-800',
  REVOKED: 'bg-gray-100 text-gray-800',
};

export function LicensePage() {
  const { t, locale } = useI18n();
  const queryClient = useQueryClient();
  const [showActivate, setShowActivate] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Form states
  const [activateKey, setActivateKey] = useState('');
  const [activateLicensee, setActivateLicensee] = useState('');

  const labels = {
    fr: {
      title: 'Gestion des licences',
      currentLicense: 'Licence active',
      noLicense: 'Aucune licence active',
      noLicenseDesc: 'Activez une clé de licence pour débloquer toutes les fonctionnalités.',
      plan: 'Plan',
      status: 'Statut',
      licensee: 'Titulaire',
      expiresAt: 'Expire le',
      activatedAt: 'Activée le',
      maxUsers: 'Utilisateurs max',
      maxProducts: 'Produits max',
      maxSites: 'Sites max',
      generate: 'Générer une licence',
      activate: 'Activer une licence',
      licenseKey: 'Clé de licence',
      duration: 'Durée (jours)',
      create: 'Générer',
      activateBtn: 'Activer',
      cancel: 'Annuler',
      revoke: 'Révoquer',
      allLicenses: 'Toutes les licences',
      copied: 'Copié !',
      generateSuccess: 'Licence générée avec succès',
      activateSuccess: 'Licence activée avec succès',
      revokeSuccess: 'Licence révoquée',
      error: 'Une erreur est survenue',
      confirmRevoke: 'Êtes-vous sûr de vouloir révoquer cette licence ?',
      usage: 'Utilisation',
      of: 'sur',
      unlimited: 'Illimité',
      daysLeft: 'jours restants',
      expired: 'Expirée',
      planTrial: 'Essai',
      planPro: 'Professionnel',
      planEnterprise: 'Entreprise',
      planTrialDesc: '14 jours, 2 utilisateurs, 50 produits, 1 site',
      planProDesc: '1 an, 10 utilisateurs, 500 produits, 5 sites',
      planEnterpriseDesc: '1 an, 100 utilisateurs, 10 000 produits, 50 sites',
    },
    en: {
      title: 'License Management',
      currentLicense: 'Active License',
      noLicense: 'No active license',
      noLicenseDesc: 'Activate a license key to unlock all features.',
      plan: 'Plan',
      status: 'Status',
      licensee: 'Licensee',
      expiresAt: 'Expires on',
      activatedAt: 'Activated on',
      maxUsers: 'Max users',
      maxProducts: 'Max products',
      maxSites: 'Max sites',
      generate: 'Generate a license',
      activate: 'Activate a license',
      licenseKey: 'License key',
      duration: 'Duration (days)',
      create: 'Generate',
      activateBtn: 'Activate',
      cancel: 'Cancel',
      revoke: 'Revoke',
      allLicenses: 'All licenses',
      copied: 'Copied!',
      generateSuccess: 'License generated successfully',
      activateSuccess: 'License activated successfully',
      revokeSuccess: 'License revoked',
      error: 'An error occurred',
      confirmRevoke: 'Are you sure you want to revoke this license?',
      usage: 'Usage',
      of: 'of',
      unlimited: 'Unlimited',
      daysLeft: 'days left',
      expired: 'Expired',
      planTrial: 'Trial',
      planPro: 'Professional',
      planEnterprise: 'Enterprise',
      planTrialDesc: '14 days, 2 users, 50 products, 1 site',
      planProDesc: '1 year, 10 users, 500 products, 5 sites',
      planEnterpriseDesc: '1 year, 100 users, 10,000 products, 50 sites',
    },
    ar: {
      title: 'إدارة التراخيص',
      currentLicense: 'الترخيص النشط',
      noLicense: 'لا يوجد ترخيص نشط',
      noLicenseDesc: 'قم بتفعيل مفتاح ترخيص لفتح جميع الميزات.',
      plan: 'الخطة',
      status: 'الحالة',
      licensee: 'المرخص له',
      expiresAt: 'ينتهي في',
      activatedAt: 'تم التفعيل في',
      maxUsers: 'الحد الأقصى للمستخدمين',
      maxProducts: 'الحد الأقصى للمنتجات',
      maxSites: 'الحد الأقصى للمواقع',
      generate: 'إنشاء ترخيص',
      activate: 'تفعيل ترخيص',
      licenseKey: 'مفتاح الترخيص',
      duration: 'المدة (أيام)',
      create: 'إنشاء',
      activateBtn: 'تفعيل',
      cancel: 'إلغاء',
      revoke: 'إلغاء الترخيص',
      allLicenses: 'جميع التراخيص',
      copied: 'تم النسخ!',
      generateSuccess: 'تم إنشاء الترخيص بنجاح',
      activateSuccess: 'تم تفعيل الترخيص بنجاح',
      revokeSuccess: 'تم إلغاء الترخيص',
      error: 'حدث خطأ',
      confirmRevoke: 'هل أنت متأكد أنك تريد إلغاء هذا الترخيص؟',
      usage: 'الاستخدام',
      of: 'من',
      unlimited: 'غير محدود',
      daysLeft: 'أيام متبقية',
      expired: 'منتهي',
      planTrial: 'تجريبي',
      planPro: 'احترافي',
      planEnterprise: 'مؤسسة',
      planTrialDesc: '14 يومًا، 2 مستخدمين، 50 منتج، موقع واحد',
      planProDesc: 'سنة واحدة، 10 مستخدمين، 500 منتج، 5 مواقع',
      planEnterpriseDesc: 'سنة واحدة، 100 مستخدم، 10,000 منتج، 50 موقعًا',
    },
  };

  const l = labels[locale] || labels.fr;

  // Queries
  const { data: currentLicense, isLoading: loadingCurrent } = useQuery<LicenseLimits | null>({
    queryKey: ['license-current'],
    queryFn: () => api.get('/licensing/current').then((r) => r.data),
  });

  const { data: licenses, isLoading: loadingAll } = useQuery<License[]>({
    queryKey: ['licenses'],
    queryFn: () => api.get('/licensing').then((r) => r.data),
  });

  const { data: usersLimit } = useQuery<LimitCheck>({
    queryKey: ['license-limit-users'],
    queryFn: () => api.get('/licensing/limits/users').then((r) => r.data),
  });

  const { data: productsLimit } = useQuery<LimitCheck>({
    queryKey: ['license-limit-products'],
    queryFn: () => api.get('/licensing/limits/products').then((r) => r.data),
  });

  const { data: sitesLimit } = useQuery<LimitCheck>({
    queryKey: ['license-limit-sites'],
    queryFn: () => api.get('/licensing/limits/sites').then((r) => r.data),
  });

  // Mutations
  const activateMutation = useMutation({
    mutationFn: (data: { licenseKey: string; licensee?: string }) =>
      api.post('/licensing/activate', data).then((r) => r.data),
    onSuccess: () => {
      toast.success(l.activateSuccess);
      queryClient.invalidateQueries({ queryKey: ['license-current'] });
      queryClient.invalidateQueries({ queryKey: ['licenses'] });
      queryClient.invalidateQueries({ queryKey: ['license-limit-users'] });
      queryClient.invalidateQueries({ queryKey: ['license-limit-products'] });
      queryClient.invalidateQueries({ queryKey: ['license-limit-sites'] });
      queryClient.invalidateQueries({ queryKey: ['license-status'] });
      setShowActivate(false);
      setActivateKey('');
      setActivateLicensee('');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || l.error),
  });

  const revokeMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/licensing/${id}/revoke`).then((r) => r.data),
    onSuccess: () => {
      toast.success(l.revokeSuccess);
      queryClient.invalidateQueries({ queryKey: ['licenses'] });
      queryClient.invalidateQueries({ queryKey: ['license-current'] });
    },
    onError: () => toast.error(l.error),
  });

  const copyKey = async (key: string) => {
    await navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const daysLeft = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString(locale === 'ar' ? 'ar-DZ' : locale === 'en' ? 'en-US' : 'fr-FR');

  const UsageBar = ({ current, max, label }: { current: number; max: number; label: string }) => {
    const pct = max > 0 ? Math.min(100, (current / max) * 100) : 0;
    const color = pct > 90 ? 'bg-red-500' : pct > 70 ? 'bg-yellow-500' : 'bg-green-500';
    return (
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">{label}</span>
          <span className="font-medium">{current} {l.of} {max}</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
        </div>
      </div>
    );
  };

  if (loadingCurrent) {
    return <div className="p-8 text-center text-gray-500">{t.common.loading}</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Key className="w-8 h-8 text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900">{l.title}</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowActivate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <ShieldCheck className="w-4 h-4" />
            {l.activate}
          </button>
        </div>
      </div>

      {/* Current License Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{l.currentLicense}</h2>
        {currentLicense ? (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <div>
                <span className="text-sm text-gray-500">{l.plan}</span>
                <div className="mt-1">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${PLAN_COLORS[currentLicense.plan]}`}>
                    {currentLicense.plan === 'TRIAL' ? l.planTrial : currentLicense.plan === 'PRO' ? l.planPro : l.planEnterprise}
                  </span>
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-500">{l.expiresAt}</span>
                <p className="mt-1 font-medium">{formatDate(currentLicense.expiresAt)}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">{l.status}</span>
                <p className="mt-1">
                  {currentLicense.isValid ? (
                    <span className="text-green-600 font-medium flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4" /> {daysLeft(currentLicense.expiresAt)} {l.daysLeft}
                    </span>
                  ) : (
                    <span className="text-red-600 font-medium flex items-center gap-1">
                      <ShieldX className="w-4 h-4" /> {l.expired}
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Usage bars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              {usersLimit && <UsageBar current={usersLimit.current} max={usersLimit.max} label={l.maxUsers} />}
              {productsLimit && <UsageBar current={productsLimit.current} max={productsLimit.max} label={l.maxProducts} />}
              {sitesLimit && <UsageBar current={sitesLimit.current} max={sitesLimit.max} label={l.maxSites} />}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Shield className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-medium">{l.noLicense}</p>
            <p className="text-sm mt-1">{l.noLicenseDesc}</p>
          </div>
        )}
      </div>

      {/* Plan comparison cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { plan: 'TRIAL' as const, name: l.planTrial, desc: l.planTrialDesc, icon: Shield, color: 'border-yellow-300 bg-yellow-50' },
          { plan: 'PRO' as const, name: l.planPro, desc: l.planProDesc, icon: ShieldCheck, color: 'border-blue-300 bg-blue-50' },
          { plan: 'ENTERPRISE' as const, name: l.planEnterprise, desc: l.planEnterpriseDesc, icon: Key, color: 'border-purple-300 bg-purple-50' },
        ].map((p) => (
          <div key={p.plan} className={`rounded-xl border-2 p-4 ${p.color}`}>
            <div className="flex items-center gap-2 mb-2">
              <p.icon className="w-5 h-5" />
              <h3 className="font-semibold">{p.name}</h3>
            </div>
            <p className="text-sm text-gray-600">{p.desc}</p>
          </div>
        ))}
      </div>

      {/* All licenses table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{l.allLicenses}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-start text-xs font-medium text-gray-500 uppercase">{l.licenseKey}</th>
                <th className="px-4 py-3 text-start text-xs font-medium text-gray-500 uppercase">{l.plan}</th>
                <th className="px-4 py-3 text-start text-xs font-medium text-gray-500 uppercase">{l.status}</th>
                <th className="px-4 py-3 text-start text-xs font-medium text-gray-500 uppercase">{l.licensee}</th>
                <th className="px-4 py-3 text-start text-xs font-medium text-gray-500 uppercase">{l.expiresAt}</th>
                <th className="px-4 py-3 text-start text-xs font-medium text-gray-500 uppercase">{l.activatedAt}</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loadingAll ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">{t.common.loading}</td></tr>
              ) : !licenses?.length ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">—</td></tr>
              ) : (
                licenses.map((lic) => (
                  <tr key={lic.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-mono bg-gray-100 px-2 py-0.5 rounded">{lic.licenseKey}</code>
                        <button
                          onClick={() => copyKey(lic.licenseKey)}
                          className="text-gray-400 hover:text-gray-600"
                          title="Copy"
                        >
                          {copiedKey === lic.licenseKey ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PLAN_COLORS[lic.plan]}`}>{lic.plan}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[lic.status]}`}>{lic.status}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{lic.licensee || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatDate(lic.expiresAt)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{lic.activatedAt ? formatDate(lic.activatedAt) : '—'}</td>
                    <td className="px-4 py-3">
                      {lic.status === 'ACTIVE' && (
                        <button
                          onClick={() => {
                            if (confirm(l.confirmRevoke)) revokeMutation.mutate(lic.id);
                          }}
                          className="text-red-400 hover:text-red-600"
                          title={l.revoke}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Activate Modal */}
      {showActivate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowActivate(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">{l.activate}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{l.licenseKey}</label>
                <input
                  value={activateKey}
                  onChange={(e) => setActivateKey(e.target.value.toUpperCase())}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono"
                  placeholder="KHZN-XXXX-XXXX-XXXX"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{l.licensee}</label>
                <input
                  value={activateLicensee}
                  onChange={(e) => setActivateLicensee(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Société ABC"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={() => setShowActivate(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                {l.cancel}
              </button>
              <button
                onClick={() => activateMutation.mutate({ licenseKey: activateKey, licensee: activateLicensee || undefined })}
                disabled={activateMutation.isPending || !activateKey}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {activateMutation.isPending ? '...' : l.activateBtn}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
