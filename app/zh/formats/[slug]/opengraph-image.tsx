import { formatPairs, headToHead, modelsWithFormat, pairBySlug } from '@/lib/utils/format-compare';
import { FORMAT_PAGES, formatById } from '@/lib/utils/format-page';
import { renderOgImage, OG_SIZE } from '@/lib/og/render';

export const alt = 'quantized.uk 格式页';
export const size = OG_SIZE;
export const contentType = 'image/png';

export function generateStaticParams() {
  return [...formatPairs.map(p => ({ slug: p.slug })), ...FORMAT_PAGES.map(f => ({ slug: f.id }))];
}

export default function Image({ params }: { params: { slug: string } }) {
  const single = formatById(params.slug);
  if (single) {
    const owning = modelsWithFormat(single.name).length;
    return renderOgImage({
      eyebrow: '格式',
      title: `${single.name} 详解`,
      stats: [`${single.framework} · ${single.hardwareReq}`],
      footer: `${owning} 个模型支持此格式`,
    });
  }
  const pair = pairBySlug(params.slug);
  if (!pair) {
    return renderOgImage({ eyebrow: '格式', title: '未找到', stats: [] });
  }
  const both = headToHead(pair).length;
  return renderOgImage({
    eyebrow: '格式对比',
    title: `${pair.a.name} vs ${pair.b.name}`,
    stats: [`${both} 个模型同时支持两种格式`],
  });
}
