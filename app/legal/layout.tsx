import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Terms & Disclaimer | quantized.uk',
  description:
    'Terms of use, disclaimer, and trademark notice for quantized.uk — an independent LLM quantization intelligence site.',
  path: '/legal',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}