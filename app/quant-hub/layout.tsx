import type { Metadata } from 'next';
import { pageMetadata, MODEL_COUNT, GPU_COUNT } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: `Quant Hub — ${MODEL_COUNT} quantized LLM models | quantized.uk`,
  description:
    `Browse ${MODEL_COUNT} open-source LLMs including Qwen3.8, Ministral 3, GPT-OSS, Qwen3-VL, DeepSeek-V3/R1, GLM-4.5-Air and Llama 4 — per-quant VRAM, speed and quality loss, sized for ${GPU_COUNT} GPUs.`,
  path: '/quant-hub',
});

export default function QuantHubLayout({ children }: { children: React.ReactNode }) {
  return children;
}