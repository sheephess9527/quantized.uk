import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: '关于 | quantized.uk',
  description: '关于 quantized.uk —— 数据来源、方法论与联系方式。',
  path: '/zh/about',
});

export { default } from '../../about/page';
