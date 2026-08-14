import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: '大模型对比工具 | quantized.uk',
  description: '并排对比量化大模型的显存占用、推理速度、质量损失与显卡适配情况。',
  path: '/zh/tools/compare',
});

export { default } from '../../../tools/compare/page';
