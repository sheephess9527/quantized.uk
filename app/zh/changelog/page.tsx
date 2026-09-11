import type { Metadata } from 'next';
import ChangelogView from '@/components/changelog/ChangelogView';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: '数据更新日志 — 模型索引改了什么 | quantized.uk',
  description: '模型索引、显卡数据库与部署指南的每一次更正与新增，按时间倒序 —— 包括此前错在哪里、现在是多少。',
  path: '/zh/changelog/',
});

export default function ZhChangelogPage() {
  return <ChangelogView />;
}
