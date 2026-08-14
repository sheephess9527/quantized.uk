import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: '隐私政策 | quantized.uk',
  description: 'quantized.uk 如何处理访问统计、本地存储、Cookie 与第三方服务。',
  path: '/zh/privacy',
});

export { default } from '../../privacy/page';
