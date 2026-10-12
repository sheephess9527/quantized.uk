import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: '关于 quantized.uk —— 谁在维护 | quantized.uk',
  description: '关于 quantized.uk：谁在维护、为什么做这个站、数据多久更新一次、数字从哪里来又是怎样算出来的，以及如何联系我们。',
  path: '/zh/about',
});

export { default } from '../../about/page';
