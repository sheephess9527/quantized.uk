import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { ErrorIndexView } from '@/components/errors/ErrorViews';

export const metadata: Metadata = pageMetadata({
  title: 'LLM Error Lookup: llama.cpp, Ollama, ROCm | quantized.uk',
  description: 'CUDA out of memory, unknown model architecture, rocBLAS TensileLibrary, HSA_OVERRIDE_GFX_VERSION and more: quoted from source, with causes and fixes.',
  path: '/errors',
});

export default function ErrorsPage() {
  return <ErrorIndexView />;
}
