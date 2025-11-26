import { useEffect, useMemo, useState } from 'react';
import type { ThemeMode } from '../types';
import { THEME_STORAGE_KEY, resolvePreferredTheme } from '../themeBoot';

const isBrowser = typeof window !== 'undefined';

export const useTheme = () => {
  const [theme, setTheme] = useState<ThemeMode>(() => resolvePreferredTheme());

  useEffect(() => {
    if (!isBrowser) return;
    const handler = (event: MediaQueryListEvent) => {
      setTheme(event.matches ? 'dark' : 'light');
    };
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (!isBrowser) return;
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));

  return useMemo(
    () => ({
      theme,
      toggleTheme,
      isDark: theme === 'dark'
    }),
    [theme]
  );
};
