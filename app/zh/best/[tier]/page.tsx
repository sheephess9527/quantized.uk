import type { Metadata } from 'next';
import BestTierPage from '../../../best/[tier]/page';
import { models } from '@/lib/data/models';
import { bestPage, bestTierBySlug } from '@/lib/utils/best-page';
import { quantLevelKey } from '@/lib/utils/recommend';
import { canonical, defaultRobots, feedAlternates, languageAlternates, ogLocale, OG_IMAGE, SITE_NAME } from '@/lib/seo';

export { generateStaticParams } from '../../../best/[tier]/page';

export function generateMetadata({ params }: { params: { tier: string } }): Metadata {
  const tier = bestTierBySlug(params.tier);
  if (!tier) return { title: '未找到 | quantized.uk' };
  const { picks, fitCount } = bestPage(tier);
  const label = tier.kind === 'apple' ? 'Apple 芯片' : `${tier.vram}G 显存`;
  const path = `/zh/best/${params.tier}`;
  const url = canonical(path);
  const chat = picks.find(p => p.useCases.includes('chat'));
  const title = `${label}能跑的最好的本地大模型（2026）—— ${fitCount} 个装得下 | quantized.uk`;
  const description = chat
    ? `${chat.model.name} 在 ${quantLevelKey(chat.quant)} 下需要 ${tier.vram} GB 中的 ${chat.totalGB.toFixed(1)} GB。${models.length} 个量化模型中有 ${fitCount} 个能在 4K 上下文下装下 —— 通用、写代码、图像三种用途各自的推荐，附各自的显存需求，以及上下文拉长后哪个会先撑不住。`
    : `${models.length} 个量化模型中有 ${fitCount} 个能在 4K 上下文下装进${label}。`;
  return {
    title,
    description,
    alternates: { canonical: url, languages: languageAlternates(path), ...feedAlternates(path) },
    robots: defaultRobots,
    openGraph: { title, description, url, siteName: SITE_NAME, type: 'article', images: [OG_IMAGE], ...ogLocale(path) },
  };
}

export default function ZhBestTierPage({ params }: { params: { tier: string } }) {
  return <BestTierPage params={params} lang="zh" />;
}
