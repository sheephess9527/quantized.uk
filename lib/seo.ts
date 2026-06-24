export const SITE_URL = 'https://quantized.uk';
export const SITE_NAME = 'quantized.uk';

const DEFAULT_DESCRIPTION =
  'LLM quantization intelligence — VRAM calculator, 50+ model index, benchmarks, and deployment guides for running AI on consumer hardware.';

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

export function pageMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path = '',
}: {
  title: string;
  description?: string;
  path?: string;
}): {
  title: string;
  description: string;
  alternates: { canonical: string };
  openGraph: { title: string; description: string; url: string; images: { url: string; width: number; height: number }[] };
  robots: typeof defaultRobots;
} {
  const url = canonical(path);
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      images: [{ url: '/og.svg', width: 1200, height: 630 }],
    },
    robots: defaultRobots,
  };
}

import type { Metadata } from 'next';

export function buildVerification(): Metadata['verification'] {
  const google = process.env.GOOGLE_SITE_VERIFICATION;
  const bing = process.env.BING_SITE_VERIFICATION;
  if (!google && !bing) return undefined;
  return {
    ...(google ? { google } : {}),
    ...(bing ? { other: { 'msvalidate.01': bing } } : {}),
  };
}