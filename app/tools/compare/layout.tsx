import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'LLM Model Comparison Tool | quantized.uk',
  description: 'Side-by-side comparison of quantized LLMs — VRAM, speed, quality, and GPU fit.',
  path: '/tools/compare',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}