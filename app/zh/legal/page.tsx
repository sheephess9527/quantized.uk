import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: '条款与免责声明 | quantized.uk',
  description: 'quantized.uk 的使用条款与免责声明：站内数字均为仅供规划参考的近似值，本站数据以 CC BY 4.0 授权（不含模型权重），以及商标声明。',
  path: '/zh/legal',
});

export { default } from '../../legal/page';
