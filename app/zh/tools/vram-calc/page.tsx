import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: '大模型显存 / 内存计算器 | quantized.uk',
  description: '双向计算：模型→显存，或显卡→能跑哪些模型。覆盖 43 张真实显卡（含 AMD Radeon），支持 KV cache 与上下文长度精算。',
  path: '/zh/tools/vram-calc',
});

export { default } from '../../../tools/vram-calc/page';
