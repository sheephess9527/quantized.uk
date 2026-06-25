import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Quant Hub — 58+ Quantized LLM Models | quantized.uk',
  description:
    'Browse 58+ open-source LLMs including Qwen3, Gemma 3, and Llama 4. Per-quant VRAM, speed, and quality data with Hugging Face links.',
  path: '/quant-hub',
});

export default function QuantHubLayout({ children }: { children: React.ReactNode }) {
  return children;
}