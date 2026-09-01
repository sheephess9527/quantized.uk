import type { Metadata } from 'next';
import GpuIndexView from '@/components/gpu/GpuIndexView';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'What can each GPU run? — 43 cards | quantized.uk',
  description:
    'Pick your GPU to see every quantized model that fits it comfortably at 4K context, with the best quant level, estimated VRAM and headroom for each.',
  path: '/gpu/',
});

export default function GpuIndexPage() {
  return <GpuIndexView lang="en" />;
}
