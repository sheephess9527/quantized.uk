import type { Metadata } from 'next';

export const SITE_URL = 'https://quantized.uk';
export const SITE_NAME = 'quantized.uk';

/** Search engine HTML-tag verification codes (public in page source). */
export const GOOGLE_SITE_VERIFICATION = 'CZnvhc9YKq3-RNY280Bmc8rTje2SAKWtFR_-6dxbkmE';
export const BING_SITE_VERIFICATION = '877CF3677E0C08A6443342CE11C95E22';

const DEFAULT_DESCRIPTION =
  'LLM quantization intelligence — VRAM calculator, 71+ model index, benchmarks, and deployment guides for running AI on consumer hardware.';

/** Prefer PNG for social previews (X/LinkedIn often skip SVG). */
export const OG_IMAGE = {
  url: '/og.png',
  width: 1200,
  height: 630,
  alt: 'quantized.uk — Run LLMs on consumer hardware',
};

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
}): Metadata {
  const url = canonical(path);
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: 'website',
      images: [OG_IMAGE],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [OG_IMAGE.url],
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
