import type { Metadata } from 'next';
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
    description: 'VRAM calculator, 63+ quantized models, CLI generator, format wizard.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="bg-bg text-slate-100 font-sans antialiased">
        <SiteJsonLd />
        <Plausible />
        <LanguageProvider>
          <HardwareProfileProvider>
            <Navbar />
            <main className="min-h-screen">{children}</main>
            <Footer />
          </HardwareProfileProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
