'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type ThemeMode = 'system' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'qtz-theme';
export const LIGHT_THEME_COLOR = '#f4f6f9';
export const DARK_THEME_COLOR = '#1c2128';

interface ThemeContextValue {
  mode: ThemeMode;
  resolvedTheme: ResolvedTheme;
  hydrated: boolean;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  mode: 'system',
  resolvedTheme: 'dark',
  hydrated: false,
  setMode: () => {},
});

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyDocumentTheme(resolved: ResolvedTheme) {
  if (typeof document === 'undefined') return;
  document.documentElement.dataset.theme = resolved;
  document.documentElement.style.colorScheme = resolved;
  const color = resolved === 'light' ? LIGHT_THEME_COLOR : DARK_THEME_COLOR;
  const metas = document.querySelectorAll('meta[name="theme-color"]');
  if (metas.length > 0) {
    metas.forEach(m => {
      if (!m.getAttribute('media')) {
        m.setAttribute('content', color);
      }
    });
  }
  let override = document.querySelector('meta[name="theme-color"][data-qtz-dynamic="1"]');
  if (!override) {
    override = document.createElement('meta');
    override.setAttribute('name', 'theme-color');
    override.setAttribute('data-qtz-dynamic', '1');
    document.head.appendChild(override);
  }
  override.setAttribute('content', color);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('system');
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('dark');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let initialMode: ThemeMode = 'system';
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        initialMode = saved;
      }
    } catch {
      // Ignore storage access errors in restricted webviews.
    }
    const initialResolved = initialMode === 'system' ? getSystemTheme() : initialMode;
    setModeState(initialMode);
    setResolvedTheme(initialResolved);
    applyDocumentTheme(initialResolved);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const sync = () => {
      const nextResolved = mode === 'system' ? (mq.matches ? 'dark' : 'light') : mode;
      setResolvedTheme(nextResolved);
      applyDocumentTheme(nextResolved);
    };
    sync();
    if (mode === 'system') {
      mq.addEventListener('change', sync);
      return () => mq.removeEventListener('change', sync);
    }
  }, [mode, hydrated]);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    try {
      if (next === 'system') {
        localStorage.removeItem(THEME_STORAGE_KEY);
      } else {
        localStorage.setItem(THEME_STORAGE_KEY, next);
      }
    } catch {
      // Ignore storage write errors.
    }
    const resolved = next === 'system' ? getSystemTheme() : next;
    setResolvedTheme(resolved);
    applyDocumentTheme(resolved);
  }, []);

  const value = useMemo(
    () => ({ mode, resolvedTheme, hydrated, setMode }),
    [mode, resolvedTheme, hydrated, setMode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
