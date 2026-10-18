import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Feel Local LLM Speed | quantized.uk',
  description:
    'Pick two cards and a quant level and watch one sentence stream at each card\'s measured or scaled token rate. Bandwidth ceilings are labelled, never played.',
  path: '/tools/feel',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
