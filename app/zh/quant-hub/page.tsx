import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: '量化模型库：查 GGUF 和显存需求 | quantized.uk',
  description: '按模型查找 GGUF 等量化版本、文件来源和预计显存。也可按显卡和量化格式筛选，再查看模型详情与下载入口。',
  path: '/zh/quant-hub',
});

export { default } from '../../quant-hub/page';
