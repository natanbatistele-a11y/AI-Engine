import type { ThemeMode } from './types';

export const THEME_STORAGE_KEY = 'engine-ia-theme';

const isBrowser = typeof window !== 'undefined';

export const resolvePreferredTheme = (): ThemeMode => {
  if (!isBrowser) return 'light';

  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
    if (stored === 'dark' || stored === 'light') {
      return stored;
    }
  } catch {
    // ignore storage failures and fall back to system preference
  }

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
};

export const bootTheme = () => {
  if (typeof document === 'undefined') return;

  try {
    const preferred = resolvePreferredTheme();
    document.documentElement.classList.toggle('dark', preferred === 'dark');
  } catch {
    document.documentElement.classList.remove('dark');
  }
};
