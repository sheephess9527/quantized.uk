import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { ErrorIndexView } from '@/components/errors/ErrorViews';

export const metadata: Metadata = pageMetadata({
  title: 'LLM Error Lookup: KV Cache, CUDA OOM, Ollama, ROCm',
  description: 'Fix “failed to allocate buffer for kv cache,” CUDA out of memory, and other llama.cpp, Ollama and ROCm errors. See what each error means and what to try.',
  path: '/errors',
});

export default function ErrorsPage() {
  return <ErrorIndexView />;
}
