import { BEST_TIERS, bestPage, bestTierBySlug } from '@/lib/utils/best-page';
import { quantLevelKey } from '@/lib/utils/recommend';
import { renderOgImage, OG_SIZE } from '@/lib/og/render';

export const alt = 'quantized.uk 按显存推荐页';
export const size = OG_SIZE;
export const contentType = 'image/png';

export function generateStaticParams() {
  return BEST_TIERS.map(t => ({ tier: t.slug }));
}

export default function Image({ params }: { params: { tier: string } }) {
  const tier = bestTierBySlug(params.tier);
  if (!tier) {
    return renderOgImage({ eyebrow: '按显存推荐', title: '未找到', stats: [] });
  }
  const label = tier.kind === 'apple' ? 'Apple 芯片' : `${tier.vram}G 显存`;
  const { picks, fitCount } = bestPage(tier);
  const chat = picks.find(p => p.useCases.includes('chat'));
  return renderOgImage({
    eyebrow: '按显存推荐',
    title: `${label}能跑的最好的本地大模型`,
    stats: [`${fitCount} 个模型可在 4K 上下文下装得下`],
    footer: chat ? `${chat.model.name} · ${quantLevelKey(chat.quant)} · ${chat.totalGB.toFixed(1)} GB` : undefined,
  });
}
