import type { Metadata } from 'next';
import ToolIndexView from '@/components/tools/ToolIndexView';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Local LLM tools: VRAM calc, CLI gen, compare | quantized.uk',
  description:
    'Four tools for local quantized LLMs: a VRAM calculator, a llama.cpp / Ollama / vLLM command generator, a format picker, and a two-model compare.',
  path: '/tools/',
});

export default function ToolIndexPage() {
  return <ToolIndexView />;
}
