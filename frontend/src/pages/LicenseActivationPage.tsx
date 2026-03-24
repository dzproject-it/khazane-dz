import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { KeyRound, ShieldCheck, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { useI18n } from '../contexts/I18nContext';

const labels = {
  fr: {
    title: 'Activation de la licence',
    subtitle: 'Entrez votre clé de licence pour activer Khazane-DZ',
    licenseKey: 'Clé de licence',
    licensee: 'Nom de l\'entreprise (optionnel)',
    activate: 'Activer la licence',
    activating: 'Activation en cours...',
    success: 'Licence activée avec succès ! Redirection...',
    invalidFormat: 'Format attendu : KHZN-XXXX-XXXX-XXXX',
    contactAdmin: 'Contactez votre administrateur pour obtenir une clé de licence.',
  },
  en: {
    title: 'License Activation',
    subtitle: 'Enter your license key to activate Khazane-DZ',
    licenseKey: 'License key',
    licensee: 'Company name (optional)',
    activate: 'Activate license',
    activating: 'Activating...',
    success: 'License activated successfully! Redirecting...',
    invalidFormat: 'Expected format: KHZN-XXXX-XXXX-XXXX',
    contactAdmin: 'Contact your administrator to get a license key.',
  },
  ar: {
    title: 'تفعيل الترخيص',
    subtitle: 'أدخل مفتاح الترخيص لتفعيل خزنة',
    licenseKey: 'مفتاح الترخيص',
    licensee: 'اسم الشركة (اختياري)',
    activate: 'تفعيل الترخيص',
    activating: 'جارٍ التفعيل...',
    success: 'تم تفعيل الترخيص بنجاح! جارٍ إعادة التوجيه...',
    invalidFormat: 'الصيغة المتوقعة: KHZN-XXXX-XXXX-XXXX',
    contactAdmin: 'تواصل مع المسؤول للحصول على مفتاح ترخيص.',
  },
};

export function LicenseActivationPage() {
  const { locale } = useI18n();
  const queryClient = useQueryClient();
  const l = labels[locale] || labels.fr;

  const [licenseKey, setLicenseKey] = useState('');
  const [licensee, setLicensee] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const keyRegex = /^KHZN-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
  const isValidFormat = keyRegex.test(licenseKey);

  const activateMutation = useMutation({
    mutationFn: (data: { licenseKey: string; licensee?: string }) =>
      api.post('/licensing/activate', data).then((r) => r.data),
    onSuccess: () => {
      setSuccess(true);
      setError('');
      queryClient.invalidateQueries({ queryKey: ['license-status'] });
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Erreur lors de l\'activation');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidFormat) return;
    setError('');
    activateMutation.mutate({
      licenseKey,
      licensee: licensee || undefined,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl mb-4">
            <KeyRound className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Khazane-DZ</h1>
          <p className="text-sm text-gray-500 mt-1">{l.subtitle}</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 text-center">{l.title}</h2>

          {success ? (
            <div className="flex flex-col items-center gap-3 py-6">
              <ShieldCheck className="w-12 h-12 text-green-500" />
              <p className="text-green-700 font-medium text-center">{l.success}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* License Key Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {l.licenseKey}
                </label>
                <input
                  type="text"
                  value={licenseKey}
                  onChange={(e) => setLicenseKey(e.target.value.toUpperCase())}
                  placeholder="KHZN-XXXX-XXXX-XXXX"
                  className={`w-full border rounded-lg px-4 py-3 font-mono text-center text-lg tracking-wider
                    ${licenseKey && !isValidFormat ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-primary-500'}
                    focus:ring-2 focus:border-transparent outline-none transition-all`}
                  autoFocus
                  maxLength={19}
                />
                {licenseKey && !isValidFormat && (
                  <p className="text-xs text-red-500 mt-1">{l.invalidFormat}</p>
                )}
              </div>

              {/* Licensee Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {l.licensee}
                </label>
                <input
                  type="text"
                  value={licensee}
                  onChange={(e) => setLicensee(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 rounded-lg p-3 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={!isValidFormat || activateMutation.isPending}
                className="w-full py-3 bg-primary-600 text-white rounded-lg font-medium
                  hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed
                  transition-colors flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-5 h-5" />
                {activateMutation.isPending ? l.activating : l.activate}
              </button>
            </form>
          )}

          <p className="text-xs text-gray-400 text-center mt-6">{l.contactAdmin}</p>
        </div>
      </div>
    </div>
  );
}
