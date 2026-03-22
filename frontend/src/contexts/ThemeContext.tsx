import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export interface ClientTheme {
  appName: string;
  logoUrl: string;
  primaryHue: number;       // 0-360 teinte HSL
  primarySaturation: number; // 0-100
  accentColor: string;       // couleur secondaire libre
  sidebarStyle: 'light' | 'dark';
}

const defaultTheme: ClientTheme = {
  appName: 'Khazane-DZ',
  logoUrl: '',
  primaryHue: 221,
  primarySaturation: 83,
  accentColor: '#10b981',
  sidebarStyle: 'light',
};

const STORAGE_KEY = 'khazane-client-theme';

function loadTheme(): ClientTheme {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...defaultTheme, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return defaultTheme;
}

function persistTheme(theme: ClientTheme) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(theme));
}

/* Génère la palette primary-50..900 depuis un hue+saturation */
function applyCSS(theme: ClientTheme) {
  const h = theme.primaryHue;
  const s = theme.primarySaturation;
  const root = document.documentElement;
  const shades: [string, number, number][] = [
    ['50', 97, 96],
    ['100', 95, 92],
    ['200', 90, 85],
    ['300', 80, 72],
    ['400', 70, 60],
    ['500', s, 50],
    ['600', s, 42],
    ['700', s, 35],
    ['800', s, 28],
    ['900', s, 22],
  ];
  shades.forEach(([shade, sat, light]) => {
    root.style.setProperty(`--color-primary-${shade}`, `${h} ${sat}% ${light}%`);
  });
  root.style.setProperty('--color-accent', theme.accentColor);
}

interface ThemeContextValue {
  theme: ClientTheme;
  updateTheme: (patch: Partial<ClientTheme>) => void;
  resetTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: defaultTheme,
  updateTheme: () => {},
  resetTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ClientTheme>(loadTheme);

  useEffect(() => {
    applyCSS(theme);
    persistTheme(theme);
  }, [theme]);

  function updateTheme(patch: Partial<ClientTheme>) {
    setTheme((prev) => ({ ...prev, ...patch }));
  }

  function resetTheme() {
    setTheme(defaultTheme);
  }

  return (
    <ThemeContext.Provider value={{ theme, updateTheme, resetTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
