import type { Metadata } from 'next';
import FaqPage from '../../faq/page';
import { models } from '@/lib/data/models';
import { canonical, defaultRobots, feedAlternates, languageAlternates, ogLocale, OG_IMAGE, SITE_NAME } from '@/lib/seo';

export function generateMetadata(): Metadata {
  const path = '/zh/faq';
  const url = canonical(path);
  const title = '本地大模型常见问题 —— 显存、量化与能不能跑 | quantized.uk';
  const description = `下载 20GB 模型前该问清的事：要多少显存、Q4 掉多少点、运行时能读哪种格式 —— 由 ${models.length} 个模型实算。`;
  return {
    title,
    description,
    alternates: { canonical: url, languages: languageAlternates(path), ...feedAlternates(path) },
    robots: defaultRobots,
    openGraph: { title, description, url, siteName: SITE_NAME, type: 'website', images: [OG_IMAGE], ...ogLocale(path) },
  };
}

export default function ZhFaqPage() {
  return <FaqPage lang="zh" />;
}
