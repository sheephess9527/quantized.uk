import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'GGUF Models & VRAM Requirements | quantized.uk',
  description: 'Find GGUF and other quantized model files, compare estimated VRAM by quant, and filter the catalog by model, format or GPU before downloading.',
  path: '/quant-hub',
});

export default function QuantHubLayout({ children }: { children: React.ReactNode }) {
  return children;
}