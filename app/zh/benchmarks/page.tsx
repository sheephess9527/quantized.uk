import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: '本地大模型量化实测：速度与显存 | quantized.uk',
  description: '比较 RTX 4090、RTX 3090 和 Apple 芯片上的本地大模型实测速度与显存。按硬件、模型、运行时和量化档位筛选。',
  path: '/zh/benchmarks',
});

export { default } from '../../benchmarks/page';
