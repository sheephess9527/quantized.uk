import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'About | quantized.uk',
  description:
    'Who maintains quantized.uk, why it exists, how often data is updated, and how to contribute to the open-source LLM quantization reference.',
  path: '/about',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}