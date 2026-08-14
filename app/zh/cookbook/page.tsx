import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: '部署 Cookbook — 大模型实战指南 | quantized.uk',
  description: '23 篇实战部署指南：在 RTX 显卡、AMD Radeon、Mac、VPS、Docker 和 WSL2 上运行量化大模型。涵盖 llama.cpp、Ollama、vLLM、ExLlamaV2。',
  path: '/zh/cookbook',
});

export { default } from '../../cookbook/page';
