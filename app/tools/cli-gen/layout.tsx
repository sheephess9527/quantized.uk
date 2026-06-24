import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'CLI Script Generator for LLMs | quantized.uk',
  description:
    'Generate ready-to-run llama.cpp, Ollama, vLLM, and ExLlamaV2 commands for Linux, Mac, Docker, and Docker Compose.',
  path: '/tools/cli-gen',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}