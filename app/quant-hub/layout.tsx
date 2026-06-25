import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Quant Hub — 63+ Quantized LLM Models | quantized.uk',
  description:
    'Browse 63+ open-source LLMs including Qwen3 MoE, DeepSeek-V3/R1, Gemma 3, and Llama 4. Per-quant VRAM, speed, and quality data.',
  path: '/quant-hub',
});

export default function QuantHubLayout({ children }: { children: React.ReactNode }) {
  return children;
}