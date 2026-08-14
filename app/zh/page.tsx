import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'quantized.uk — 本地大模型量化速查',
  description: '大模型量化速查站 —— 显存计算器、79+ 量化模型索引、真机基准测试与部署指南，专为消费级硬件跑大模型而做。',
  path: '/zh',
});

export { default } from '../page';
