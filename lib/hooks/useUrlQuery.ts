'use client';

import { useEffect, useState } from 'react';

/**
 * The query string, read after mount.
 *
 * `useSearchParams()` opts its whole subtree out of prerendering in a static
 * export: Next cannot know the query at build time, so the subtree renders as
 * its Suspense fallback and ships **no content** in the HTML. That is what left
 * `/quant-hub/` — the index of all 79 models, the most valuable page on the
 * site — as a 30 KB document with zero headings and zero model names, invisible
 * to crawlers and to anyone without JS.
 *
 * Reading the query after mount instead lets the page prerender in its default,
 * unfiltered state (the full list, indexable) and refine it once JS runs, which
 * is what progressive enhancement is supposed to look like.
 *
 * Returns `null` on the server and on the first client render, so the first
 * client render matches the server output and hydration stays clean.
 */
export function useUrlQuery(): URLSearchParams | null {
  const [params, setParams] = useState<URLSearchParams | null>(null);

  useEffect(() => {
    setParams(new URLSearchParams(window.location.search));
  }, []);

  return params;
}
