import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Benchmarks & Insights | quantized.uk',
  description: 'Real hardware inference speed and perplexity benchmarks for quantized LLMs on RTX 4090, 3090, and Apple Silicon.',
  openGraph: { title: 'LLM Quantization Benchmarks | quantized.uk' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}