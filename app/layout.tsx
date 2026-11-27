import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { LanguageProvider } from '@/lib/i18n/context';
import { HardwareProfileProvider } from '@/lib/hardware-profile/context';
import { ThemeProvider } from '@/lib/theme/context';
import SiteChrome from '@/components/layout/SiteChrome';
import { SiteJsonLd } from '@/components/seo/SiteJsonLd';
import { buildVerification, canonical, defaultRobots, feedAlternates, OG_IMAGE } from '@/lib/seo';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'quantized.uk — AI Quantization Intelligence',
  description: 'Bridge the gap between research papers and real-world LLM deployment. VRAM calculator, CLI script generator, quantized model hub, and benchmarks.',
  // No `keywords` here: search engines have not used the tag in over a decade,
  // and it exposed exactly the search intent a site would rather rank for
  // organically. It was still shipping into every page's <head> via this root
  // layout, unnoticed because reading generateMetadata never surfaces what a
  // page inherits from its ancestors — only the rendered HTML does.
  metadataBase: new URL('https://quantized.uk'),
  alternates: { canonical: canonical('/'), ...feedAlternates('/') },
  robots: defaultRobots,
  manifest: '/site.webmanifest',
  applicationName: 'quantized',
  appleWebApp: {
    capable: true,
    title: 'quantized',
    statusBarStyle: 'black-translucent',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: ['/icon.svg'],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  ...(buildVerification() ? { verification: buildVerification() } : {}),
  openGraph: {
    title: 'quantized.uk — AI Quantization Intelligence',
    description: 'Run state-of-the-art LLMs on consumer hardware. VRAM calculator, CLI generator, model hub.',
    type: 'website',
    url: canonical('/'),
    siteName: 'quantized.uk',
    locale: 'en_GB',
    images: [OG_IMAGE],
  },
  // QTZ-026: no `images`, `title` or `description` here — an unset Twitter
  // field falls back to this same metadata level's `openGraph` equivalent.
  // A hardcoded value here doesn't just miss the five page types with their
  // own `opengraph-image.tsx`: every page's `og:title`/`og:description` was
  // already per-page, but `twitter:title`/`twitter:description` pinned to
  // this site-wide default regardless — even the homepage's own Twitter card
  // didn't match its own OpenGraph card.
  twitter: {
    card: 'summary_large_image',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f4f6f9' },
    { media: '(prefers-color-scheme: dark)', color: '#1c2128' },
  ],
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            // Belt and braces for `<html lang>` + zero-FOUC dual theme (`B4` Clean Lab Light
            // `#f4f6f9` / `B1` GitHub Dark Dimmed `#1c2128` / `system` auto). Setting
            // `data-theme` and `colorScheme` synchronously before first paint prevents any
            // white-to-dark or dark-to-white flash across all 1,284 static pages.
            __html: `(function(){try{var p=location.pathname;document.documentElement.lang=(p==='/zh'||p.indexOf('/zh/')===0)?'zh-Hans':'en';var s=localStorage.getItem('qtz-theme');var d=(s==='light'||s==='dark')?s:(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.dataset.theme=d;document.documentElement.style.colorScheme=d;}catch(e){}})();`,
          }}
        />
      </head>
      <body className="bg-bg text-slate-100 font-sans antialiased">
        <SiteJsonLd />
        <ThemeProvider>
          <LanguageProvider>
            <HardwareProfileProvider>
              <SiteChrome>{children}</SiteChrome>
            </HardwareProfileProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
