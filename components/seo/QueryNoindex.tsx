'use client';

import { useEffect } from 'react';

/**
 * Marks a *filtered* Hub URL `noindex, follow`.
 *
 * The Hub's filters are all URL params, which is what makes a result set
 * shareable — and also what would let 81 models × size × category × hardware ×
 * format × recency generate a combinatorial supply of near-duplicate URLs if a
 * crawler ever started walking them. The canonical tag already points every one
 * of them at `/quant-hub/`; this is the second half of that instruction.
 *
 * **`follow`, never `noindex, nofollow`.** These pages are full of the only
 * links to some model pages, and the point is to keep the crawl while dropping
 * the URL from the index. For the same reason this is not done with
 * `Disallow: /*?*` in robots.txt — a disallowed page is never fetched, so its
 * links are never followed and the calculator's share links would be caught
 * too.
 *
 * A static export serves one document for every query string, so the tag cannot
 * be in the exported `<head>`; it is set after mount instead. The guard is
 * deliberately strict and one-directional: the tag is only ever *added*, only
 * when the URL actually carries a param this page reads, and the element is
 * removed again on unmount. There is no path here that can mark the unfiltered
 * `/quant-hub/` noindex — that would deindex the Hub itself.
 */
const FILTER_PARAMS = ['q', 'size', 'cat', 'hw', 'fmt', 'recency', 'gpu'];

export default function QueryNoindex() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const filtered = FILTER_PARAMS.some(k => (params.get(k) ?? '') !== '');
    if (!filtered) return;

    // Rewrite the existing tag rather than append a second one. Two
    // `meta name="robots"` elements saying different things resolve to the
    // most restrictive, so appending would have worked — but a page asserting
    // both `index` and `noindex` is an instruction nobody should have to
    // resolve by looking up precedence rules.
    const existing = document.head.querySelector('meta[name="robots"]');
    const previous = existing?.getAttribute('content') ?? null;

    if (existing) {
      existing.setAttribute('content', 'noindex, follow');
      existing.setAttribute('data-query-noindex', 'true');
      return () => {
        if (previous !== null) existing.setAttribute('content', previous);
        existing.removeAttribute('data-query-noindex');
      };
    }

    const tag = document.createElement('meta');
    tag.setAttribute('name', 'robots');
    tag.setAttribute('content', 'noindex, follow');
    tag.setAttribute('data-query-noindex', 'true');
    document.head.appendChild(tag);
    return () => {
      tag.remove();
    };
  });

  return null;
}
