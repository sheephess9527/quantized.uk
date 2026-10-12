import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'LLM Model Comparison Tool | quantized.uk',
  description: 'Compare two quantized LLMs side by side — VRAM at your context, quality loss, speed and GPU fit, each row labelled estimated, published or spec.',
  path: '/tools/compare',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}