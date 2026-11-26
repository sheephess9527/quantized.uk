import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'LLM VRAM Calculator: What Fits Your GPU? | quantized.uk',
  description: 'Pick a GPU to find local LLMs that fit, or estimate VRAM and RAM for a model at a chosen quant and context. Paste a GGUF link to use its exact size.',
  path: '/tools/vram-calc',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}