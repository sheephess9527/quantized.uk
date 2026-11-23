import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: '本地大模型实测速度：RTX 4090、3090 与 Mac 的 tok/s',
  description: 'Llama 3.1 8B、Qwen3 等模型用 llama.cpp、Ollama、ExLlamaV2 和 vLLM 在 RTX 4090、3090、M3 Max 与 M2 Ultra 上的实测速度与显存，另附各量化级别的困惑度。',
  path: '/zh/benchmarks',
});

export { default } from '../../benchmarks/page';
