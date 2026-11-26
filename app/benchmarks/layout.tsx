import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Local LLM Quantization Benchmarks | quantized.uk',
  description: 'Compare measured speed and VRAM for local LLM quants on RTX 4090, RTX 3090 and Apple silicon. Filter by hardware, model, runtime or quantization.',
  path: '/benchmarks',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}