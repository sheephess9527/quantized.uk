import type { Metadata } from 'next';
import GpuIndexView from '@/components/gpu/GpuIndexView';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: '每张显卡能跑什么？— 43 张卡 | quantized.uk',
  description: '选择你的显卡，查看在 4K 上下文下能从容运行的全部量化模型，含最佳量化档位、预估显存与余量。',
  path: '/zh/gpu/',
});

export default function ZhGpuIndexPage() {
  return <GpuIndexView lang="zh" />;
}
