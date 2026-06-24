import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms & Disclaimer | quantized.uk',
  description: 'Terms of use, disclaimer, and trademark notice for quantized.uk — an independent LLM quantization intelligence site.',
  openGraph: { title: 'Terms & Disclaimer | quantized.uk' },
  robots: { index: true, follow: true },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}