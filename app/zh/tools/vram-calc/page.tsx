import type { Metadata } from 'next';
import { pageMetadata, GPU_COUNT } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: '大模型显存 / 内存计算器 | quantized.uk',
  description: `大模型显存计算器：任意模型或 Hugging Face 仓库、混搭多卡、速度、首字等待、并发人数与 QLoRA/LoRA 微调显存，覆盖 ${GPU_COUNT} 张显卡。`,
  path: '/zh/tools/vram-calc',
});

export { default } from '../../../tools/vram-calc/page';
