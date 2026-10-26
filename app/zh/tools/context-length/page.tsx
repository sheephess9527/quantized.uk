import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: '显卡能开多长上下文：KV 缓存量化对比 | quantized.uk',
  description: '常见显卡和 Mac 上，每个推荐模型能从容开到的最长上下文：默认 fp16 KV 缓存，以及量化为 q8_0、q4_0 后分别能开多长。',
  path: '/zh/tools/context-length',
});

export { default } from '../../../tools/context-length/page';
