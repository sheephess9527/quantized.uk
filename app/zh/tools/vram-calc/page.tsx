import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: '本地大模型显存计算器：能跑多大？ | quantized.uk',
  description: '按显卡和可用显存估算能跑多大的本地大模型、哪些量化档位能装下。可调整上下文，或粘贴 GGUF 文件链接按实际大小估算。',
  path: '/zh/tools/vram-calc',
});

export { default } from '../../../tools/vram-calc/page';
