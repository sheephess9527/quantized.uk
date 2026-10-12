import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: '大模型对比工具 | quantized.uk',
  description: '并排对比两个量化大模型：你设定的上下文下的显存占用、公开的质量损失、推理速度与显卡适配，每一行都注明是估算、公开数据还是规格。',
  path: '/zh/tools/compare',
});

export { default } from '../../../tools/compare/page';
