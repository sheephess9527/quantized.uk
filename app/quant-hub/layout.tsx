import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Quant Hub — 50+ Quantized LLM Models | quantized.uk',
  description:
    'Browse 50+ open-source LLMs with per-quant VRAM, speed, and quality data. GGUF, AWQ, EXL2, GPTQ variants with Hugging Face links.',
  path: '/quant-hub',
});

export default function QuantHubLayout({ children }: { children: React.ReactNode }) {
  return children;
}