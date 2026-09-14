import { formatPairs, headToHead, modelsWithFormat, pairBySlug } from '@/lib/utils/format-compare';
import { FORMAT_PAGES, formatById } from '@/lib/utils/format-page';
import { renderOgImage, OG_SIZE } from '@/lib/og/render';

export const alt = 'quantized.uk format page';
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
      eyebrow: 'Format',
      title: `${single.name} explained`,
      stats: [`${single.framework} · ${single.hardwareReq}`],
      footer: `${owning} models ship in this format`,
    });
  }
  const pair = pairBySlug(params.slug);
  if (!pair) {
    return renderOgImage({ eyebrow: 'Format', title: 'Not found', stats: [] });
  }
  const both = headToHead(pair).length;
  return renderOgImage({
    eyebrow: 'Format comparison',
    title: `${pair.a.name} vs ${pair.b.name}`,
    stats: [`${both} models ship in both`],
  });
}
