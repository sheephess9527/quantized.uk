import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { ErrorIndexView } from '@/components/errors/ErrorViews';

export const metadata: Metadata = pageMetadata({
  title: '本地大模型报错速查：llama.cpp、Ollama、ROCm | quantized.uk',
  description: 'CUDA out of memory、unknown model architecture、rocBLAS TensileLibrary、HSA_OVERRIDE_GFX_VERSION 等常见报错：原文逐字核对源码，附含义和解决办法。',
  path: '/zh/errors',
});

export default function ZhErrorsPage() {
  return <ErrorIndexView lang="zh" />;
}
