import type { Metadata } from 'next';
import ToolIndexView from '@/components/tools/ToolIndexView';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Local LLM tools: VRAM calc, CLI gen, compare | quantized.uk',
  description:
    'Four tools for running quantized models locally: estimate VRAM for any model × quant × context, generate a runnable llama.cpp / Ollama / vLLM command, pick a quantization format for your hardware, and compare two models axis by axis.',
  path: '/tools/',
});

export default function ToolIndexPage() {
  return <ToolIndexView />;
}
