import type { Metadata } from 'next';
import BestTierContent from '@/components/best/BestTierContent';
import { JsonLd } from '@/components/seo/JsonLd';
import { models } from '@/lib/data/models';
import { BEST_TIERS, bestPage, bestTierBySlug } from '@/lib/utils/best-page';
import { quantLevelKey } from '@/lib/utils/recommend';
import { canonical, defaultRobots, displayWidth, feedAlternates, fitTitle, languageAlternates, TITLE_LIMIT, ogLocale, pageOgImage, SITE_NAME } from '@/lib/seo';

export function generateStaticParams() {
  return BEST_TIERS.map(t => ({ tier: t.slug }));
}

export function generateMetadata({ params }: { params: { tier: string } }): Metadata {
  const tier = bestTierBySlug(params.tier);
  if (!tier) return { title: 'Not found | quantized.uk' };
  const { picks, fitCount, q4 } = bestPage(tier);
  const label = tier.kind === 'apple' ? 'Apple silicon' : `${tier.vram}GB VRAM`;
  const path = `/best/${params.tier}`;
  const url = canonical(path);
  const chat = picks.find(p => p.useCases.includes('chat'));
  const plainTitle = `Best local LLM for ${label} — ${fitCount} models | quantized.uk`;
  const sizedTitle = q4 ? fitTitle(`Best local LLM for ${label}: up to ${q4.model.paramLabel} at Q4`) : undefined;
  const title = sizedTitle && displayWidth(sizedTitle) <= TITLE_LIMIT ? sizedTitle : plainTitle;
  const description = q4
    ? `How big a model can ${label} run? Comfortably up to ${q4.model.paramLabel} at Q4_K_M (${q4.model.name}, ${q4.totalGB.toFixed(1)} GB). ${fitCount} of ${models.length} models fit at 4K, with picks.`
    : chat
    ? `${chat.model.name} at ${quantLevelKey(chat.quant)} needs ${chat.totalGB.toFixed(1)} GB of ${tier.vram} GB. ${fitCount} of ${models.length} models fit at 4K — picks for chat, coding and images.`
    : `${fitCount} of ${models.length} quantized models fit ${label} at 4K context.`;
  const ogAlt = `Best local LLM for ${label}: ${fitCount} models fit${chat ? `, top pick ${chat.model.name}` : ''} | quantized.uk`;
  return {
    title,
    description,
    alternates: { canonical: url, languages: languageAlternates(path), ...feedAlternates(path) },
    robots: defaultRobots,
    openGraph: { title, description, url, siteName: SITE_NAME, type: 'article', images: [pageOgImage(path, ogAlt)], ...ogLocale(path) },
  };
}

/** Shared with the `/zh` mirror; `lang` keeps the structured data on the right page. */
export default function BestTierPage({
  params,
  lang = 'en',
}: {
  params: { tier: string };
  lang?: 'en' | 'zh';
}) {
  const tier = bestTierBySlug(params.tier);
  if (!tier) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16 text-center">
        <h1 className="text-2xl font-bold text-slate-300">Not found</h1>
      </div>
    );
  }
  const { picks, faqs } = bestPage(tier);
  const path = lang === 'zh' ? `/zh/best/${params.tier}` : `/best/${params.tier}`;
  const label = tier.kind === 'apple' ? (lang === 'zh' ? 'Apple 芯片' : 'Apple silicon') : `${tier.vram}GB`;

  return (
    <>
      {/*
        `ItemList` describes exactly the picks table and nothing else — the
        GPU pages once claimed `numberOfItems: 73` while emitting 30, so the
        count comes from the same array that renders.
      */}
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: lang === 'zh' ? `${label} 能跑的最好的本地大模型` : `Best local LLM for ${label}`,
          url: canonical(path),
          inLanguage: lang === 'zh' ? 'zh-Hans' : 'en',
          numberOfItems: picks.length,
          itemListElement: picks.map((p, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: p.model.name,
            url: canonical(lang === 'zh' ? `/zh/quant-hub/${p.model.id}` : `/quant-hub/${p.model.id}`),
          })),
        }}
      />
      {faqs.length > 0 && (
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            inLanguage: lang === 'zh' ? 'zh-Hans' : 'en',
            mainEntity: faqs.map(f => ({
              '@type': 'Question',
              name: f.q[lang],
              acceptedAnswer: { '@type': 'Answer', text: f.a[lang] },
            })),
          }}
        />
      )}
      <BestTierContent tier={tier} />
    </>
  );
}
