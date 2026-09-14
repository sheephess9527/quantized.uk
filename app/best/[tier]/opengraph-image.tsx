import { BEST_TIERS, bestPage, bestTierBySlug } from '@/lib/utils/best-page';
import { quantLevelKey } from '@/lib/utils/recommend';
import { renderOgImage, OG_SIZE } from '@/lib/og/render';

export const alt = 'quantized.uk best-by-VRAM page';
export const size = OG_SIZE;
export const contentType = 'image/png';

export function generateStaticParams() {
  return BEST_TIERS.map(t => ({ tier: t.slug }));
}

export default function Image({ params }: { params: { tier: string } }) {
  const tier = bestTierBySlug(params.tier);
  if (!tier) {
    return renderOgImage({ eyebrow: 'Best by VRAM', title: 'Not found', stats: [] });
  }
  const label = tier.kind === 'apple' ? 'Apple silicon' : `${tier.vram}GB VRAM`;
  const { picks, fitCount } = bestPage(tier);
  const chat = picks.find(p => p.useCases.includes('chat'));
  return renderOgImage({
    eyebrow: 'Best by VRAM',
    title: `Best local LLM for ${label}`,
    stats: [`${fitCount} models fit at 4K context`],
    footer: chat ? `${chat.model.name} · ${quantLevelKey(chat.quant)} · ${chat.totalGB.toFixed(1)} GB` : undefined,
  });
}
