import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: '大模型基准测试：实测速度与显存 | quantized.uk',
  description: 'RTX 4090、RTX 3090、Apple M3 Max 与 M2 Ultra 上的真机实测：推理速度、显存占用与困惑度损失，以及哪些数字是预估、完整的测试方法。',
  path: '/zh/benchmarks',
});

export { default } from '../../benchmarks/page';
