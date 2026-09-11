import type { Metadata } from 'next';
import FaqPage from '../../faq/page';
import { models } from '@/lib/data/models';
import { gpuDatabase } from '@/lib/data/gpus';
import { canonical, defaultRobots, feedAlternates, languageAlternates, ogLocale, OG_IMAGE, SITE_NAME } from '@/lib/seo';

export function generateMetadata(): Metadata {
  const path = '/zh/faq';
  const url = canonical(path);
  const title = '本地大模型常见问题 —— 显存、量化与能不能跑 | quantized.uk';
  const description = `下载一个 20GB 的模型文件之前，你会想先问清楚的那些问题：需要多少显存、Q4_K_M 掉多少点、16G 显卡跑不跑得动 24B、你的运行时能读哪种格式。答案全部由 ${models.length} 个模型、${gpuDatabase.length} 张显卡的索引实算得出。`;
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
