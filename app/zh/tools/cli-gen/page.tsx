import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: '大模型 CLI 命令生成器 | quantized.uk',
  description: '一键生成 llama.cpp / Ollama / vLLM / ExLlamaV2 的可运行命令，覆盖 Linux、Mac、Docker 与 Compose。',
  path: '/zh/tools/cli-gen',
});

export { default } from '../../../tools/cli-gen/page';
