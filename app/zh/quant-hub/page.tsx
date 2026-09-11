import type { Metadata } from 'next';
import { pageMetadata, MODEL_COUNT, GPU_COUNT } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: `量化模型库 — ${MODEL_COUNT} 个量化大模型 | quantized.uk`,
  description: `浏览 ${MODEL_COUNT} 个开源大模型，含 Qwen3.8、Ministral 3、GPT-OSS、Qwen3-VL、DeepSeek-V3/R1、GLM-4.5-Air、Llama 4 —— 每种量化的显存、速度与质量损失，并按 ${GPU_COUNT} 张显卡估算。`,
  path: '/zh/quant-hub',
});

export { default } from '../../quant-hub/page';
