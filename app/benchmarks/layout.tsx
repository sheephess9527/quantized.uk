import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'LLM Quantization Benchmarks | quantized.uk',
  description:
    'Real hardware inference speed and perplexity benchmarks for quantized LLMs on RTX 4090, 3090, 4060 Ti, and Apple Silicon.',
  path: '/benchmarks',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}