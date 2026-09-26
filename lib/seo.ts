import type { Metadata } from 'next';
import { toEnPath, toZhPath } from '@/lib/i18n/routing';

import { models } from '@/lib/data/models';
import { gpuDatabase } from '@/lib/data/gpus';

/**
 * The model count, from the index itself.
 *
 * It used to be typed as `79` into six separate files — `lib/seo.ts`, two hub
 * layouts, two homepage metadata blocks and `public/llms.txt` — so a model
 * batch meant editing six strings by hand, and forgetting one left the site
 * advertising a number it no longer had. Anything reader-facing that counts
 * models reads this.
 */
export const MODEL_COUNT = models.length;

/** Same rule as `MODEL_COUNT`: the GPU count was typed into five more strings. */
export const GPU_COUNT = gpuDatabase.length;

export const SITE_URL = 'https://quantized.uk';
export const SITE_NAME = 'quantized.uk';
/** The one contact address on the site — Footer and the 404 page both use it. */
export const FEEDBACK_EMAIL = 'hello@quantized.uk';

/** Search engine HTML-tag verification codes (public in page source). */
export const GOOGLE_SITE_VERIFICATION = 'CZnvhc9YKq3-RNY280Bmc8rTje2SAKWtFR_-6dxbkmE';
export const BING_SITE_VERIFICATION = '877CF3677E0C08A6443342CE11C95E22';

const DEFAULT_DESCRIPTION =
  `LLM quantization intelligence — VRAM calculator, ${MODEL_COUNT}-model index, benchmarks, and deployment guides for running AI on consumer hardware.`;

/** Prefer PNG for social previews (X/LinkedIn often skip SVG). */
export const OG_IMAGE = {
  url: '/og.png',
  width: 1200,
  height: 630,
  alt: 'quantized.uk — Run LLMs on consumer hardware',
};

/**
 * QTZ-026: the five page types that generate their own `opengraph-image.tsx`
 * (GPU, model, guide, `/best/`, format pages) build this by hand instead of
 * letting Next's own image-metadata inference fill it in — inference can only
 * carry the file's one static `alt` export, and "og:image:alt must match what
 * the image shows, not generic copy" is an explicit acceptance criterion here.
 * `path` is the page's own path (e.g. `/gpu/rtx-5090`), no trailing slash.
 */
export function pageOgImage(path: string, alt: string) {
  return { url: `${SITE_URL}${path}/opengraph-image`, width: 1200, height: 630, alt, type: 'image/png' };
}

/** Trailing-slash canonical URL (matches next.config trailingSlash: true). */
export function canonical(path = ''): string {
  if (!path || path === '/') return `${SITE_URL}/`;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${normalized.endsWith('/') ? normalized : `${normalized}/`}`;
}

export const defaultRobots = {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
    'max-image-preview': 'large' as const,
    'max-snippet': -1,
    'max-video-preview': -1,
  },
};

/**
 * hreflang pair for a path in either tree. Google needs both URLs to declare
 * each other, otherwise `/` and `/zh/` look like duplicate content rather than
 * translations. `x-default` points at English.
 */
export function languageAlternates(path = '') {
  return {
    'en': canonical(toEnPath(path || '/')),
    'zh-Hans': canonical(toZhPath(path || '/')),
    'x-default': canonical(toEnPath(path || '/')),
  };
}

/** OG locale for a path — a Chinese page announcing en_GB reads as a mistranslation. */
export function ogLocale(path = '') {
  const isZh = path === '/zh' || path.startsWith('/zh/');
  return {
    locale: isZh ? 'zh_CN' : 'en_GB',
    alternateLocale: isZh ? 'en_GB' : 'zh_CN',
  };
}

/**
 * RSS autodiscovery. Without this the feed exists but no reader can find it —
 * browser extensions and feed clients look for this link tag, not for a URL
 * someone remembered. Each tree advertises its own feed.
 */
export function feedAlternates(path = '') {
  const isZh = path === '/zh' || path.startsWith('/zh/');
  return {
    types: {
      'application/rss+xml': [
        { url: `${SITE_URL}${isZh ? '/zh' : ''}/feed.xml`, title: `${SITE_NAME} — updates` },
      ],
    },
  };
}

const TITLE_LIMIT = 60;

/**
 * The English model-page `<title>` template as two tiers, never a runtime
 * ellipsis — a truncated SERP title reads as broken, and both tiers below
 * cover every model in the index today (checked: the short tier alone is
 * enough, no model needs a data-level `shortName`).
 */
export function modelPageTitle(name: string): string {
  const full = `${name} VRAM & quant guide | quantized.uk`;
  return full.length <= TITLE_LIMIT ? full : `${name} VRAM | quantized.uk`;
}

/**
 * QTZ-029: a legacy model page must say so in its meta description too, not
 * just in the on-page banner — a reader (or an AI answer engine) that only
 * sees the SERP snippet should not be told this is a current pick.
 */
/**
 * What a results page shows of a meta description before truncating it —
 * about 160 Latin characters of width; a CJK character counts as two.
 */
export const DESCRIPTION_BUDGET = 160;

/** Display width: a CJK character is about two Latin ones wide. */
export function displayWidth(text: string): number {
  let w = 0;
  for (const ch of text) w += ch.codePointAt(0)! >= 0x2e80 ? 2 : 1;
  return w;
}

/**
 * Keeps whole sentences while they fit the budget, so a long editorial
 * description loses its later sentences instead of being cut mid-word by the
 * search engine. A first sentence that is itself over budget is kept whole —
 * rewrite that source text rather than truncating it here.
 */
export function fitDescription(text: string, lang: 'en' | 'zh'): string {
  if (displayWidth(text) <= DESCRIPTION_BUDGET) return text;
  const sentences = lang === 'zh' ? text.split(/(?<=[。！？])/) : text.split(/(?<=[.!?])\s+/);
  let out = sentences[0];
  for (const s of sentences.slice(1)) {
    const next = lang === 'zh' ? out + s : `${out} ${s}`;
    if (displayWidth(next) > DESCRIPTION_BUDGET) break;
    out = next;
  }
  return out;
}

/**
 * Appends a computed fact to a description too short to say much — only
 * while the result stays inside the budget. Seed-OSS 36B's page otherwise
 * advertised itself with 37 characters.
 */
export function padDescription(base: string, extra: string, lang: 'en' | 'zh'): string {
  if (displayWidth(base) >= 100) return base;
  const joined = lang === 'zh' ? base + extra : `${base} ${extra}`;
  return displayWidth(joined) <= DESCRIPTION_BUDGET ? joined : base;
}

export function modelPageDescription(description: string, isLegacy: boolean, lang: 'en' | 'zh' = 'en'): string {
  const full = !isLegacy ? description : lang === 'zh' ? `过时型号。${description}` : `Legacy model. ${description}`;
  return fitDescription(full, lang);
}

/**
 * The English cookbook `<title>`. `Cookbook` in the old
 * `{title} | quantized.uk Cookbook` suffix cost 22 characters for a word with
 * no SERP value; dropping it clears every guide but one. `seoTitle` is the
 * escape hatch for that one — a shorter title for the `<title>` tag only, so
 * the visible H1 keeps saying what the guide actually promises.
 */
export function articlePageTitle(article: { title: string; seoTitle?: string }): string {
  return `${article.seoTitle ?? article.title} | quantized.uk`;
}

export function pageMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path = '',
}: {
  title: string;
  description?: string;
  path?: string;
}): Metadata {
  const url = canonical(path);
  description = fitDescription(description, path.startsWith('/zh') ? 'zh' : 'en');
  return {
    title,
    description,
    alternates: { canonical: url, languages: languageAlternates(path), ...feedAlternates(path) },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: 'website',
      images: [OG_IMAGE],
      ...ogLocale(path),
    },
    // No `title`/`description`/`images` under `twitter`: each falls back to
    // this same metadata level's `openGraph` equivalent when omitted. A leaf
    // page under a layout that calls this (quant-hub, cookbook) sets its own
    // `openGraph` but never its own `twitter`, so hardcoding values here would
    // win over the layout chain and show this generic section's title/image
    // instead of the page's own — the same fault the root layout had.
    twitter: {
      card: 'summary_large_image',
    },
    robots: defaultRobots,
  };
}

export function buildVerification(): Metadata['verification'] {
  const google = process.env.GOOGLE_SITE_VERIFICATION ?? GOOGLE_SITE_VERIFICATION;
  const bing = process.env.BING_SITE_VERIFICATION ?? BING_SITE_VERIFICATION;
  return {
    google,
    other: { 'msvalidate.01': bing },
  };
}
