import type { Metadata } from 'next';
import { GPU_COUNT } from '@/lib/seo';
import BestHubContent from '@/components/best/BestHubContent';
import { models } from '@/lib/data/models';
import { canonical, defaultRobots, feedAlternates, languageAlternates, ogLocale, OG_IMAGE, SITE_NAME } from '@/lib/seo';

export function generateMetadata(): Metadata {
  const path = '/zh/best';
  const url = canonical(path);
  const title = '按硬件选本地大模型 —— 2026 年推荐 | quantized.uk';
  const description = `8G 到 32G 及 Apple 芯片各该跑什么：每档给出通用、写代码、图像的推荐，由 ${models.length} 个模型、${GPU_COUNT} 张显卡算出。「最佳」指留有余量的最大模型，本站不做任务跑分。`;
  return {
    title,
    description,
    alternates: { canonical: url, languages: languageAlternates(path), ...feedAlternates(path) },
    robots: defaultRobots,
    openGraph: { title, description, url, siteName: SITE_NAME, type: 'website', images: [OG_IMAGE], ...ogLocale(path) },
  };
}

export default function ZhBestHubPage() {
  return <BestHubContent lang="zh" />;
}
