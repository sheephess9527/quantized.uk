import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { LanguageProvider } from '@/lib/i18n/context';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'quantized.uk — AI Quantization Intelligence',
  description: 'Bridge the gap between research papers and real-world LLM deployment. VRAM calculator, CLI script generator, quantized model hub, and benchmarks.',
  keywords: ['LLM quantization', 'GGUF', 'AWQ', 'EXL2', 'llama.cpp', 'VRAM calculator', 'AI deployment'],
  openGraph: {
    title: 'quantized.uk — AI Quantization Intelligence',
    description: 'Run state-of-the-art LLMs on consumer hardware. VRAM calculator, CLI generator, model hub.',
    type: 'website',
    url: 'https://quantized.uk',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="bg-bg text-slate-100 font-sans antialiased">
        <LanguageProvider>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
