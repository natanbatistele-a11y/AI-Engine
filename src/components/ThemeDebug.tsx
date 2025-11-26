import { useEffect, useState } from 'react';

interface ThemeDebugState {
  isDark: boolean;
  background: string;
}

const readThemeState = (): ThemeDebugState => {
  if (typeof document === 'undefined') {
    return { isDark: false, background: '' };
  }
  const isDark = document.documentElement.classList.contains('dark');
  const background =
    typeof window !== 'undefined'
      ? getComputedStyle(document.body).getPropertyValue('--background').trim()
      : '';
  return { isDark, background };
};

export const ThemeDebug = () => {
  if (import.meta.env.PROD) return null;

  const [state, setState] = useState<ThemeDebugState>(() => readThemeState());

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const update = () => setState(readThemeState());

    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    if (typeof window !== 'undefined') {
      window.addEventListener('focus', update);
    }
    return () => {
      observer.disconnect();
      if (typeof window !== 'undefined') {
        window.removeEventListener('focus', update);
      }
    };
  }, []);

  return (
    <div className="fixed bottom-3 left-3 z-[9999] rounded bg-black/70 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-white">
      {state.isDark ? 'dark' : 'light'} bg={state.background || '--'}
    </div>
  );
};
