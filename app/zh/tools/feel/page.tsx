import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: '感受本地模型速度 | quantized.uk',
  description: '选两张显卡和一个量化档位，按实测或推算速度把同一句话流出来。带宽天花板只标注，不拿来播放。',
  path: '/zh/tools/feel',
});

export { default } from '../../../tools/feel/page';
