import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: '条款与免责声明 | quantized.uk',
  description: 'quantized.uk 的使用条款与免责声明。',
  path: '/zh/legal',
});

export { default } from '../../legal/page';
