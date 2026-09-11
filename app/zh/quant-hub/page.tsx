import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: '量化模型库 — 81+ 量化大模型 | quantized.uk',
  description: '浏览 81+ 开源大模型，含 Qwen3.8、Ministral 3、GPT-OSS、Qwen3-VL、Qwen3 MoE、DeepSeek-V3/R1、GLM-4.5-Air、Gemma 3、Llama 4。每种量化的显存、速度与质量数据。',
  path: '/zh/quant-hub',
});

export { default } from '../../quant-hub/page';
