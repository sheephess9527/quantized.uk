'use client';

import { createContext, useContext, useState, useLayoutEffect, useCallback, ReactNode } from 'react';
import { translations, Lang } from './translations';


interface LangContextValue {
  lang: Lang;
  t: typeof translations.en;
  toggleLang: () => void;
}

const LangContext = createContext<LangContextValue>({
  lang: 'en',
  t: translations.en,
  toggleLang: () => {},
});

function readStoredLang(): Lang {
  if (typeof window === 'undefined') return 'en';
  try {
    const stored = localStorage.getItem('lang') as Lang | null;
    if (stored === 'en' || stored === 'zh') return stored;
  } catch {
    /* private browsing */
  }
  return 'en';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('en');

  useLayoutEffect(() => {
    const stored = readStoredLang();
    setLang(stored);
    document.documentElement.lang = stored;
  }, []);

  const toggleLang = useCallback(() => {
    setLang(prev => {
      const next = prev === 'en' ? 'zh' : 'en';
      localStorage.setItem('lang', next);
      document.documentElement.lang = next;
      return next;
    });
  }, []);

  return (
    <LangContext.Provider value={{ lang, t: translations[lang] as typeof translations.en, toggleLang }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LangContext);
}