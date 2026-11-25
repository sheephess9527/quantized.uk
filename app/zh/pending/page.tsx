import type { Metadata } from 'next';
import PendingView from '@/components/pending/PendingView';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: '已发布但还不能本地跑的模型 | quantized.uk',
  description: '已经公布或发布、但暂时还不能在本地运行的开源模型：权重未放出、llama.cpp 不支持或文件未核对，逐个写明原因和何时收录。',
  path: '/zh/pending/',
});

export default function ZhPendingPage() {
  return <PendingView lang="zh" />;
}
