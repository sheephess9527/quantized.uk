import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { LanguageProvider } from '@/lib/i18n/context';
import { HardwareProfileProvider } from '@/lib/hardware-profile/context';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Plausible from '@/components/analytics/Plausible';
import { SiteJsonLd } from '@/components/seo/JsonLd';
import { buildVerification, canonical, defaultRobots } from '@/lib/seo';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'quantized.uk — AI Quantization Intelligence',
  description: 'Bridge the gap between research papers and real-world LLM deployment. VRAM calculator, CLI script generator, quantized model hub, and benchmarks.',
  keywords: ['LLM quantization', 'GGUF', 'AWQ', 'EXL2', 'llama.cpp', 'VRAM calculator', 'AI deployment'],
  metadataBase: new URL('https://quantized.uk'),
  alternates: { canonical: canonical('/') },
  robots: defaultRobots,
  manifest: '/site.webmanifest',
  applicationName: 'quantized',
  appleWebApp: {
    capable: true,
    title: 'quantized',
    statusBarStyle: 'black-translucent',
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
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
    images: [{ url: '/og.svg', width: 1200, height: 630, alt: 'quantized.uk' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'quantized.uk — AI Quantization Intelligence',
    description: 'VRAM calculator, 67+ quantized models, CLI generator, format wizard.',
  },
};

export const viewport: Viewport = {
  themeColor: '#0a0a0f',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var l=localStorage.getItem('lang');if(l==='zh'||l==='en')document.documentElement.lang=l;}catch(e){}})();`,
          }}
        />
      </head>
      <body className="bg-bg text-slate-100 font-sans antialiased">
        <SiteJsonLd />
        <Plausible />
        <LanguageProvider>
          <HardwareProfileProvider>
            <Navbar />
            <main className="min-h-screen pt-[env(safe-area-inset-top)]">{children}</main>
            <Footer />
          </HardwareProfileProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
