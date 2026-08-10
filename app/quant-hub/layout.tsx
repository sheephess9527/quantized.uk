import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Quant Hub — 79+ Quantized LLM Models | quantized.uk',
  description:
    'Browse 79+ open-source LLMs including GPT-OSS, Qwen3-VL, Qwen3 MoE, DeepSeek-V3/R1, GLM-4.5-Air, Gemma 3, and Llama 4. Per-quant VRAM, speed, and quality data.',
  path: '/quant-hub',
});

export default function QuantHubLayout({ children }: { children: React.ReactNode }) {
  return children;
}