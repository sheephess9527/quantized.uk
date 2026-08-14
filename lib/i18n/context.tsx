'use client';

import { createContext, useContext, useCallback, ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { translations, Lang } from './translations';
import { langFromPathname, mirrorPath } from './routing';

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

/**
 * Language comes from the URL, not localStorage.
 *
 * `usePathname()` resolves during static prerendering, so `/zh/**` pages ship
 * Chinese text inside the HTML instead of swapping it in after hydration —
 * which is what makes the Chinese edition indexable at all. It also makes a
 * Chinese page shareable: the URL carries the language.
 */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const lang = langFromPathname(pathname);

  const toggleLang = useCallback(() => {
    router.push(mirrorPath(pathname ?? '/'));
  }, [router, pathname]);

  return (
    <LangContext.Provider value={{ lang, t: translations[lang] as typeof translations.en, toggleLang }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LangContext);
}
