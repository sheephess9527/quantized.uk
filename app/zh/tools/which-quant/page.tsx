import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: '该下载哪个量化版本：Q4、Q5 还是 Q8 | quantized.uk',
  description: 'Q4、Q5 还是 Q8？常见显卡和 Mac 上，每个推荐模型所有量化档位在 4K 上下文下的显存，以及能从容装下的最高质量那一档。',
  path: '/zh/tools/which-quant',
});

export { default } from '../../../tools/which-quant/page';
