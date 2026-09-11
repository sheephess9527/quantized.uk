import type { Metadata } from 'next';
import BestTierContent from '@/components/best/BestTierContent';
import { JsonLd } from '@/components/seo/JsonLd';
import { models } from '@/lib/data/models';
import { BEST_TIERS, bestPage, bestTierBySlug } from '@/lib/utils/best-page';
import { quantLevelKey } from '@/lib/utils/recommend';
import { canonical, defaultRobots, feedAlternates, languageAlternates, ogLocale, OG_IMAGE, SITE_NAME } from '@/lib/seo';

export function generateStaticParams() {
  return BEST_TIERS.map(t => ({ tier: t.slug }));
}

export function generateMetadata({ params }: { params: { tier: string } }): Metadata {
  const tier = bestTierBySlug(params.tier);
  if (!tier) return { title: 'Not found | quantized.uk' };
  const { picks, fitCount } = bestPage(tier);
  const label = tier.kind === 'apple' ? 'Apple silicon' : `${tier.vram}GB VRAM`;
  const path = `/best/${params.tier}`;
  const url = canonical(path);
  const chat = picks.find(p => p.useCases.includes('chat'));
  const title = `Best local LLM for ${label} in 2026 — ${fitCount} models that fit | quantized.uk`;
  const description = chat
    ? `${chat.model.name} at ${quantLevelKey(chat.quant)} needs ${chat.totalGB.toFixed(1)} GB of ${tier.vram} GB. ${fitCount} of ${models.length} quantized models fit at 4K context — the picks for general use, coding and images, with what each needs and what breaks when you push context.`
    : `${fitCount} of ${models.length} quantized models fit ${label} at 4K context.`;
  return {
    title,
    description,
    alternates: { canonical: url, languages: languageAlternates(path), ...feedAlternates(path) },
    robots: defaultRobots,
    openGraph: { title, description, url, siteName: SITE_NAME, type: 'article', images: [OG_IMAGE], ...ogLocale(path) },
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
