import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Quant Format Selection Wizard | quantized.uk',
  description:
    'Answer 3 questions and get a personalised GGUF, AWQ, or EXL2 recommendation for your hardware and use case.',
  path: '/tools/format-wizard',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}