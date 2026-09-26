import type { Metadata } from 'next';
import { pageMetadata, MODEL_COUNT, GPU_COUNT } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: `Quant Hub — ${MODEL_COUNT} quantized LLM models | quantized.uk`,
  description:
    `${MODEL_COUNT} open LLMs — Qwen3.8, GPT-OSS, Qwen3-VL, DeepSeek-V3/R1, GLM-4.5-Air, Llama 4 — with per-quant VRAM, speed and quality loss for ${GPU_COUNT} GPUs.`,
  path: '/quant-hub',
});

export default function QuantHubLayout({ children }: { children: React.ReactNode }) {
  return children;
}