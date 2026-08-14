import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: '大模型量化基准测试 | quantized.uk',
  description: 'RTX 4090 / 3090 / Apple Silicon 真机实测：推理速度、困惑度损失与各量化格式对比矩阵。',
  path: '/zh/benchmarks',
});

export { default } from '../../benchmarks/page';
