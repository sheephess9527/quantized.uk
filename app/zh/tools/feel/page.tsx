import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: '感受本地模型速度 | quantized.uk',
  description: '选两张显卡和一个量化档位，按每张卡的实测或推算 token 速度把同一句话并排流出来，直观感受快慢差别。带宽天花板只标注，不拿来播放。',
  path: '/zh/tools/feel',
});

export { default } from '../../../tools/feel/page';
