import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: '隐私政策 | quantized.uk',
  description: 'quantized.uk 如何处理访问统计、本地存储、Cookie 与第三方服务：用了哪些统计工具，哪些设置只保存在你的浏览器本地。',
  path: '/zh/privacy',
});

export { default } from '../../privacy/page';
