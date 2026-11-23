import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'LLM VRAM Calculator: Will It Fit Your GPU? | quantized.uk',
  description:
    'Estimate GPU VRAM and system RAM for local LLMs. Compare model weights and KV cache by quantization and context length, or find models that fit your GPU.',
  path: '/tools/vram-calc',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}