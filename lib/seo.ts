import type { Metadata } from 'next';

export const SITE_URL = 'https://quantized.uk';
export const SITE_NAME = 'quantized.uk';

/** Search engine HTML-tag verification codes (public in page source). */
export const GOOGLE_SITE_VERIFICATION = 'CZnvhc9YKq3-RNY280Bmc8rTje2SAKWtFR_-6dxbkmE';
export const BING_SITE_VERIFICATION = '877CF3677E0C08A6443342CE11C95E22';

const DEFAULT_DESCRIPTION =
  'LLM quantization intelligence — VRAM calculator, 63+ model index, benchmarks, and deployment guides for running AI on consumer hardware.';

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

export function buildVerification(): Metadata['verification'] {
  const google = process.env.GOOGLE_SITE_VERIFICATION ?? GOOGLE_SITE_VERIFICATION;
  const bing = process.env.BING_SITE_VERIFICATION ?? BING_SITE_VERIFICATION;
  return {
    google,
    other: { 'msvalidate.01': bing },
  };
}