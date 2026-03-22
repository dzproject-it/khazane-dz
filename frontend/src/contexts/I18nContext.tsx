import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { translations, type Locale, type Translations } from '../i18n/translations';

const LOCALE_KEY = 'khazane-locale';

function loadLocale(): Locale {
  try {
    const raw = localStorage.getItem(LOCALE_KEY);
    if (raw && (raw === 'fr' || raw === 'en' || raw === 'ar')) return raw;
  } catch { /* ignore */ }
  return 'fr';
}

interface I18nContextValue {
  locale: Locale;
  t: Translations;
  setLocale: (l: Locale) => void;
}

const I18nContext = createContext<I18nContextValue>({
  locale: 'fr',
  t: translations.fr,
  setLocale: () => {},
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(loadLocale);

  useEffect(() => {
    localStorage.setItem(LOCALE_KEY, locale);
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = locale;
  }, [locale]);

  function setLocale(l: Locale) {
    setLocaleState(l);
  }

  const value: I18nContextValue = {
    locale,
    t: translations[locale],
    setLocale,
  };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
