'use client';

import { createContext, useContext, useCallback, useEffect, ReactNode } from 'react';
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

  // A single root layout serves both trees, so `<html lang>` is emitted as "en"
  // for every page. The static export is patched per tree at build time
  // (scripts/localize-export.mjs); this keeps it correct across client-side
  // navigation, where no fresh document is ever parsed.
  useEffect(() => {
    document.documentElement.lang = lang === 'zh' ? 'zh-Hans' : 'en';
  }, [lang]);

  const toggleLang = useCallback(() => {
    // Hub filters live in the query string (lib/utils/hub-url.ts). Dropping
    // them on a language switch silently resets the reader's view.
    const suffix = typeof window === 'undefined' ? '' : window.location.search + window.location.hash;
    router.push(mirrorPath(pathname ?? '/') + suffix);
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
