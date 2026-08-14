import type { Lang } from './translations';

/**
 * URL is the single source of truth for language.
 *
 * English lives at the root (`/cookbook/foo/`) — those URLs predate this and
 * must never change. Chinese mirrors it under `/zh` (`/zh/cookbook/foo/`).
 * Deriving language from the path (rather than localStorage) is what lets the
 * static export bake Chinese text into the HTML, which is the entire point:
 * a client-only toggle is invisible to crawlers.
 */
export const ZH_PREFIX = '/zh';

export function langFromPathname(pathname: string | null | undefined): Lang {
  if (!pathname) return 'en';
  return pathname === ZH_PREFIX || pathname.startsWith(`${ZH_PREFIX}/`) ? 'zh' : 'en';
}

/** Strip the `/zh` prefix, yielding the canonical English path. */
export function toEnPath(pathname: string): string {
  if (pathname === ZH_PREFIX) return '/';
  if (pathname.startsWith(`${ZH_PREFIX}/`)) return pathname.slice(ZH_PREFIX.length);
  return pathname;
}

/** Add the `/zh` prefix to an English path. */
export function toZhPath(pathname: string): string {
  const en = toEnPath(pathname);
  return en === '/' ? `${ZH_PREFIX}/` : `${ZH_PREFIX}${en}`;
}

export function pathForLang(pathname: string, lang: Lang): string {
  return lang === 'zh' ? toZhPath(pathname) : toEnPath(pathname);
}

/** The other language's URL for the same content — used by the toggle and hreflang. */
export function mirrorPath(pathname: string): string {
  return langFromPathname(pathname) === 'zh' ? toEnPath(pathname) : toZhPath(pathname);
}

/**
 * Prefix an internal href for the current language. Use for links rendered
 * inside components that appear in both trees, so a reader browsing Chinese
 * stays in the Chinese tree.
 */
export function localizeHref(href: string, lang: Lang): string {
  if (lang !== 'zh') return href;
  if (!href.startsWith('/') || href.startsWith(ZH_PREFIX)) return href;
  return toZhPath(href);
}
