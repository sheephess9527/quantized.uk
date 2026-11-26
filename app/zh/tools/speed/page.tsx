import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import QuestionPage from '@/components/tools/QuestionPage';

export const metadata: Metadata = pageMetadata({
  title: '本地大模型速度：你的显卡每秒多少 token | quantized.uk',
  description: '常见显卡和 Mac 上，能装下的模型每秒能生成多少 token：按每张卡 llama.cpp 实测跑分缩放的估计值，以及显存带宽决定的上限。',
  path: '/zh/tools/speed',
});

export default function ZhSpeedPage() {
  return <QuestionPage kind="speed" lang="zh" />;
}
