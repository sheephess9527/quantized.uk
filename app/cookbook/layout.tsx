import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Deployment Cookbook — LLM Guides | quantized.uk',
  description:
    '22 battle-tested guides for running quantized LLMs on RTX GPUs, Mac, VPS, Docker, and WSL2. llama.cpp, Ollama, vLLM, ExLlamaV2.',
  path: '/cookbook',
});

export default function CookbookLayout({ children }: { children: React.ReactNode }) {
  return children;
}